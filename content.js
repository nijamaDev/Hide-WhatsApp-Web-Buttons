if (typeof browser === "undefined") {
  var browser = chrome;
}
const querySelectorStatus = 'span[data-icon="status-outline"]';
const querySelectorStatusNew = 'span[data-icon="status-refreshed"]';
const querySelectorStatusChatCircles = 'svg > circle[fill="none"]';
const querySelectorChannels = 'span[data-icon="newsletter-outline"]';
const querySelectorCommunity = 'span[data-icon="community-outline"]';
const querySelectorCommunityNew = 'span[data-icon="community-refreshed-32"]';
const querySelectorMeta = 'button[aria-label="Meta AI"]';
const querySelectorAdvertise = 'span[data-icon="advertise-outline"]';
const querySelectorTools = 'span[data-icon="tools-outline"]';

// * Default settings
browser.storage.sync.get(['hideStatus', 'hideChannels', 'hideCommunity', 'hideMeta', 'hideAdvertise', 'hideTools'], (result) => {
  let hideStatus = result.hideStatus ?? true;
  let hideChannels = result.hideChannels ?? true;
  let hideCommunity = result.hideCommunity ?? true;
  let hideMeta = result.hideMeta ?? true;
  let hideAdvertise = result.hideAdvertise ?? false;
  let hideTools = result.hideTools ?? false;

  // * Observer to handle dynamic DOM changes
  let observer = new MutationObserver(() => {
    updateButtonVisibility(hideStatus, hideChannels, hideCommunity, hideMeta, hideAdvertise, hideTools);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true, // Watch deeply for changes
    attributes: false,
    characterData: false,
  });

  // * Initial visibility update
  updateButtonVisibility(hideStatus, hideChannels, hideCommunity, hideMeta, hideAdvertise, hideTools);

  // * Listen for messages from the popup and adjust behavior
  browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleStatus') {
      hideStatus = message.hide;
      updateSpecificButton(querySelectorStatus, hideStatus);
      updateSpecificButton(querySelectorStatusNew, hideStatus);
    }
    if (message.action === 'toggleChannels') {
      hideChannels = message.hide;
      updateSpecificButton(querySelectorChannels, hideChannels);
    }
    if (message.action === 'toggleCommunity') {
      hideCommunity = message.hide;
      updateSpecificButton(querySelectorCommunity, hideCommunity);
      updateSpecificButton(querySelectorCommunityNew, hideCommunity);
    }
    if (message.action === 'toggleMeta') {
      hideMeta = message.hide;
      updateSpecificButton(querySelectorMeta, hideMeta);
    }
    if (message.action === 'toggleAdvertise') {
      hideAdvertise = message.hide;
      updateSpecificButton(querySelectorAdvertise, hideAdvertise);
    }
    if (message.action === 'toggleTools') {
      hideTools = message.hide;
      updateSpecificButton(querySelectorTools, hideTools);
    }
  });
});

// * Update the visibility of all buttons
function updateButtonVisibility(hideStatus, hideChannels, hideCommunity, hideMeta, hideAdvertise, hideTools) {
  updateSpecificButton(querySelectorStatus, hideStatus);
  updateSpecificButton(querySelectorStatusNew, hideStatus);
  updateSpecificButton(querySelectorChannels, hideChannels);
  updateSpecificButton(querySelectorCommunity, hideCommunity);
  updateSpecificButton(querySelectorCommunityNew, hideCommunity);
  updateSpecificButton(querySelectorMeta, hideMeta);
  updateSpecificButton(querySelectorAdvertise, hideAdvertise);
  updateSpecificButton(querySelectorTools, hideTools);
}

// * Dynamically handle parent and update visibility
function updateSpecificButton(selector, shouldHide) {
  const element = document.querySelector(selector);
  if (element) {
    // Find the first button parent
    let currentElement = element;
    while (currentElement.parentElement) {
      currentElement = currentElement.parentElement;
      if (currentElement.tagName.toLowerCase() === 'button') {
        // Found the button parent, hide/show its parent
        if (currentElement.parentElement) {
          currentElement.parentElement.style.display = shouldHide ? 'none' : 'block';
        }
        break;
      }
    }
  }

  // * Additional functionality to hide all <svg> elements with <circle fill="none"> when hideStatus is true
  if (selector === querySelectorStatus) {
    const svgElements = document.querySelectorAll(querySelectorStatusChatCircles);
    svgElements.forEach(circle => {
      const svgElement = circle.parentElement;
      if (svgElement) {
        svgElement.style.display = shouldHide ? 'none' : 'block';
      }
    });
  }
}