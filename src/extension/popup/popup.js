// AI Protector — Extension Popup Logic
// Inspects active tab, performs quick user-initiated scans, and links to options/dashboard.

document.addEventListener('DOMContentLoaded', async () => {
  const activeDomainEl = document.getElementById('activeDomain');
  const statusDotEl = document.getElementById('statusDot');
  const statusTextEl = document.getElementById('statusText');
  const quickUrlInput = document.getElementById('quickUrlInput');
  const quickScanBtn = document.getElementById('quickScanBtn');
  const quickResultCard = document.getElementById('quickResultCard');
  const openOptionsLink = document.getElementById('openOptionsLink');
  const openDashboardLink = document.getElementById('openDashboardLink');

  // 1. Inspect Current Active Tab
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];

    if (!currentTab || !currentTab.url) {
      activeDomainEl.textContent = 'No active webpage';
      statusTextEl.textContent = 'Idle';
      return;
    }

    const currentUrl = currentTab.url;
    if (!currentUrl.startsWith('http://') && !currentUrl.startsWith('https://')) {
      activeDomainEl.textContent = currentUrl.split(':')[0] + ':// (Internal)';
      statusTextEl.textContent = 'Internal browser view (safe)';
      return;
    }

    const host = new URL(currentUrl).hostname;
    activeDomainEl.textContent = host;

    // Check trusted domains first
    const settings = await chrome.storage.local.get(['trustedDomains', 'apiUrl']);
    const trusted = settings.trustedDomains || [];
    if (trusted.some((d) => host === d || host.endsWith('.' + d))) {
      statusDotEl.className = 'status-dot';
      statusTextEl.textContent = 'Trusted by user configuration';
      return;
    }

    // Query scan result
    statusTextEl.textContent = 'Scanning destination threat status...';
    chrome.runtime.sendMessage({ type: 'SCAN_URL', url: currentUrl }, (res) => {
      if (!res) {
        statusTextEl.textContent = 'Could not inspect link';
        return;
      }

      if (res.status === 'known_malicious') {
        statusDotEl.className = 'status-dot danger';
        statusTextEl.textContent = `Confirmed Threat: ${res.category || 'Malicious'}`;
      } else if (res.status === 'suspicious') {
        statusDotEl.className = 'status-dot warning';
        statusTextEl.textContent = `Suspicious: ${res.category || 'Anomalous'}`;
      } else if (res.status === 'no_known_threat') {
        statusDotEl.className = 'status-dot';
        statusTextEl.textContent = 'No known threat detected';
      } else {
        statusDotEl.className = 'status-dot warning';
        statusTextEl.textContent = 'Status unavailable (not verified)';
      }
    });
  } catch (err) {
    activeDomainEl.textContent = 'Tab inspection error';
    statusTextEl.textContent = 'Permission limited';
  }

  // 2. Quick Scan Button Handler
  quickScanBtn.addEventListener('click', () => {
    const urlToScan = quickUrlInput.value.trim();
    if (!urlToScan) return;

    quickScanBtn.disabled = true;
    quickScanBtn.textContent = '...';
    quickResultCard.className = 'scan-result-card active';
    quickResultCard.innerHTML = '<span style="color:#9CA3AF">Analyzing target against threat engines...</span>';

    chrome.runtime.sendMessage({ type: 'SCAN_URL', url: urlToScan }, (res) => {
      quickScanBtn.disabled = false;
      quickScanBtn.textContent = 'Scan';

      if (!res) {
        quickResultCard.innerHTML = '<span style="color:#EF4444">Scan request failed.</span>';
        return;
      }

      let color = '#10B981';
      if (res.status === 'known_malicious') color = '#EF4444';
      else if (res.status === 'suspicious') color = '#F59E0B';
      else if (res.status === 'unavailable') color = '#9CA3AF';

      quickResultCard.innerHTML = `
        <div style="font-weight:700; color:${color}; margin-bottom:4px;">
          ${res.status.toUpperCase()} (${(res.category || 'none').toUpperCase()})
        </div>
        <div style="color:#D1D5DB; margin-bottom:4px;">${res.explanation || 'Scan complete.'}</div>
        <div style="color:#6B7280; font-size:10px;">${(res.limitations && res.limitations[0]) || ''}</div>
      `;
    });
  });

  // 3. Navigation Links
  openOptionsLink.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  openDashboardLink.addEventListener('click', async () => {
    const settings = await chrome.storage.local.get(['apiUrl']);
    const url = settings.apiUrl || 'http://localhost:3000';
    chrome.tabs.create({ url });
  });
});
