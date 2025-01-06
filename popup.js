if (typeof browser === "undefined") {
  var browser = chrome;
}

// Get references to the toggle checkboxes
const toggleStatus = document.getElementById('toggle-status');
const toggleChannels = document.getElementById('toggle-channels');
const toggleCommunity = document.getElementById('toggle-community');

// Load settings from storage and set toggles accordingly
browser.storage.sync.get(['hideStatus', 'hideChannels', 'hideCommunity'], (result) => {
  toggleStatus.checked = result.hideStatus ?? true;
  toggleChannels.checked = result.hideChannels ?? true;
  toggleCommunity.checked = result.hideCommunity ?? true;
});

// Update storage and notify the content script when toggles change
toggleStatus.addEventListener('change', () => {
  const shouldHideStatus = toggleStatus.checked;
  browser.storage.sync.set({ hideStatus: shouldHideStatus });
  notifyContentScript({ action: 'toggleStatus', hide: shouldHideStatus });
});

toggleChannels.addEventListener('change', () => {
  const shouldHideChannels = toggleChannels.checked;
  browser.storage.sync.set({ hideChannels: shouldHideChannels });
  notifyContentScript({ action: 'toggleChannels', hide: shouldHideChannels });
});

toggleCommunity.addEventListener('change', () => {
  const shouldHideCommunity = toggleCommunity.checked;
  browser.storage.sync.set({ hideCommunity: shouldHideCommunity });
  notifyContentScript({ action: 'toggleCommunity', hide: shouldHideCommunity });
});

// Function to send messages to the content script
function notifyContentScript(message) {
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      browser.tabs.sendMessage(tabs[0].id, message);
    }
  });
}