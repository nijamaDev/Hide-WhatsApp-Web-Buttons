if (typeof browser === "undefined") {
  var browser = chrome;
}

const CONFIG = {
  hideStatus: {
    selectors: ['span[data-icon="status-outline"]', 'span[data-icon="status-refreshed"]'],
    titles: ['status-refreshed'],
    default: true
  },
  hideChannels: {
    selectors: ['span[data-icon="newsletter-outline"]'],
    titles: ['wds-ic-channels'],
    default: true
  },
  hideCommunity: {
    selectors: ['span[data-icon="community-outline"]', 'span[data-icon="community-refreshed-32"]'],
    titles: ['community-refreshed-32'],
    default: true
  },
  hideMeta: {
    selectors: ['button[aria-label="Meta AI"]'],
    titles: [],
    default: true
  },
  hideEmojis: {
    selectors: [],
    titles: ['ic-mood'],
    default: false
  },
  hideGifs: {
    selectors: [],
    titles: ['gif-refreshed-new'],
    default: false
  },
  hideStickers: {
    selectors: [],
    titles: ['wds-ic-sticker'],
    default: false
  },
  hideAdvertise: {
    selectors: ['span[data-icon="business-advertise-outline"]', 'span[data-icon="megaphone-refreshed-32"]'],
    titles: [],
    default: false
  },
  hideTools: {
    selectors: ['span[data-icon="business-tools-outline"]', 'span[data-icon="storefront"]'],
    titles: [],
    default: false
  }
};

const titleEGS = 'wds-ic-sticker-smiley';
const queryStatusChatCircles = 'svg > circle[fill="none"]';

let currentSettings = {};

// * Load settings
const storageKeys = Object.keys(CONFIG);
browser.storage.sync.get(storageKeys, (result) => {
  if (browser.runtime.lastError) {
    console.error(`Error retrieving settings: ${browser.runtime.lastError}`);
    return;
  }

  const updatesToStorage = {};
  storageKeys.forEach(key => {
    const isSet = result[key] !== undefined;
    currentSettings[key] = isSet ? result[key] : CONFIG[key].default;
    if (!isSet) {
      updatesToStorage[key] = currentSettings[key];
    }
  });

  if (Object.keys(updatesToStorage).length > 0) {
    browser.storage.sync.set(updatesToStorage);
  }

  // * Observer to handle dynamic DOM changes
  const observer = new MutationObserver((mutations) => {
    const areNodesAdded = mutations.some(mutation => mutation.addedNodes && mutation.addedNodes.length > 0);
    if (areNodesAdded) {
      updateAllButtons();
    }
  });

  const appNode = document.getElementById('app') || document.body;
  observer.observe(appNode, {
    childList: true,
    subtree: true
  });

  // * Initial visibility update
  updateAllButtons();

  // * Listen for messages from the popup
  browser.runtime.onMessage.addListener((message) => {
    if (CONFIG[message.action]) {
      currentSettings[message.action] = message.state;
      updateSettingsGroup(message.action);

      // Special handling for EGS group
      if (['hideEmojis', 'hideGifs', 'hideStickers'].includes(message.action)) {
        updateEGSButton();
      }
    }
  });
});

function updateAllButtons() {
  storageKeys.forEach(key => {
    updateSettingsGroup(key);
  });
  updateEGSButton();
}

function updateSettingsGroup(key) {
  const shouldHide = currentSettings[key];
  const config = CONFIG[key];

  config.selectors.forEach(selector => {
    updateSpecificButton(shouldHide, selector);
  });

  config.titles.forEach(title => {
    updateSpecificButton(shouldHide, null, title);
  });

  // Additional functionality for Status chat circles
  if (key === 'hideStatus') {
    const svgElements = document.querySelectorAll(queryStatusChatCircles);
    svgElements.forEach(circle => {
      const svgElement = circle.parentElement;
      if (svgElement) {
        svgElement.style.display = shouldHide ? 'none' : 'flex';
      }
    });
  }
}

function updateEGSButton() {
  const shouldHideEGS = currentSettings.hideEmojis && currentSettings.hideGifs && currentSettings.hideStickers;
  updateSpecificButton(shouldHideEGS, null, titleEGS);
}

// * Dynamically handle parent and update visibility
function updateSpecificButton(shouldHide, query, titleText = null) {
  let element = null;

  if (titleText) {
    const svgTitles = Array.from(document.querySelectorAll('svg title'));
    const titleNode = svgTitles.find(t => t.textContent === titleText);
    if (titleNode?.parentElement?.parentElement) {
      element = titleNode.parentElement.parentElement;
    }
  }

  if (!element && query) {
    element = document.querySelector(query);
  }

  if (!element) return;

  let currentElement = element;
  while (currentElement.parentElement) {
    if (currentElement.tagName.toLowerCase() === 'button') {
      const buttonParent = currentElement.parentElement;
      if (buttonParent) {
        let elementToToggle = buttonParent;
        if (buttonParent.tagName.toLowerCase() === 'span' && buttonParent.parentElement) {
          elementToToggle = buttonParent.parentElement;
        }

        if (titleText === titleEGS && elementToToggle.parentElement) {
          elementToToggle = elementToToggle.parentElement;
        }

        elementToToggle.style.display = shouldHide ? 'none' : 'flex';
      }
      break;
    }
    currentElement = currentElement.parentElement;
  }
}
