if (typeof browser === "undefined") {
  globalThis.browser = chrome;
}

const SETTINGS_CONFIG = [
  { id: 'toggle-status',    key: 'hideStatus',    default: true },
  { id: 'toggle-channels',  key: 'hideChannels',  default: true },
  { id: 'toggle-community', key: 'hideCommunity', default: true },
  { id: 'toggle-meta',      key: 'hideMeta',      default: true },
  { id: 'toggle-emojis',    key: 'hideEmojis',    default: false },
  { id: 'toggle-gifs',      key: 'hideGifs',      default: false },
  { id: 'toggle-stickers',  key: 'hideStickers',  default: false },
  { id: 'toggle-advertise', key: 'hideAdvertise', default: false },
  { id: 'toggle-tools',     key: 'hideTools',     default: false },
];

// * Function to update button appearance
function updateButtonStyle(element, isActive) {
  element.closest('.quick-setting').classList.toggle('active', isActive);
}

// * Load settings from storage and set toggles accordingly
const storageKeys = SETTINGS_CONFIG.map(setting => setting.key);
browser.storage.sync.get(storageKeys, (result) => {
  if (browser.runtime.lastError) {
    console.error(`Error retrieving settings: ${browser.runtime.lastError}`);
    return;
  }

  const updatesToStorage = {};

  SETTINGS_CONFIG.forEach(setting => {
    const toggleElement = document.getElementById(setting.id);
    const isSet = result[setting.key] !== undefined;
    const value = isSet ? result[setting.key] : setting.default;

    toggleElement.checked = value;
    updateButtonStyle(toggleElement, value);

    if (!isSet) {
      updatesToStorage[setting.key] = value;
    }
  });

  if (Object.keys(updatesToStorage).length > 0) {
    browser.storage.sync.set(updatesToStorage);
  }
});

// * Update storage and notify the content script when toggles change
SETTINGS_CONFIG.forEach(setting => {
  const toggleElement = document.getElementById(setting.id);
  toggleElement.addEventListener('change', () => {
    const isChecked = toggleElement.checked;
    updateButtonStyle(toggleElement, isChecked);
    browser.storage.sync.set({ [setting.key]: isChecked });
  });
});
