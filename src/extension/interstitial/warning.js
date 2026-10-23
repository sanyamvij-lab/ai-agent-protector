// AI Protector — Interstitial Warning Page Logic
// Parses query parameters, renders evidence, and handles informed override and return to safety.

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const targetUrl = params.get('url') || 'Unknown Destination';
  const status = params.get('status') || 'suspicious';
  const category = params.get('category') || 'threat';
  const explanation = params.get('explanation') || 'This destination has been flagged as high risk.';
  let evidence = [];

  try {
    const rawEvidence = params.get('evidence');
    if (rawEvidence) {
      evidence = JSON.parse(rawEvidence);
    }
  } catch {
    evidence = [];
  }

  // Bind DOM elements
  const targetUrlEl = document.getElementById('targetUrl');
  const warningTitleEl = document.getElementById('warningTitle');
  const statusBadgeEl = document.getElementById('statusBadge');
  const iconBoxEl = document.getElementById('iconBox');
  const explanationEl = document.getElementById('explanationText');
  const evidenceListEl = document.getElementById('evidenceList');
  const returnSafetyBtn = document.getElementById('returnSafetyBtn');
  const toggleOverrideBtn = document.getElementById('toggleOverrideBtn');
  const overridePanel = document.getElementById('overridePanel');
  const proceedOverrideBtn = document.getElementById('proceedOverrideBtn');
  const trustDomainBtn = document.getElementById('trustDomainBtn');

  // Populate basic text
  targetUrlEl.textContent = targetUrl;
  explanationEl.textContent = explanation;

  if (status === 'known_malicious') {
    warningTitleEl.textContent = 'Severe Threat Warning: Confirmed Malicious Destination';
    statusBadgeEl.textContent = `KNOWN MALICIOUS (${category.toUpperCase()})`;
    statusBadgeEl.className = 'badge status-malicious';
    iconBoxEl.className = 'icon-box status-malicious';
    iconBoxEl.textContent = '🚨';
  } else {
    warningTitleEl.textContent = 'Security Alert: Suspicious Destination Intercepted';
    statusBadgeEl.textContent = `SUSPICIOUS (${category.toUpperCase()})`;
    statusBadgeEl.className = 'badge status-suspicious';
    iconBoxEl.className = 'icon-box status-suspicious';
    iconBoxEl.textContent = '⚠️';
  }

  // Render evidence list
  if (evidence.length === 0) {
    const emptyItem = document.createElement('div');
    emptyItem.className = 'evidence-item';
    emptyItem.textContent = 'Specific structural risk patterns triggered local security heuristics.';
    evidenceListEl.appendChild(emptyItem);
  } else {
    evidence.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'evidence-item';

      const header = document.createElement('div');
      header.className = 'evidence-header';

      const typeSpan = document.createElement('span');
      typeSpan.textContent = item.type || 'Detection Flag';

      const timeSpan = document.createElement('span');
      timeSpan.className = 'evidence-source';
      timeSpan.textContent = `Source: ${item.source || 'Engine'} • ${item.observed_at ? new Date(item.observed_at).toLocaleTimeString() : 'Recent'}`;

      header.appendChild(typeSpan);
      header.appendChild(timeSpan);

      const detail = document.createElement('div');
      detail.style.color = '#9CA3AF';
      detail.textContent = item.detail || 'Elevated anomaly signature identified.';

      card.appendChild(header);
      card.appendChild(detail);
      evidenceListEl.appendChild(card);
    });
  }

  // Return to safety handler
  returnSafetyBtn.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'https://www.google.com';
    }
  });

  // Toggle override disclosure panel
  toggleOverrideBtn.addEventListener('click', () => {
    overridePanel.classList.toggle('active');
  });

  // Proceed with Informed Override (15-min temporary bypass)
  proceedOverrideBtn.addEventListener('click', () => {
    const confirmProceed = confirm(
      'Proceeding will temporarily disable protection for this URL for 15 minutes.\n\nNever enter passwords, credit cards, or OTP codes.\n\nDo you want to continue?'
    );
    if (!confirmProceed) return;

    chrome.runtime.sendMessage(
      { type: 'SET_OVERRIDE', url: targetUrl },
      (response) => {
        // Navigate to the target destination
        window.location.href = targetUrl;
      }
    );
  });

  // Trust entire domain permanently
  trustDomainBtn.addEventListener('click', () => {
    try {
      const parsed = new URL(targetUrl);
      const host = parsed.hostname;
      const confirmTrust = confirm(`Add "${host}" to your locally trusted domains?\nAI Protector will not block navigation to this domain in the future.`);
      if (!confirmTrust) return;

      chrome.runtime.sendMessage(
        { type: 'ADD_TRUSTED_DOMAIN', domain: host },
        (res) => {
          window.location.href = targetUrl;
        }
      );
    } catch {
      alert('Could not determine domain for this URL.');
    }
  });
});
