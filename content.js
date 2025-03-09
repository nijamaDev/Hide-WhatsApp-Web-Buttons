if (typeof browser === "undefined") {
  var browser = chrome;
}
const querySelectorStatus = 'button[aria-label="Status"]';
const querySelectorStatusChatCircles = 'svg > circle[fill="none"]';
const querySelectorChannels = 'button[aria-label="Channels"]';
const querySelectorCommunity = 'button[aria-label="Communities"]';
const querySelectorMeta = 'button[aria-label="Meta AI"]';

// * Default settings
browser.storage.sync.get(['hideStatus', 'hideChannels', 'hideCommunity', 'hideMeta'], (result) => {
  let hideStatus = result.hideStatus ?? true;
  let hideChannels = result.hideChannels ?? true;
  let hideCommunity = result.hideCommunity ?? true;
  let hideMeta = result.hideMeta ?? true;

  // * Observer to handle dynamic DOM changes
  let observer = new MutationObserver(() => {
    updateButtonVisibility(hideStatus, hideChannels, hideCommunity, hideMeta);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true, // Watch deeply for changes
    attributes: false,
    characterData: false,
  });

  // * Initial visibility update
  updateButtonVisibility(hideStatus, hideChannels, hideCommunity, hideMeta);

  // * Listen for messages from the popup and adjust behavior
  browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleStatus') {
      hideStatus = message.hide;
      updateSpecificButton(querySelectorStatus, hideStatus);
    }
    if (message.action === 'toggleChannels') {
      hideChannels = message.hide;
      updateSpecificButton(querySelectorChannels, hideChannels);
    }
    if (message.action === 'toggleCommunity') {
      hideCommunity = message.hide;
      updateSpecificButton(querySelectorCommunity, hideCommunity);
    }
    if (message.action === 'toggleMeta') {
      hideMeta = message.hide;
      updateSpecificButton(querySelectorMeta, hideMeta);
    }
  });
});

// * Update the visibility of all buttons
function updateButtonVisibility(hideStatus, hideChannels, hideCommunity, hideMeta) {
  updateSpecificButton(querySelectorStatus, hideStatus);
  updateSpecificButton(querySelectorChannels, hideChannels);
  updateSpecificButton(querySelectorCommunity, hideCommunity);
  updateSpecificButton(querySelectorMeta, hideMeta);
}

// * Dynamically handle parent and update visibility
function updateSpecificButton(selector, shouldHide) {
  const button = document.querySelector(selector);
  if (button) {
    let parentDiv = button.parentElement;

    // Update visibility dynamically
    if (parentDiv) {
      parentDiv.style.display = shouldHide ? 'none' : 'block';
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