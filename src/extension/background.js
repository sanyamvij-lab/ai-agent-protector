// AI Protector — Manifest V3 Background Service Worker
// Manages navigation inspection, least-privilege link scans, context-menu actions, and local trusted domains.

const DEFAULT_SETTINGS = {
  apiUrl: 'http://localhost:3000',
  authToken: 'test-token-user-a',
  interceptionEnabled: true,
  trustedDomains: ['localhost', '127.0.0.1'],
  recentOverrides: {}, // { [urlHash]: expiryTimestamp }
};

// In-memory cache for the current service worker lifecycle (5 min ttl)
const memoryCache = new Map();

/**
 * Normalizes URL and extracts clean host for domain checks.
 */
function extractHost(urlStr) {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Simple 32-bit hash for fast local keying.
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16);
}

/**
 * Initializes default settings on installation.
 */
chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get(Object.keys(DEFAULT_SETTINGS));
  const toSet = {};
  for (const [key, defaultVal] of Object.entries(DEFAULT_SETTINGS)) {
    if (current[key] === undefined) {
      toSet[key] = defaultVal;
    }
  }
  if (Object.keys(toSet).length > 0) {
    await chrome.storage.local.set(toSet);
  }

  // Create context menus for user-initiated inspection
  try {
    chrome.contextMenus.create({
      id: 'ai-protector-scan-link',
      title: 'Scan Link with AI Protector',
      contexts: ['link'],
    });
    chrome.contextMenus.create({
      id: 'ai-protector-scan-selection',
      title: 'Scan Selection with AI Protector',
      contexts: ['selection'],
    });
  } catch (err) {
    console.warn('Context menu creation warning:', err);
  }
});

/**
 * Evaluates whether a domain is trusted by the user.
 */
function isDomainTrusted(host, trustedDomains) {
  if (!host || !trustedDomains) return false;
  return trustedDomains.some((d) => host === d || host.endsWith('.' + d));
}

/**
 * Performs scan against configured AI Protector API.
 */
async function performScan(targetUrl) {
  const urlHash = hashString(targetUrl);
  const now = Date.now();

  // Check in-memory cache (5 min TTL)
  if (memoryCache.has(urlHash)) {
    const cached = memoryCache.get(urlHash);
    if (now - cached.timestamp < 300000) {
      return cached.data;
    }
  }

  const settings = await chrome.storage.local.get(['apiUrl', 'authToken']);
  const apiUrl = settings.apiUrl || DEFAULT_SETTINGS.apiUrl;
  const authToken = settings.authToken || DEFAULT_SETTINGS.authToken;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${apiUrl}/api/v1/scans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ url: targetUrl }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        status: 'unavailable',
        explanation: `API returned HTTP ${res.status}`,
        category: 'unknown',
        evidence: [],
      };
    }

    const data = await res.json();
    if (data.status !== 'unavailable') {
      memoryCache.set(urlHash, { timestamp: now, data });
    }
    return data;
  } catch (err) {
    return {
      status: 'unavailable',
      explanation: err.name === 'AbortError' ? 'Scan timed out' : 'Could not contact AI Protector backend',
      category: 'unknown',
      evidence: [],
    };
  }
}

