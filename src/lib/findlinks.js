const cleanUrl = (url) =>
  decodeURIComponent(url)
    .replace(/.+u=/, "")
    .replace(/[?&]fbclid.+/, "");

const toAbsolute = (href) =>
  href.startsWith("/") ? new URL(href, "https://www.facebook.com").href : href;

const arrayUnique = (res, next) =>
  res.find((a) => a[0] === next[0]) ? res : res.concat([next]);

const cleanText = (text) => text.replace(/\n/gis, " ").replace(/ +/gis, " ");

const findLinksOld = (doc) =>
  [...doc.querySelectorAll("[role=main] div[id^=item]")]
    .map((item) => [...item.querySelectorAll("a")][1])
    .map((a) => [toAbsolute(cleanUrl(a.href)), cleanText(a.text)]);

const findLinksNew = (doc) =>
  [
    ...doc
      .querySelector("[role=main]")
      .querySelectorAll("div:nth-child(2) > [href]"),
  ].map((a) => [toAbsolute(cleanUrl(a.href)), cleanText(a.text)]);

const findLinksUniversal = (doc) => {
  const oldLinks = findLinksOld(doc);
  return (oldLinks.length > 0 ? oldLinks : findLinksNew(doc)).reduce(
    arrayUnique,
    []
  );
};

if (typeof module !== "undefined") {
  module.exports = {
    findLinksOld,
    findLinksNew,
    findLinksUniversal,
  };
}
