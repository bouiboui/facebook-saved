const { JSDOM } = require("jsdom");
const { expect } = require("chai");
const { findLinksOld, findLinksNew, findLinksUniversal } = require("../src/lib/findlinks");

const makeDoc = (html) => new JSDOM(html).window.document;

describe("findLinksOld", () => {
  it("returns [url, title] when both anchors have the same URL", () => {
    const doc = makeDoc(`
      <div role="main">
        <div id="item_1">
          <a href="https://external.com/article">Article Thumbnail</a>
          <a href="https://external.com/article">Article Title</a>
        </div>
      </div>
    `);
    const result = findLinksOld(doc);
    expect(result).to.deep.equal([
      ["https://external.com/article", "Article Title"],
    ]);
  });

  it("returns [url, title, postUrl] when first anchor is a different Facebook post link", () => {
    const doc = makeDoc(`
      <div role="main">
        <div id="item_1">
          <a href="https://www.facebook.com/user/posts/123">Post Thumbnail</a>
          <a href="https://l.facebook.com/l.php?u=https%3A%2F%2Fexternal.com%2Farticle">External Article</a>
        </div>
      </div>
    `);
    const result = findLinksOld(doc);
    expect(result).to.deep.equal([
      [
        "https://external.com/article",
        "External Article",
        "https://www.facebook.com/user/posts/123",
      ],
    ]);
  });

  it("handles multiple items, mixing posts with and without embedded links", () => {
    const doc = makeDoc(`
      <div role="main">
        <div id="item_1">
          <a href="https://external.com/article">Thumbnail</a>
          <a href="https://external.com/article">Article Title</a>
        </div>
        <div id="item_2">
          <a href="https://www.facebook.com/user/posts/456">Post Thumbnail</a>
          <a href="https://l.facebook.com/l.php?u=https%3A%2F%2Fother.com%2Fpage">Other Page</a>
        </div>
      </div>
    `);
    const result = findLinksOld(doc);
    expect(result).to.deep.equal([
      ["https://external.com/article", "Article Title"],
      [
        "https://other.com/page",
        "Other Page",
        "https://www.facebook.com/user/posts/456",
      ],
    ]);
  });
});

describe("findLinksNew", () => {
  it("returns [url, title] when item has only a content link", () => {
    const doc = makeDoc(`
      <div role="main">
        <div>
          <div></div>
          <div>
            <a href="https://external.com/article">Article Title</a>
          </div>
        </div>
      </div>
    `);
    const result = findLinksNew(doc);
    expect(result).to.deep.equal([
      ["https://external.com/article", "Article Title"],
    ]);
  });

  it("returns [url, title, postUrl] when the item container has a different link outside the content div", () => {
    const doc = makeDoc(`
      <div role="main">
        <div>
          <div>
            <a href="https://www.facebook.com/user/posts/123">4 hours ago</a>
          </div>
          <div>
            <a href="https://l.facebook.com/l.php?u=https%3A%2F%2Fexternal.com%2Farticle">External Article</a>
          </div>
        </div>
      </div>
    `);
    const result = findLinksNew(doc);
    expect(result).to.deep.equal([
      [
        "https://external.com/article",
        "External Article",
        "https://www.facebook.com/user/posts/123",
      ],
    ]);
  });
});

describe("findLinksUniversal", () => {
  it("prefers findLinksOld when old-style items are present and includes postUrl", () => {
    const doc = makeDoc(`
      <div role="main">
        <div id="item_1">
          <a href="https://www.facebook.com/user/posts/789">Post Link</a>
          <a href="https://l.facebook.com/l.php?u=https%3A%2F%2Fexternal.com%2Farticle">Article</a>
        </div>
      </div>
    `);
    const result = findLinksUniversal(doc);
    expect(result).to.deep.equal([
      [
        "https://external.com/article",
        "Article",
        "https://www.facebook.com/user/posts/789",
      ],
    ]);
  });

  it("falls back to findLinksNew when no old-style items are present", () => {
    const doc = makeDoc(`
      <div role="main">
        <div>
          <div>
            <a href="https://www.facebook.com/user/posts/123">Post Link</a>
          </div>
          <div>
            <a href="https://l.facebook.com/l.php?u=https%3A%2F%2Fexternal.com%2Farticle">Article</a>
          </div>
        </div>
      </div>
    `);
    const result = findLinksUniversal(doc);
    expect(result).to.deep.equal([
      [
        "https://external.com/article",
        "Article",
        "https://www.facebook.com/user/posts/123",
      ],
    ]);
  });
});