/**
 * Navigation Interception Handler (Chromium MV3).
 */
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // 1. Filter: Only top-level window navigation (frameId === 0)
  if (details.frameId !== 0) return;

  const targetUrl = details.url;
  if (!targetUrl) return;

  // 2. Ignore non-HTTP/HTTPS URLs (chrome://, about:, chrome-extension://, file://)
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    return;
  }

  // 3. Ignore our own extension warning pages
  const extensionOrigin = chrome.runtime.getURL('');
  if (targetUrl.startsWith(extensionOrigin)) {
    return;
  }

  const settings = await chrome.storage.local.get(['interceptionEnabled', 'trustedDomains', 'recentOverrides']);
  if (settings.interceptionEnabled === false) {
    return;
  }

  const host = extractHost(targetUrl);

  // 4. Check if domain is trusted
  if (isDomainTrusted(host, settings.trustedDomains)) {
    return;
  }

  // 5. Check if active informed override exists (valid for 15 minutes)
  const urlHash = hashString(targetUrl);
  const now = Date.now();
  const overrides = settings.recentOverrides || {};
  if (overrides[urlHash] && overrides[urlHash] > now) {
    return;
  }

  // 6. Query threat scanner
  const scanResult = await performScan(targetUrl);

  // 7. Route to Interstitial Warning if known_malicious or suspicious
  if (scanResult.status === 'known_malicious' || scanResult.status === 'suspicious') {
    const warningPage = chrome.runtime.getURL('interstitial/warning.html');
    const warningUrl = `${warningPage}?url=${encodeURIComponent(targetUrl)}&scan_id=${encodeURIComponent(
      scanResult.scan_id || ''
    )}&status=${encodeURIComponent(scanResult.status)}&category=${encodeURIComponent(
      scanResult.category || ''
    )}&explanation=${encodeURIComponent(scanResult.explanation || '')}&evidence=${encodeURIComponent(
      JSON.stringify(scanResult.evidence || [])
    )}`;

    chrome.tabs.update(details.tabId, { url: warningUrl });
  } else {
    // Non-hazardous or unavailable: allow navigation, update badge
    const badgeText = scanResult.status === 'no_known_threat' ? 'OK' : scanResult.status === 'unavailable' ? '?' : '';
    chrome.action.setBadgeText({ tabId: details.tabId, text: badgeText });
    chrome.action.setBadgeBackgroundColor({
      tabId: details.tabId,
      color: scanResult.status === 'no_known_threat' ? '#10B981' : '#6B7280',
    });
  }
});

/**
 * Context Menu Click Handler.
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  let targetUrl = '';
  if (info.menuItemId === 'ai-protector-scan-link' && info.linkUrl) {
    targetUrl = info.linkUrl;
  } else if (info.menuItemId === 'ai-protector-scan-selection' && info.selectionText) {
    targetUrl = info.selectionText.trim();
  }

  if (!targetUrl) return;

  const result = await performScan(targetUrl);

  // If flagged, open the interstitial page directly
  if (result.status === 'known_malicious' || result.status === 'suspicious') {
    const warningPage = chrome.runtime.getURL('interstitial/warning.html');
    const warningUrl = `${warningPage}?url=${encodeURIComponent(targetUrl)}&scan_id=${encodeURIComponent(
      result.scan_id || ''
    )}&status=${encodeURIComponent(result.status)}&category=${encodeURIComponent(
      result.category || ''
    )}&explanation=${encodeURIComponent(result.explanation || '')}&evidence=${encodeURIComponent(
      JSON.stringify(result.evidence || [])
    )}`;
    chrome.tabs.create({ url: warningUrl });
  } else {
    // Show notification or alert via action badge
    chrome.action.setBadgeText({ tabId: tab?.id, text: result.status === 'no_known_threat' ? 'OK' : '?' });
    chrome.action.setBadgeBackgroundColor({
      tabId: tab?.id,
      color: result.status === 'no_known_threat' ? '#10B981' : '#6B7280',
    });
  }
});

/**
 * Inter-Component Message Dispatcher.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SCAN_URL') {
    performScan(request.url).then((res) => sendResponse(res));
    return true; // Keep channel open for async response
  }

  if (request.type === 'SET_OVERRIDE') {
    const urlHash = hashString(request.url);
    const expiry = Date.now() + 15 * 60 * 1000; // 15 min session override
    chrome.storage.local.get(['recentOverrides'], (data) => {
      const overrides = data.recentOverrides || {};
      overrides[urlHash] = expiry;
      chrome.storage.local.set({ recentOverrides: overrides }, () => {
        sendResponse({ success: true, expiry });
      });
    });
    return true;
  }

  if (request.type === 'ADD_TRUSTED_DOMAIN') {
    const host = extractHost(request.domain || request.url);
    if (!host) {
      sendResponse({ success: false, error: 'Invalid domain' });
      return;
    }
    chrome.storage.local.get(['trustedDomains'], (data) => {
      const trusted = data.trustedDomains || [];
      if (!trusted.includes(host)) {
        trusted.push(host);
        chrome.storage.local.set({ trustedDomains: trusted }, () => {
          sendResponse({ success: true, trustedDomains: trusted });
        });
      } else {
        sendResponse({ success: true, trustedDomains: trusted });
      }
    });
    return true;
  }
});
