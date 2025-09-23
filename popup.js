if (typeof browser === "undefined") {
  var browser = chrome;
}

// * Get references to all toggle elements
const toggleStatus = document.getElementById('toggle-status');
const toggleChannels = document.getElementById('toggle-channels');
const toggleCommunity = document.getElementById('toggle-community');
const toggleMeta = document.getElementById('toggle-meta');
const toggleAdvertise = document.getElementById('toggle-advertise');
const toggleTools = document.getElementById('toggle-tools');

// * Function to update button appearance
function updateButtonStyle(element, isActive) {
  element.closest('.quick-setting').classList.toggle('active', isActive);
}

// * Load settings from storage and set toggles accordingly
browser.storage.sync.get(['showStatus', 'showChannels', 'showCommunity', 'showMeta', 'showAdvertise', 'showTools'], (result) => {
  if (browser.runtime.lastError) {
    console.error(`Error retrieving settings: ${browser.runtime.lastError}`);
    return;
  }
  toggleStatus.checked    = result.showStatus    ?? false;
  toggleChannels.checked  = result.showChannels  ?? false;
  toggleCommunity.checked = result.showCommunity ?? false;
  toggleMeta.checked      = result.showMeta      ?? false;
  toggleAdvertise.checked = result.showAdvertise ?? true;
  toggleTools.checked     = result.showTools     ?? true;

  // Update initial button styles and set storage defaults if not set
  if (!result.showStatus) browser.storage.sync.set(
    { showStatus: toggleStatus.checked });
  if (!result.showChannels) browser.storage.sync.set(
    { showChannels: toggleChannels.checked });
  if (!result.showCommunity) browser.storage.sync.set(
    { showCommunity: toggleCommunity.checked });
  if (!result.showMeta) browser.storage.sync.set(
    { showMeta: toggleMeta.checked });
  if (!result.showAdvertise) browser.storage.sync.set(
    { showAdvertise: toggleAdvertise.checked });
  if (!result.showTools) browser.storage.sync.set(
    { showTools: toggleTools.checked });
  updateButtonStyle(toggleStatus, toggleStatus.checked);
  updateButtonStyle(toggleChannels, toggleChannels.checked);
  updateButtonStyle(toggleCommunity, toggleCommunity.checked);
  updateButtonStyle(toggleMeta, toggleMeta.checked);
  updateButtonStyle(toggleAdvertise, toggleAdvertise.checked);
  updateButtonStyle(toggleTools, toggleTools.checked);
});

// * Update storage and notify the content script when toggles change
toggleStatus.addEventListener('change', () => {
  const shouldShowStatus = toggleStatus.checked;
  browser.storage.sync.set({ showStatus: shouldShowStatus });
  notifyContentScript({ action: 'toggleStatus', show: shouldShowStatus });
  updateButtonStyle(toggleStatus, shouldShowStatus);
});

toggleChannels.addEventListener('change', () => {
  const shouldShowChannels = toggleChannels.checked;
  browser.storage.sync.set({ showChannels: shouldShowChannels });
  notifyContentScript({ action: 'toggleChannels', show: shouldShowChannels });
  updateButtonStyle(toggleChannels, shouldShowChannels);
});

toggleCommunity.addEventListener('change', () => {
  const shouldShowCommunity = toggleCommunity.checked;
  browser.storage.sync.set({ showCommunity: shouldShowCommunity });
  notifyContentScript({ action: 'toggleCommunity', show: shouldShowCommunity });
  updateButtonStyle(toggleCommunity, shouldShowCommunity);
});

toggleMeta.addEventListener('change', () => {
  const shouldShowMeta = toggleMeta.checked;
  browser.storage.sync.set({ showMeta: shouldShowMeta });
  notifyContentScript({ action: 'toggleMeta', show: shouldShowMeta });
  updateButtonStyle(toggleMeta, shouldShowMeta);
});

toggleAdvertise.addEventListener('change', () => {
  const shouldShowAdvertise = toggleAdvertise.checked;
  browser.storage.sync.set({ showAdvertise: shouldShowAdvertise });
  notifyContentScript({ action: 'toggleAdvertise', show: shouldShowAdvertise });
  updateButtonStyle(toggleAdvertise, shouldShowAdvertise);
});

toggleTools.addEventListener('change', () => {
  const shouldShowTools = toggleTools.checked;
  browser.storage.sync.set({ showTools: shouldShowTools });
  notifyContentScript({ action: 'toggleTools', show: shouldShowTools });
  updateButtonStyle(toggleTools, shouldShowTools);
});

// * Function to send messages to the content script
function notifyContentScript(message) {
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      browser.tabs.sendMessage(tabs[0].id, message);
    }
  });
}