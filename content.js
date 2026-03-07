if (typeof browser === "undefined") {
  globalThis.browser = chrome;
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
    currentSettings[key] = isSet ? Boolean(result[key]) : CONFIG[key].default;
    if (!isSet) {
      updatesToStorage[key] = currentSettings[key];
    }
  });

  if (Object.keys(updatesToStorage).length > 0) {
    browser.storage.sync.set(updatesToStorage);
  }

  // * Observer to handle dynamic DOM changes
  let debounceFrame;
  const observer = new MutationObserver((mutations) => {
    const areNodesAdded = mutations.some(mutation => mutation.addedNodes && mutation.addedNodes.length > 0);
    if (areNodesAdded) {
      if (debounceFrame) cancelAnimationFrame(debounceFrame);
      debounceFrame = requestAnimationFrame(() => {
        updateAllButtons();
      });
    }
  });

  const appNode = document.getElementById('app') || document.body;
  observer.observe(appNode, {
    childList: true,
    subtree: true
  });

  // * Initial visibility update
  updateAllButtons();

  // * Listen for changes in storage to update visibility dynamically
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
      let needsEGSUpdate = false;
      const svgTitles = Array.from(document.querySelectorAll('svg title'));
      Object.keys(changes).forEach(key => {
        if (CONFIG[key]) {
          currentSettings[key] = Boolean(changes[key].newValue);
          updateSettingsGroup(key, svgTitles);
          if (['hideEmojis', 'hideGifs', 'hideStickers'].includes(key)) {
            needsEGSUpdate = true;
          }
        }
      });
      if (needsEGSUpdate) {
        updateEGSButton(svgTitles);
      }
    }
  });
});

function updateAllButtons() {
  const svgTitles = Array.from(document.querySelectorAll('svg title'));
  storageKeys.forEach(key => {
    updateSettingsGroup(key, svgTitles);
  });
  updateEGSButton(svgTitles);
}

function updateSettingsGroup(key, svgTitles) {
  const shouldHide = currentSettings[key];
  const config = CONFIG[key];

  config.selectors.forEach(selector => {
    updateSpecificButton(shouldHide, selector, null, svgTitles);
  });

  config.titles.forEach(title => {
    updateSpecificButton(shouldHide, null, title, svgTitles);
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

function updateEGSButton(svgTitles) {
  const shouldHideEGS = currentSettings.hideEmojis && currentSettings.hideGifs && currentSettings.hideStickers;
  updateSpecificButton(shouldHideEGS, null, titleEGS, svgTitles);
}

// * Dynamically handle parent and update visibility
function updateSpecificButton(shouldHide, query, titleText = null, cachedSvgTitles = null) {
  let element = null;

  if (titleText) {
    const svgTitles = cachedSvgTitles || Array.from(document.querySelectorAll('svg title'));
    const titleNode = svgTitles.find(t => t.textContent === titleText);
    if (titleNode?.parentElement?.parentElement) {
      element = titleNode.parentElement.parentElement;
    }
  }

  if (!element && query) {
    element = document.querySelector(query);
  }

  if (!element) return;

  const button = element.closest('button');
  if (button?.parentElement) {
    let elementToToggle = button.parentElement;
    if (elementToToggle.tagName.toLowerCase() === 'span' && elementToToggle.parentElement) {
      elementToToggle = elementToToggle.parentElement;
    }

    if (titleText === titleEGS && elementToToggle.parentElement) {
      elementToToggle = elementToToggle.parentElement;
    }

    elementToToggle.style.display = shouldHide ? 'none' : 'flex';
  }
}
