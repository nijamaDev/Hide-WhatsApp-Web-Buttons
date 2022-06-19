let observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (!mutation.addedNodes) return
    let statusButton = document.querySelector('div[title="Status"]');
    if (statusButton !=  null){
      statusButton.style.display = 'none';
      observer.disconnect()
    }
  })
})

observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
})
