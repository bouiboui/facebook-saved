let scrollHandle;

const findLinks = () => {
  const res = findLinksUniversal(document)
  chrome.extension.sendMessage({foundLinks: res});
}

chrome.extension.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.doIt) {
      findLinks();
    }
    if (request.autoScroll) {
      if (request.autoScroll === "start") {
        clearInterval(scrollHandle);
        scrollHandle = setInterval(() => {
          scrollTo(0, document.body.scrollHeight);
          findLinks();
        }, 500);
      }
      if (request.autoScroll === "stop") {
        clearInterval(scrollHandle);
        findLinks();
      }
    }
  });
