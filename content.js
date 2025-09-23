if (typeof browser === "undefined") {
  var browser = chrome;
}
const queryStatus =       'span[data-icon="status-outline"]';
const queryStatusNew =    'span[data-icon="status-refreshed"]';
const queryStatusChatCircles = 'svg > circle[fill="none"]';
const queryChannels =     'span[data-icon="newsletter-outline"]';
const queryCommunity =    'span[data-icon="community-outline"]';
const queryCommunityNew = 'span[data-icon="community-refreshed-32"]';
const queryMeta =         'button[aria-label="Meta AI"]';
const queryAdvertise =    'span[data-icon="business-advertise-outline"]';
const queryAdvertiseNew = 'span[data-icon="megaphone-refreshed-32"]';
const queryTools =        'span[data-icon="business-tools-outline"]';
const queryToolsNew =     'span[data-icon="storefront"]';

  /* browser.storage.sync.set({ // Testing purposes only
    showStatus: false,
    showChannels: false,
    showCommunity: false,
    showMeta: false,
    showAdvertise: true,
    showTools: true
  }); */
// * Load settings
browser.storage.sync.get(
  [
    'hideStatus',
    'hideChannels',
    'hideCommunity',
    'hideMeta',
    'hideAdvertise',
    'hideTools',
    'showStatus',
    'showChannels',
    'showCommunity',
    'showMeta',
    'showAdvertise',
    'showTools'
  ], (result) => {
  if (browser.runtime.lastError) {
    console.error(`Error retrieving settings: ${browser.runtime.lastError}`);
    return;
  }
  let hideStatus    = result.hideStatus    ?? !(result.showStatus    ?? false);
  let hideChannels  = result.hideChannels  ?? !(result.showChannels  ?? false);
  let hideCommunity = result.hideCommunity ?? !(result.showCommunity ?? false);
  let hideMeta      = result.hideMeta      ?? !(result.showMeta      ?? false);
  let hideAdvertise = result.hideAdvertise ?? !(result.showAdvertise ?? true);
  let hideTools     = result.hideTools     ?? !(result.showTools     ?? true);

  browser.storage.sync.set({ 
    hideStatus,
    hideChannels,
    hideCommunity,
    hideMeta,
    hideAdvertise,
    hideTools
  });
  // * Observer to handle dynamic DOM changes
  let observer = new MutationObserver((mutations) => {
    let areNodesAdded = false;
    mutations.forEach((mutation) => {
      if (mutation.addedNodes) areNodesAdded = true;
    });
    if (areNodesAdded) {
      updateButtonVisibility(
        hideStatus,
        hideChannels,
        hideCommunity,
        hideMeta,
        hideAdvertise,
        hideTools
      );
    }
  });

  let appNode = document.getElementById('app');
  if (!appNode) {
    appNode = document.body;
  }

  observer.observe(appNode, {
    childList:     true,
    subtree:       true,
    attributes:    false,
    characterData: false
  });

  // * Initial visibility update
  updateButtonVisibility(
    hideStatus,
    hideChannels,
    hideCommunity,
    hideMeta,
    hideAdvertise,
    hideTools
  );

  // * Listen for messages from the popup and adjust behavior
  browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleStatus') {
      hideStatus = message.state;
      updateSpecificButton(hideStatus, queryStatus);
      updateSpecificButton(hideStatus, queryStatusNew);
    }
    if (message.action === 'toggleChannels') {
      hideChannels = message.state;
      updateSpecificButton(hideChannels, queryChannels);
    }
    if (message.action === 'toggleCommunity') {
      hideCommunity = message.state;
      updateSpecificButton(hideCommunity, queryCommunity);
      updateSpecificButton(hideCommunity, queryCommunityNew);
    }
    if (message.action === 'toggleMeta') {
      hideMeta = message.state;
      updateSpecificButton(hideMeta, queryMeta);
    }
    if (message.action === 'toggleAdvertise') {
      hideAdvertise = message.state;
      updateSpecificButton(hideAdvertise, queryAdvertise);
      updateSpecificButton(hideAdvertise, queryAdvertiseNew);
    }
    if (message.action === 'toggleTools') {
      hideTools = message.state;
      updateSpecificButton(hideTools, queryTools);
      updateSpecificButton(hideTools, queryToolsNew);
    }
  });
});

// * Update the visibility of all buttons
function updateButtonVisibility(
  hideStatus,
  hideChannels,
  hideCommunity,
  hideMeta,
  hideAdvertise,
  hideTools
) {
  updateSpecificButton(hideStatus,    queryStatus);
  updateSpecificButton(hideStatus,    queryStatusNew);
  updateSpecificButton(hideChannels,  queryChannels);
  updateSpecificButton(hideCommunity, queryCommunity);
  updateSpecificButton(hideCommunity, queryCommunityNew);
  updateSpecificButton(hideMeta,      queryMeta);
  updateSpecificButton(hideAdvertise, queryAdvertise);
  updateSpecificButton(hideAdvertise, queryAdvertiseNew);
  updateSpecificButton(hideTools,     queryTools);
  updateSpecificButton(hideTools,     queryToolsNew);
}

// * Dynamically handle parent and update visibility
function updateSpecificButton(shouldHide, query) {
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
        elementToToggle.style.display = shouldHide ? 'none' : 'block';
      }
      break;
    }
    // Move up to the next parent
    currentElement = currentElement.parentElement;
  }

  // * Additional functionality to hide all <svg> elements with <circle fill="none"> when hideStatus is true
  if (query == queryStatus || query == queryStatusNew) {
    const svgElements = document.querySelectorAll(queryStatusChatCircles);
    svgElements.forEach(circle => {
      const svgElement = circle.parentElement;
      if (svgElement) {
        svgElement.style.display = shouldHide ? 'none' : 'block';
      }
    });
  }
}
