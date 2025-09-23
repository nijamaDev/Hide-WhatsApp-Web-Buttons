if (typeof browser === "undefined") {
  var browser = chrome;
}
const queryStatus = 'span[data-icon="status-outline"]';
const queryStatusNew = 'span[data-icon="status-refreshed"]';
const queryStatusChatCircles = 'svg > circle[fill="none"]';
const queryChannels = 'span[data-icon="newsletter-outline"]';
const queryCommunity = 'span[data-icon="community-outline"]';
const queryCommunityNew = 'span[data-icon="community-refreshed-32"]';
const queryMeta = 'button[aria-label="Meta AI"]';
const queryAdvertise = 'span[data-icon="business-advertise-outline"]';
const queryAdvertiseNew = 'span[data-icon="megaphone-refreshed-32"]';
const queryTools = 'span[data-icon="business-tools-outline"]';
const queryToolsNew = 'span[data-icon="storefront"]';

// * Load settings
browser.storage.sync.get(['showStatus', 'showChannels', 'showCommunity', 'showMeta', 'showAdvertise', 'showTools'], (result) => {
  if (browser.runtime.lastError) {
    console.error(`Error retrieving settings: ${browser.runtime.lastError}`);
    return;
  }
  let showStatus = result.showStatus ?? false;
  let showChannels = result.showChannels ?? false;
  let showCommunity = result.showCommunity ?? false;
  let showMeta = result.showMeta ?? false;
  let showAdvertise = result.showAdvertise ?? true;
  let showTools = result.showTools ?? true;

  browser.storage.sync.set({ 
    showStatus,
    showChannels,
    showCommunity,
    showMeta,
    showAdvertise,
    showTools
  });
  // * Observer to handle dynamic DOM changes
  let observer = new MutationObserver((mutations) => {
    let areNodesAdded = false;
    mutations.forEach((mutation) => {
      if (mutation.addedNodes) areNodesAdded = true;
    });
    if (areNodesAdded) {
      updateButtonVisibility(showStatus, showChannels, showCommunity, showMeta, showAdvertise, showTools);
    }
  });

  let appNode = document.getElementById('app');
  if (!appNode) {
    appNode = document.body;
  }

  observer.observe(appNode, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });

  // * Initial visibility update
  updateButtonVisibility(showStatus, showChannels, showCommunity, showMeta, showAdvertise, showTools);

  // * Listen for messages from the popup and adjust behavior
  browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleStatus') {
      showStatus = message.show;
      updateSpecificButton(queryStatus, showStatus);
      updateSpecificButton(queryStatusNew, showStatus);
    }
    if (message.action === 'toggleChannels') {
      showChannels = message.show;
      updateSpecificButton(queryChannels, showChannels);
    }
    if (message.action === 'toggleCommunity') {
      showCommunity = message.show;
      updateSpecificButton(queryCommunity, showCommunity);
      updateSpecificButton(queryCommunityNew, showCommunity);
    }
    if (message.action === 'toggleMeta') {
      showMeta = message.show;
      updateSpecificButton(queryMeta, showMeta);
    }
    if (message.action === 'toggleAdvertise') {
      showAdvertise = message.show;
      updateSpecificButton(queryAdvertise, showAdvertise);
      updateSpecificButton(queryAdvertiseNew, showAdvertise);
    }
    if (message.action === 'toggleTools') {
      showTools = message.show;
      updateSpecificButton(queryTools, showTools);
      updateSpecificButton(queryToolsNew, showTools);
    }
  });
});

// * Update the visibility of all buttons
function updateButtonVisibility(showStatus, showChannels, showCommunity, showMeta, showAdvertise, showTools) {
  updateSpecificButton(queryStatus, showStatus);
  updateSpecificButton(queryStatusNew, showStatus);
  updateSpecificButton(queryChannels, showChannels);
  updateSpecificButton(queryCommunity, showCommunity);
  updateSpecificButton(queryCommunityNew, showCommunity);
  updateSpecificButton(queryMeta, showMeta);
  updateSpecificButton(queryAdvertise, showAdvertise);
  updateSpecificButton(queryAdvertiseNew, showAdvertise);
  updateSpecificButton(queryTools, showTools);
  updateSpecificButton(queryToolsNew, showTools);
}

// * Dynamically handle parent and update visibility
function updateSpecificButton(query, shouldShow) {
  // Find the starting element based on the selector
  const element = document.querySelector(query);
  if (!element) {
    return;
  }

  let currentElement = element;
  // Traverse up the DOM tree from the starting element
  while (currentElement.parentElement) {
    // Check if the current element in the traversal is a button
    if (currentElement.tagName.toLowerCase() === 'button') {
      const buttonParent = currentElement.parentElement;

      if (buttonParent) {
        let elementToToggle = buttonParent;
        // Check if the button's parent is a <span> and has its own parent
        if (buttonParent.tagName.toLowerCase() === 'span' && buttonParent.parentElement) {
          // If it's a <span>, target its parent (the grandparent of the button)
          elementToToggle = buttonParent.parentElement;
        }
        // Apply the display style to the determined element
        elementToToggle.style.display = shouldShow ? 'block' : 'none';
      }
      break;
    }
    // Move up to the next parent
    currentElement = currentElement.parentElement;
  }

  // * Additional functionality to show all <svg> elements with <circle fill="none"> when showStatus is true
  if (query === queryStatus) {
    const svgElements = document.querySelectorAll(queryStatusChatCircles);
    svgElements.forEach(circle => {
      const svgElement = circle.parentElement;
      if (svgElement) {
        svgElement.style.display = shouldShow ? 'block' : 'none';
      }
    });
  }
}
