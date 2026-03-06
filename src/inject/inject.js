let scrollHandle;

const findLinks = () => {
  const res = findLinksUniversal(document);
  chrome.extension.sendMessage({ foundLinks: res });
};

// Delay in ms to wait for context menus to render after clicking "More" buttons
const BULK_DELETE_MENU_DELAY = 500;

const bulkDelete = () => {
  // slice(1) skips the first "More" button which belongs to the page header, not an item
  Array.from(
    document
      .querySelector("[role=main]")
      .querySelectorAll('[aria-label="More"]')
  )
    .slice(1)
    .forEach((e) => e.click());
  setTimeout(() => {
    Array.from(document.querySelectorAll("[role=menuitem]")).forEach((e) =>
      e.click()
    );
  }, BULK_DELETE_MENU_DELAY);
};

chrome.extension.onMessage.addListener((request) => {
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
  if (request.bulkDelete) {
    bulkDelete();
  }
});
