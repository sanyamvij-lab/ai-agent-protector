// AI Protector — Extension Options Page Logic
// Manages backend API configuration, interception state, and local trusted domains.

document.addEventListener('DOMContentLoaded', async () => {
  const apiUrlInput = document.getElementById('apiUrl');
  const authTokenInput = document.getElementById('authToken');
  const saveApiBtn = document.getElementById('saveApiBtn');
  const saveStatus = document.getElementById('saveStatus');
  const interceptionToggle = document.getElementById('interceptionToggle');
  const newDomainInput = document.getElementById('newDomainInput');
  const addDomainBtn = document.getElementById('addDomainBtn');
  const trustedListEl = document.getElementById('trustedList');

  // Load current settings
  const settings = await chrome.storage.local.get([
    'apiUrl',
    'authToken',
    'interceptionEnabled',
    'trustedDomains',
  ]);

  apiUrlInput.value = settings.apiUrl || 'http://localhost:3000';
  authTokenInput.value = settings.authToken || 'test-token-user-a';
  interceptionToggle.checked = settings.interceptionEnabled !== false;

  let trustedDomains = settings.trustedDomains || ['localhost', '127.0.0.1'];

  function renderTrustedList() {
    trustedListEl.innerHTML = '';
    if (trustedDomains.length === 0) {
      trustedListEl.innerHTML = '<div style="color:#6B7280; font-size:12px;">No trusted domains configured.</div>';
      return;
    }

    trustedDomains.forEach((domain) => {
      const item = document.createElement('div');
      item.className = 'trusted-item';

      const nameSpan = document.createElement('span');
      nameSpan.textContent = domain;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn-remove';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', async () => {
        trustedDomains = trustedDomains.filter((d) => d !== domain);
        await chrome.storage.local.set({ trustedDomains });
        renderTrustedList();
      });

      item.appendChild(nameSpan);
      item.appendChild(removeBtn);
      trustedListEl.appendChild(item);
    });
  }

  renderTrustedList();

  // Save API settings
  saveApiBtn.addEventListener('click', async () => {
    const apiUrl = apiUrlInput.value.trim() || 'http://localhost:3000';
    const authToken = authTokenInput.value.trim();

    await chrome.storage.local.set({ apiUrl, authToken });
    saveStatus.style.display = 'inline';
    setTimeout(() => {
      saveStatus.style.display = 'none';
    }, 2500);
  });

  // Toggle interception
  interceptionToggle.addEventListener('change', async () => {
    await chrome.storage.local.set({ interceptionEnabled: interceptionToggle.checked });
  });

  // Add trusted domain
  addDomainBtn.addEventListener('click', async () => {
    let domain = newDomainInput.value.trim().toLowerCase();
    if (!domain) return;

    // Strip scheme if user pasted full URL
    try {
      if (domain.includes('://')) {
        domain = new URL(domain).hostname;
      }
    } catch {}

    if (!trustedDomains.includes(domain)) {
      trustedDomains.push(domain);
      await chrome.storage.local.set({ trustedDomains });
      newDomainInput.value = '';
      renderTrustedList();
    }
  });
});
