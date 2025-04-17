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
browser.storage.sync.get(['hideStatus', 'hideChannels', 'hideCommunity', 'hideMeta', 'hideAdvertise', 'hideTools'], (result) => {
  toggleStatus.checked = result.hideStatus ?? true;
  toggleChannels.checked = result.hideChannels ?? true;
  toggleCommunity.checked = result.hideCommunity ?? true;
  toggleMeta.checked = result.hideMeta ?? true;
  toggleAdvertise.checked = result.hideAdvertise ?? false;
  toggleTools.checked = result.hideTools ?? false;

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
  const shouldHideStatus = toggleStatus.checked;
  browser.storage.sync.set({ hideStatus: shouldHideStatus });
  notifyContentScript({ action: 'toggleStatus', hide: shouldHideStatus });
  updateButtonStyle(toggleStatus, shouldHideStatus);
});

toggleChannels.addEventListener('change', () => {
  const shouldHideChannels = toggleChannels.checked;
  browser.storage.sync.set({ hideChannels: shouldHideChannels });
  notifyContentScript({ action: 'toggleChannels', hide: shouldHideChannels });
  updateButtonStyle(toggleChannels, shouldHideChannels);
});

toggleCommunity.addEventListener('change', () => {
  const shouldHideCommunity = toggleCommunity.checked;
  browser.storage.sync.set({ hideCommunity: shouldHideCommunity });
  notifyContentScript({ action: 'toggleCommunity', hide: shouldHideCommunity });
  updateButtonStyle(toggleCommunity, shouldHideCommunity);
});

toggleMeta.addEventListener('change', () => {
  const shouldHideMeta = toggleMeta.checked;
  browser.storage.sync.set({ hideMeta: shouldHideMeta });
  notifyContentScript({ action: 'toggleMeta', hide: shouldHideMeta });
  updateButtonStyle(toggleMeta, shouldHideMeta);
});

toggleAdvertise.addEventListener('change', () => {
  const shouldHideAdvertise = toggleAdvertise.checked;
  browser.storage.sync.set({ hideAdvertise: shouldHideAdvertise });
  notifyContentScript({ action: 'toggleAdvertise', hide: shouldHideAdvertise });
  updateButtonStyle(toggleAdvertise, shouldHideAdvertise);
});

toggleTools.addEventListener('change', () => {
  const shouldHideTools = toggleTools.checked;
  browser.storage.sync.set({ hideTools: shouldHideTools });
  notifyContentScript({ action: 'toggleTools', hide: shouldHideTools });
  updateButtonStyle(toggleTools, shouldHideTools);
});

// * Function to send messages to the content script
function notifyContentScript(message) {
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      browser.tabs.sendMessage(tabs[0].id, message);
    }
  });
}