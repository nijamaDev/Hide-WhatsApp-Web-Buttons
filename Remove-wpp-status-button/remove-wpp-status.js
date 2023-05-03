/**
 * Remove wpp Web Status Button V-1.1

Have you ever notices how you can mute someone' wpp statuses on the phone, but cannot do the same on the Web version?

This extension hides the wpp Web Status Button to avoid being distracted by the small notification icon from the numerous statuses that are impossible to mute.

After install, reload the page to activate.

 */

// wpp web takes a long time to load,
// therefore an observer is required to
// wait for the Status button to appear.
let observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    // If no new nodes were added, return.
    if (!mutation.addedNodes) return;
    let statusButton = document.querySelector('div[title="Status"]');
    // Else if now the Status Button exists, set it's display to none and end the observer.
    if (statusButton != null) {
      statusButton.style.display = 'none';
      observer.disconnect();
    }
  });
});

// Start the observer
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false,
});
