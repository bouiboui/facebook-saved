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
    .map((item) => {
      const anchors = [...item.querySelectorAll("a")];
      const mainLink = anchors[1];
      const firstLink = anchors[0];
      if (!mainLink) return null;
      const url = toAbsolute(cleanUrl(mainLink.href));
      const text = cleanText(mainLink.text);
      if (firstLink) {
        const postUrl = toAbsolute(cleanUrl(firstLink.href));
        if (postUrl !== url) {
          return [url, text, postUrl];
        }
      }
      return [url, text];
    })
    .filter(Boolean);

const findLinksNew = (doc) =>
  [
    ...doc
      .querySelector("[role=main]")
      .querySelectorAll("div:nth-child(2) > [href]"),
  ].map((a) => {
    const url = toAbsolute(cleanUrl(a.href));
    const text = cleanText(a.text);
    const contentDiv = a.parentElement;
    const itemContainer = contentDiv && contentDiv.parentElement;
    if (itemContainer) {
      const postLink = [...itemContainer.querySelectorAll("a[href]")].find(
        (link) =>
          !contentDiv.contains(link) &&
          toAbsolute(cleanUrl(link.href)) !== url
      );
      if (postLink) {
        const postUrl = toAbsolute(cleanUrl(postLink.href));
        return [url, text, postUrl];
      }
    }
    return [url, text];
  });

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
