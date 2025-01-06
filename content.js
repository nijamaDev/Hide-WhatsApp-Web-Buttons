//const browserAPI = Storage || window.chrome;
if (typeof browser === "undefined") {
  var browser = chrome;
}

// Default settings
browser.storage.sync.get(['hideStatus', 'hideChannels', 'hideCommunity'], (result) => {
  let hideStatus = result.hideStatus ?? true;
  let hideChannels = result.hideChannels ?? true;
  let hideCommunity = result.hideCommunity ?? true;

  // Observer to handle dynamic DOM changes
  let observer = new MutationObserver(() => {
    updateButtonVisibility(hideStatus, hideChannels, hideCommunity);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true, // Watch deeply for changes
    attributes: false,
    characterData: false,
  });

  // Initial visibility update
  updateButtonVisibility(hideStatus, hideChannels, hideCommunity);

  // Listen for messages from the popup and adjust behavior
  browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleStatus') {
      hideStatus = message.hide;
      updateSpecificButton('span[data-icon="status-outline"]', hideStatus);
    }
    if (message.action === 'toggleChannels') {
      hideChannels = message.hide;
      updateSpecificButton('span[data-icon="newsletter-outline"]', hideChannels);
    }
    if (message.action === 'toggleCommunity') {
      hideCommunity = message.hide;
      updateSpecificButton('span[data-icon="community-outline"]', hideCommunity);
    }
  });
});

// Update the visibility of all buttons
function updateButtonVisibility(hideStatus, hideChannels, hideCommunity) {
  updateSpecificButton('span[data-icon="status-outline"]', hideStatus);
  updateSpecificButton('span[data-icon="newsletter-outline"]', hideChannels);
  updateSpecificButton('span[data-icon="community-outline"]', hideCommunity);
}

// Dynamically handle parent traversal and update visibility
function updateSpecificButton(selector, shouldHide) {
  const button = document.querySelector(selector);
  if (button) {
    let parentDiv = button.parentElement;

    // Check if the parent is a button or div and adjust traversal depth
    if (parentDiv?.tagName.toLowerCase() === 'button') {
      parentDiv = parentDiv.parentElement; // Only requires 2 traversals
    } else {
      parentDiv = parentDiv?.parentElement?.parentElement; // Requires 3 traversals
    }

    // Update visibility dynamically
    if (parentDiv) {
      parentDiv.style.display = shouldHide ? 'none' : 'block';
    }
  }
}