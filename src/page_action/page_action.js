let linksFound;

const linksFoundText = () =>
  document.querySelector('[name="exportType"]:checked').value === "urls+titles"
    ? linksFound.map(([url, title]) => `${url} ${title}`).join("\n")
    : linksFound.map(([url]) => url).join("\n");

const linksFoundCSV = () =>
  document.querySelector('[name="exportType"]:checked').value === "urls+titles"
    ? linksFound
        .map(([url, title]) => `${csvField(url)},${csvField(title)}`)
        .join(CSV_ROW_SEPARATOR)
    : linksFound.map(([url]) => csvField(url)).join(CSV_ROW_SEPARATOR);

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (!tabs[0].url.match(/facebook.com\/saved/gis)) {
    UIkit.modal(document.querySelector("#modal-center")).show();
  } else {
    UIkit.modal(document.querySelector("#modal-center")).hide();
    sendMessageToTab({ doIt: true });
  }
});

const sendMessageToTab = (message, callback) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, message, callback);
  });
};

const onClick = (selector, callback) =>
  document.querySelector(selector).addEventListener("click", callback);

onClick("#doItButton", () => {
  document.querySelector("#spinner").style.display = "block";
  sendMessageToTab({ doIt: true });
});

onClick("#startAutoScrollButton", () => {
  document.querySelector("#startAutoScrollButton").style.display = "none";
  document.querySelector("#stopAutoScrollButton").style.display = "inline";
  sendMessageToTab({ autoScroll: "start" });
});

onClick("#stopAutoScrollButton", () => {
  document.querySelector("#startAutoScrollButton").style.display = "inline";
  document.querySelector("#stopAutoScrollButton").style.display = "none";
  sendMessageToTab({ autoScroll: "stop" });
});

onClick("#copyTextButton", () => {
  const dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.value = linksFoundText();
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
  UIkit.notification("Copied to clipboard!", { pos: "top-center" });
});

onClick("#copyCSVButton", () => {
  const dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.value = linksFoundCSV();
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
  UIkit.notification("Copied to clipboard!", { pos: "top-center" });
});

onClick("#saveTextButton", () => {
  const hiddenElement = document.createElement("a");
  hiddenElement.href = "data:attachment/text," + encodeURI(linksFoundText());
  hiddenElement.target = "_blank";
  hiddenElement.download = "saved-links.txt";
  hiddenElement.click();
  UIkit.notification("Saved as text file!", { pos: "top-center" });
});

onClick("#saveCSVButton", () => {
  const hiddenElement = document.createElement("a");
  hiddenElement.href = "data:attachment/csv," + encodeURI(linksFoundCSV());
  hiddenElement.target = "_blank";
  hiddenElement.download = "saved-links.csv";
  hiddenElement.click();
  UIkit.notification("Saved as CSV file!", { pos: "top-center" });
});

onClick("#openSavedPage", () => {
  chrome.tabs.query({ url: "https://*.facebook.com/saved*" }, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.reload(tabs[0].id, () => {
        chrome.tabs.update(tabs[0].id, { active: true });
      });
    } else {
      chrome.tabs.create({ url: "https://www.facebook.com/saved" });
    }
  });
});

const CSV_ROW_SEPARATOR = "\n";

const csvField = (str) => `"${str.replace(/"/gis, '""')}"`;

chrome.extension.onMessage.addListener((request) => {
  document.querySelector("#spinner").style.display = "none";
  document.querySelector("#foundLinksCountSpan").innerHTML = "0";
  if (request.foundLinks) {
    const res = request.foundLinks;
    document.querySelector("#foundLinksCountSpan").innerHTML = res.length;
    linksFound = res;
  }
});
