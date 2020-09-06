let scrollHandle;

const findLinks = () => {
  const res = [...document.querySelectorAll('#saveContentFragment div[id^=item]')].map(item => item.querySelector('a:nth-child(1)')).map(l => decodeURIComponent(l.href).match(/^(?:.+?\?u=)?(.+?)(.fbclid.+)?$/)[1]);
  chrome.extension.sendMessage({foundLinks: res});
}

chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.doIt) {
      findLinks();
    }
    if (request.autoScroll) {
      if (request.autoScroll === "start") {
        clearInterval(scrollHandle);
        scrollHandle = setInterval(() => {
          scrollTo(0,document.body.scrollHeight);
          findLinks();
        }, 500);
      }
      if (request.autoScroll === "stop") {
        clearInterval(scrollHandle);
        findLinks();
      }
    }
  });
