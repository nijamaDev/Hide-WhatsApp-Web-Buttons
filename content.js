if (typeof browser === "undefined") {
  var browser = chrome;
}
const titleStatus =       'status-refreshed';
const titleChannels =     'wds-ic-channels';
const titleCommunity =    'community-refreshed-32';
const titleEmojis =       'ic-mood';
const titleGifs =         'gif-refreshed-new';
const titleStickers =     'wds-ic-sticker';
const titleEGS =       'wds-ic-sticker-smiley';

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

// * Load settings
browser.storage.sync.get(
  [
    'hideStatus',
    'hideChannels',
    'hideCommunity',
    'hideMeta',
    'hideAdvertise',
    'hideTools',
    'hideEmojis',
    'hideGifs',
    'hideStickers'
  ], (result) => {
  if (browser.runtime.lastError) {
    console.error(`Error retrieving settings: ${browser.runtime.lastError}`);
    return;
  }
  let hideStatus    = result.hideStatus    ?? true;
  let hideChannels  = result.hideChannels  ?? true;
  let hideCommunity = result.hideCommunity ?? true;
  let hideMeta      = result.hideMeta      ?? true;
  let hideEmojis    = result.hideEmojis    ?? false;
  let hideGifs      = result.hideGifs      ?? false;
  let hideStickers  = result.hideStickers  ?? false;
  let hideAdvertise = result.hideAdvertise ?? false;
  let hideTools     = result.hideTools     ?? false;

  browser.storage.sync.set({ 
    hideStatus,
    hideChannels,
    hideCommunity,
    hideMeta,
    hideAdvertise,
    hideTools,
    hideEmojis,
    hideGifs,
    hideStickers
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
        hideTools,
        hideEmojis,
        hideGifs,
        hideStickers
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
    hideTools,
    hideEmojis,
    hideGifs,
    hideStickers
  );

  // * Listen for messages from the popup and adjust behavior
  browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleStatus') {
      hideStatus = message.state;
      updateSpecificButton(hideStatus, queryStatus, titleStatus);
      updateSpecificButton(hideStatus, queryStatusNew, titleStatus);
    }
    if (message.action === 'toggleChannels') {
      hideChannels = message.state;
      updateSpecificButton(hideChannels, queryChannels, titleChannels);
    }
    if (message.action === 'toggleCommunity') {
      hideCommunity = message.state;
      updateSpecificButton(hideCommunity, queryCommunity, titleCommunity);
      updateSpecificButton(hideCommunity, queryCommunityNew, titleCommunity);
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
    if (message.action === 'toggleEmojis') {
      hideEmojis = message.state;
      updateSpecificButton(hideEmojis, null, titleEmojis);
      updateSpecificButton(hideEmojis && hideGifs && hideStickers, null, titleEGS);
    }
    if (message.action === 'toggleGifs') {
      hideGifs = message.state;
      updateSpecificButton(hideGifs, null, titleGifs);
      updateSpecificButton(hideEmojis && hideGifs && hideStickers, null, titleEGS);
    }
    if (message.action === 'toggleStickers') {
      hideStickers = message.state;
      updateSpecificButton(hideStickers, null, titleStickers);
      updateSpecificButton(hideEmojis && hideGifs && hideStickers, null, titleEGS);
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
  hideTools,
  hideEmojis,
  hideGifs,
  hideStickers
) {
  updateSpecificButton(hideStatus,    queryStatus, titleStatus);
  updateSpecificButton(hideStatus,    queryStatusNew, titleStatus);
  updateSpecificButton(hideChannels,  queryChannels, titleChannels);
  updateSpecificButton(hideCommunity, queryCommunity, titleCommunity);
  updateSpecificButton(hideCommunity, queryCommunityNew, titleCommunity);
  updateSpecificButton(hideMeta,      queryMeta);
  updateSpecificButton(hideAdvertise, queryAdvertise);
  updateSpecificButton(hideAdvertise, queryAdvertiseNew);
  updateSpecificButton(hideTools,     queryTools);
  updateSpecificButton(hideTools,     queryToolsNew);
  updateSpecificButton(hideEmojis,    null, titleEmojis);
  updateSpecificButton(hideGifs,      null, titleGifs);
  updateSpecificButton(hideStickers,  null, titleStickers);
  
  const hideEGS = hideEmojis && hideGifs && hideStickers;
  updateSpecificButton(hideEGS, null, titleEGS);
}

// * Dynamically handle parent and update visibility
function updateSpecificButton(shouldHide, query, titleText = null) {
  let element = null;

  // Primary: Try to find by titleText if provided
  if (titleText) {
    const svgTitles = Array.from(document.querySelectorAll('svg title'));
    const titleNode = svgTitles.find(t => t.textContent === titleText);
    
    // The <svg> is a child of the span that was previously used as the starting element
    if (titleNode && titleNode.parentElement && titleNode.parentElement.parentElement) {
      element = titleNode.parentElement.parentElement;
    }
  }

  // Fallback: Use the original query if title is not found or not provided
  if (!element && query) {
    element = document.querySelector(query);
  }

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

        // The EGS button has an extra wrapper div. We can simply go one level higher if needed.
        if (titleText === titleEGS && elementToToggle.parentElement) {
          elementToToggle = elementToToggle.parentElement;
        }

        // Apply the display style to the determined element
        elementToToggle.style.display = shouldHide ? 'none' : 'flex';
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
        svgElement.style.display = shouldHide ? 'none' : 'flex';
      }
    });
  }
}
