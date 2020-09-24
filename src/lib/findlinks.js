const cleanUrl = url => decodeURIComponent(url).replace(/.+u=/, '').replace(/[?&]fbclid.+/, '')
const toAbsolute = href => href.startsWith('/') ? new URL(href, 'https://www.facebook.com').href : href
const arrayUnique = (res, next) => res.find(a => a === next) ? res : res.concat([next])

const findLinksOld = doc => [...doc.querySelectorAll('[role=main] div[id^=item]')]
  .map(item => item.querySelector('a:nth-child(1)'))
  .map(a => cleanUrl(a.href))
  .map(href => toAbsolute(href))

const findLinksNew = doc => [...doc.querySelector('[role=main]')
  .querySelectorAll('[href][target^=_]')]
  .map(a => cleanUrl(a.href))
  .map(href => toAbsolute(href))
  .reduce(arrayUnique, [])

const findLinksUniversal = doc => findLinksOld(doc).concat(findLinksNew(doc)).reduce(arrayUnique, [])

if (typeof module !== 'undefined') {
  module.exports = {
    findLinksOld,
    findLinksNew,
    findLinksUniversal
  }
}