// Default settings in case storage hasn't been set yet
chrome.storage.sync.get(['hideStatus', 'hideChannels', 'hideCommunity'], (result) => {
  let hideStatus = result.hideStatus ?? true;  // Default to hiding the "Status" button
  let hideChannels = result.hideChannels ?? true;  // Default to hiding the "Channels" button
  let hideCommunity = result.hideCommunity ?? true;  // Default to hiding the "Community" button

  // Observer: Watches for DOM mutations to handle late-loading elements
  let observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      updateButtonVisibility(hideStatus, hideChannels, hideCommunity);
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true, // Deeply observe for changes
    attributes: false,
    characterData: false
  });

  // Initialize button visibility on first load
  updateButtonVisibility(hideStatus, hideChannels, hideCommunity);

  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleStatus') {
      hideStatus = message.hide;
      updateSpecificButton('span[data-icon="status-outline"]', hideStatus, 3);
    }
    if (message.action === 'toggleChannels') {
      hideChannels = message.hide;
      updateSpecificButton('span[data-icon="newsletter-outline"]', hideChannels, 2);
    }
    if (message.action === 'toggleCommunity') {
      hideCommunity = message.hide;
      updateSpecificButton('span[data-icon="community-outline"]', hideCommunity, 2);
    }
  });
});

// Function to update the visibility of all buttons
function updateButtonVisibility(hideStatus, hideChannels, hideCommunity) {
  updateSpecificButton('span[data-icon="status-outline"]', hideStatus, 3); // "Status" needs 3 traversals
  updateSpecificButton('span[data-icon="newsletter-outline"]', hideChannels, 2); // "Channels" needs 2 traversals
  updateSpecificButton('span[data-icon="community-outline"]', hideCommunity, 2); // "Community" needs 2 traversals
}

// Function to update visibility for a specific button
function updateSpecificButton(selector, shouldHide, parentTraversal) {
  const button = document.querySelector(selector);
  if (button) {
    let parentDiv = button;
    for (let i = 0; i < parentTraversal; i++) {
      if (parentDiv) {
        parentDiv = parentDiv.parentElement;
      }
    }
    if (parentDiv) {
      parentDiv.style.display = shouldHide ? 'none' : 'block';
    }
  }
}