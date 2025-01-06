// Get references to the toggle checkboxes
const toggleStatus = document.getElementById('toggle-status');
const toggleChannels = document.getElementById('toggle-channels');
const toggleCommunity = document.getElementById('toggle-community');

// Load settings from storage and set toggles accordingly
chrome.storage.sync.get(['hideStatus', 'hideChannels', 'hideCommunity'], (result) => {
  toggleStatus.checked = result.hideStatus ?? true; // Default: hide "Status"
  toggleChannels.checked = result.hideChannels ?? true; // Default: hide "Channels"
  toggleCommunity.checked = result.hideCommunity ?? true; // Default: hide "Community"
});

// Update storage and notify the content script when toggles are changed
toggleStatus.addEventListener('change', () => {
  const shouldHideStatus = toggleStatus.checked;
  chrome.storage.sync.set({ hideStatus: shouldHideStatus });

  notifyContentScript({ action: 'toggleStatus', hide: shouldHideStatus });
});

toggleChannels.addEventListener('change', () => {
  const shouldHideChannels = toggleChannels.checked;
  chrome.storage.sync.set({ hideChannels: shouldHideChannels });

  notifyContentScript({ action: 'toggleChannels', hide: shouldHideChannels });
});

toggleCommunity.addEventListener('change', () => {
  const shouldHideCommunity = toggleCommunity.checked;
  chrome.storage.sync.set({ hideCommunity: shouldHideCommunity });

  notifyContentScript({ action: 'toggleCommunity', hide: shouldHideCommunity });
});

// Function to send a message to the content script
function notifyContentScript(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, message);
    }
  });
}