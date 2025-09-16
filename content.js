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
const querySelectorAdvertise = 'span[data-icon="megaphone-refreshed-32"]';
const querySelectorTools = 'span[data-icon="storefront"]';

// * Load settings
// * Temporary fix for migrating from the previous version
browser.storage.sync.get(['showStatus', 'showChannels', 'showCommunity', 'showMeta', 'showAdvertise', 'showTools'], (result) => {
  let showStatus = result.showStatus ?? false;
  let showChannels = result.showChannels ?? false;
  let showCommunity = result.showCommunity ?? false;
  let showMeta = result.showMeta ?? false;
  let showAdvertise = result.showAdvertise ?? true;
  let showTools = result.showTools ?? true;

  // * Observer to handle dynamic DOM changes
  let observer = new MutationObserver(() => {
    updateButtonVisibility(showStatus, showChannels, showCommunity, showMeta, showAdvertise, showTools);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true, // Watch deeply for changes
    attributes: false,
    characterData: false,
  });

  // * Initial visibility update
  updateButtonVisibility(showStatus, showChannels, showCommunity, showMeta, showAdvertise, showTools);

  // * Listen for messages from the popup and adjust behavior
  browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleStatus') {
      showStatus = message.show;
      updateSpecificButton(querySelectorStatus, showStatus);
      updateSpecificButton(querySelectorStatusNew, showStatus);
    }
    if (message.action === 'toggleChannels') {
      showChannels = message.show;
      updateSpecificButton(querySelectorChannels, showChannels);
    }
    if (message.action === 'toggleCommunity') {
      showCommunity = message.show;
      updateSpecificButton(querySelectorCommunity, showCommunity);
      updateSpecificButton(querySelectorCommunityNew, showCommunity);
    }
    if (message.action === 'toggleMeta') {
      showMeta = message.show;
      updateSpecificButton(querySelectorMeta, showMeta);
    }
    if (message.action === 'toggleAdvertise') {
      showAdvertise = message.show;
      updateSpecificButton(querySelectorAdvertise, showAdvertise);
    }
    if (message.action === 'toggleTools') {
      showTools = message.show;
      updateSpecificButton(querySelectorTools, showTools);
    }
  });
});

// * Update the visibility of all buttons
function updateButtonVisibility(showStatus, showChannels, showCommunity, showMeta, showAdvertise, showTools) {
  updateSpecificButton(querySelectorStatus, showStatus);
  updateSpecificButton(querySelectorStatusNew, showStatus);
  updateSpecificButton(querySelectorChannels, showChannels);
  updateSpecificButton(querySelectorCommunity, showCommunity);
  updateSpecificButton(querySelectorCommunityNew, showCommunity);
  updateSpecificButton(querySelectorMeta, showMeta);
  updateSpecificButton(querySelectorAdvertise, showAdvertise);
  updateSpecificButton(querySelectorTools, showTools);
}

// * Dynamically handle parent and update visibility
function updateSpecificButton(selector, shouldShow) {
  const element = document.querySelector(selector);
  if (element) {
    // Find the first button parent
    let currentElement = element;
    while (currentElement.parentElement) {
      if (currentElement.tagName.toLowerCase() === 'button') {
        // Found the button parent, show/show its parent
        if (currentElement.parentElement) {
          currentElement.parentElement.style.display = shouldShow ? 'block' : 'none';
        }
        break;
      }
      currentElement = currentElement.parentElement;
    }
  }

  // * Additional functionality to show all <svg> elements with <circle fill="none"> when showStatus is true
  if (selector === querySelectorStatus) {
    const svgElements = document.querySelectorAll(querySelectorStatusChatCircles);
    svgElements.forEach(circle => {
      const svgElement = circle.parentElement;
      if (svgElement) {
        svgElement.style.display = shouldShow ? 'block' : 'none';
      }
    });
  }
}
