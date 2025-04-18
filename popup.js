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
  toggleStatus.checked = result.showStatus ?? !result.hideStatus ?? false;
  toggleChannels.checked = result.showChannels ?? !result.hideChannels ?? false;
  toggleCommunity.checked = result.showCommunity ?? !result.hideCommunity ?? false;
  toggleMeta.checked = result.showMeta ?? !result.hideMeta ?? false;
  toggleAdvertise.checked = result.showAdvertise ?? true;
  toggleTools.checked = result.showTools ?? true;

  // Update initial button styles
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