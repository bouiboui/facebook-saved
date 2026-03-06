let scrollHandle;

const findLinks = () => {
  const res = findLinksUniversal(document);
  chrome.extension.sendMessage({ foundLinks: res });
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const removeSavedLinksOld = async () => {
  const items = [
    ...document.querySelectorAll("[role=main] div[id^=item]"),
  ];
  for (const item of items) {
    const unsaveLink = [...item.querySelectorAll("a")].find((a) =>
      /unsave/i.test(a.textContent)
    );
    if (unsaveLink) {
      unsaveLink.click();
      await sleep(300);
    }
  }
};

const removeSavedLinksNew = async () => {
  const mainArea = document.querySelector("[role=main]");
  if (!mainArea) return;
  const menuButtons = [
    ...mainArea.querySelectorAll("[aria-haspopup=menu]"),
  ];
  for (const btn of menuButtons) {
    btn.click();
    await sleep(300);
    const openMenu = document.querySelector("[role=menu]");
    if (openMenu) {
      const unsaveOption = [
        ...openMenu.querySelectorAll("[role=menuitem]"),
      ].find((el) => /unsave|remove/i.test(el.textContent));
      if (unsaveOption) {
        unsaveOption.click();
        await sleep(300);
      }
    }
  }
};

const removeSavedLinks = async () => {
  const oldItems = document.querySelectorAll(
    "[role=main] div[id^=item]"
  );
  if (oldItems.length > 0) {
    await removeSavedLinksOld();
  } else {
    await removeSavedLinksNew();
  }
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
  if (request.removeLinks) {
    removeSavedLinks();
  }
});
