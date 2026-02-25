if (typeof browser === "undefined") {
  var browser = chrome;
}

// * Get references to all toggle elements
const toggleStatus =    document.getElementById('toggle-status');
const toggleChannels =  document.getElementById('toggle-channels');
const toggleCommunity = document.getElementById('toggle-community');
const toggleMeta =      document.getElementById('toggle-meta');
const toggleAdvertise = document.getElementById('toggle-advertise');
const toggleTools =     document.getElementById('toggle-tools');
const toggleEmojis =    document.getElementById('toggle-emojis');
const toggleGifs =      document.getElementById('toggle-gifs');
const toggleStickers =  document.getElementById('toggle-stickers');

// * Function to update button appearance
function updateButtonStyle(element, isActive) {
  element.closest('.quick-setting').classList.toggle('active', isActive);
}

// * Function to send messages to the content script
function notifyContentScript(message) {
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      browser.tabs.sendMessage(tabs[0].id, message);
    }
  });
}

// * Load settings from storage and set toggles accordingly
browser.storage.sync.get(
  [
    'hideStatus',
    'hideChannels',
    'hideCommunity',
    'hideMeta',
    'hideAdvertise',
    'hideTools',
    'hideEmojis',
    'hideGifs',
    'hideStickers'
  ], (result) => {
  if (browser.runtime.lastError) {
    console.error(`Error retrieving settings: ${browser.runtime.lastError}`);
    return;
  }
  let hideStatus    = result.hideStatus    ?? true;
  let hideChannels  = result.hideChannels  ?? true;
  let hideCommunity = result.hideCommunity ?? true;
  let hideMeta      = result.hideMeta      ?? true;
  let hideEmojis    = result.hideEmojis    ?? false;
  let hideGifs      = result.hideGifs      ?? false;
  let hideStickers  = result.hideStickers  ?? false;
  let hideAdvertise = result.hideAdvertise ?? false;
  let hideTools     = result.hideTools     ?? false;
  toggleStatus.checked    = hideStatus;
  toggleChannels.checked  = hideChannels;
  toggleCommunity.checked = hideCommunity;
  toggleMeta.checked      = hideMeta;
  toggleAdvertise.checked = hideAdvertise;
  toggleTools.checked     = hideTools;
  toggleEmojis.checked    = hideEmojis;
  toggleGifs.checked      = hideGifs;
  toggleStickers.checked  = hideStickers;

  // * Update initial button styles and set storage defaults if not set
  if (!result.hideStatus)    browser.storage.sync.set({ hideStatus });
  if (!result.hideChannels)  browser.storage.sync.set({ hideChannels });
  if (!result.hideCommunity) browser.storage.sync.set({ hideCommunity });
  if (!result.hideMeta)      browser.storage.sync.set({ hideMeta });
  if (!result.hideAdvertise) browser.storage.sync.set({ hideAdvertise });
  if (!result.hideTools)     browser.storage.sync.set({ hideTools });
  if (!result.hideEmojis)    browser.storage.sync.set({ hideEmojis });
  if (!result.hideGifs)      browser.storage.sync.set({ hideGifs });
  if (!result.hideStickers)  browser.storage.sync.set({ hideStickers });
  updateButtonStyle(toggleStatus, toggleStatus.checked);
  updateButtonStyle(toggleChannels, toggleChannels.checked);
  updateButtonStyle(toggleCommunity, toggleCommunity.checked);
  updateButtonStyle(toggleMeta, toggleMeta.checked);
  updateButtonStyle(toggleAdvertise, toggleAdvertise.checked);
  updateButtonStyle(toggleTools, toggleTools.checked);
  updateButtonStyle(toggleEmojis, toggleEmojis.checked);
  updateButtonStyle(toggleGifs, toggleGifs.checked);
  updateButtonStyle(toggleStickers, toggleStickers.checked);
});

// * Update storage and notify the content script when toggles change
toggleStatus.addEventListener('change', () => {
  const hideStatus = toggleStatus.checked;
  updateButtonStyle(toggleStatus, hideStatus);
  notifyContentScript({ action: 'toggleStatus', state: hideStatus });
  browser.storage.sync.set({ hideStatus });
});

toggleChannels.addEventListener('change', () => {
  const hideChannels = toggleChannels.checked;
  updateButtonStyle(toggleChannels, hideChannels);
  notifyContentScript({ action: 'toggleChannels', state: hideChannels });
  browser.storage.sync.set({ hideChannels });
});

toggleCommunity.addEventListener('change', () => {
  const hideCommunity = toggleCommunity.checked;
  updateButtonStyle(toggleCommunity, hideCommunity);
  notifyContentScript({ action: 'toggleCommunity', state: hideCommunity });
  browser.storage.sync.set({ hideCommunity });
});

toggleMeta.addEventListener('change', () => {
  const hideMeta = toggleMeta.checked;
  updateButtonStyle(toggleMeta, hideMeta);
  notifyContentScript({ action: 'toggleMeta', state: hideMeta });
  browser.storage.sync.set({ hideMeta });
});

toggleAdvertise.addEventListener('change', () => {
  const hideAdvertise = toggleAdvertise.checked;
  updateButtonStyle(toggleAdvertise, hideAdvertise);
  notifyContentScript({ action: 'toggleAdvertise', state: hideAdvertise });
  browser.storage.sync.set({ hideAdvertise });
});

toggleTools.addEventListener('change', () => {
  const hideTools = toggleTools.checked;
  updateButtonStyle(toggleTools, hideTools);
  notifyContentScript({ action: 'toggleTools', state: hideTools });
  browser.storage.sync.set({ hideTools });
});

toggleEmojis.addEventListener('change', () => {
  const hideEmojis = toggleEmojis.checked;
  updateButtonStyle(toggleEmojis, hideEmojis);
  notifyContentScript({ action: 'toggleEmojis', state: hideEmojis });
  browser.storage.sync.set({ hideEmojis });
});

toggleGifs.addEventListener('change', () => {
  const hideGifs = toggleGifs.checked;
  updateButtonStyle(toggleGifs, hideGifs);
  notifyContentScript({ action: 'toggleGifs', state: hideGifs });
  browser.storage.sync.set({ hideGifs });
});

toggleStickers.addEventListener('change', () => {
  const hideStickers = toggleStickers.checked;
  updateButtonStyle(toggleStickers, hideStickers);
  notifyContentScript({ action: 'toggleStickers', state: hideStickers });
  browser.storage.sync.set({ hideStickers });
});
