const fs = require('fs')
const vm = require('vm')

const source = fs.readFileSync('../script.js', 'utf8')

function extractBetween(start, end) {
  const startIndex = source.indexOf(start)
  if (startIndex < 0) throw new Error(`Missing marker: ${start}`)
  const endIndex = source.indexOf(end, startIndex)
  if (endIndex < 0) throw new Error(`Missing marker: ${end}`)
  return source.slice(startIndex, endIndex)
}

function runDeclaration(start, end, from, to, context) {
  vm.runInContext(extractBetween(start, end).replace(from, to), context)
}

const context = {
  console,
  MENU_ICONS: {
    sandwiches: 'sandwiches',
    mains: 'mains',
    poolside: 'poolside',
    desserts: 'desserts',
    drinks: 'drinks',
    hotDrinks: 'hotDrinks',
    shisha: 'shisha',
  },
}

vm.createContext(context)
runDeclaration('const I18N = ', 'const SECTION_COPY = ', 'const I18N', 'var I18N', context)
runDeclaration('const SECTION_COPY = ', 'const MENU_AR = ', 'const SECTION_COPY', 'var SECTION_COPY', context)
runDeclaration('const MENU_AR = ', 'let currentLanguage = ', 'const MENU_AR', 'var MENU_AR', context)
runDeclaration('let MENU_CATEGORIES = ', 'let currentMenuTab = ', 'let MENU_CATEGORIES', 'var MENU_CATEGORIES', context)

const i18n = context.I18N
const section = context.SECTION_COPY
const menuAr = context.MENU_AR
const menuCategories = context.MENU_CATEGORIES

const loc = (en, ar = '') => ({en: en || '', ar: ar || ''})
const key = (prefix, index) => `${prefix}-${String(index + 1).padStart(2, '0')}`
const copy = (name) => loc(i18n.en[name], i18n.ar[name])
const sectionCopy = (name) => loc(section.en[name], section.ar[name])

const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  venue: {
    name: 'Ourjouwan Resort & Pool',
    phone: '96176178787',
    latitude: 34.52155565803008,
    longitude: 36.07189484159277,
    weatherLatitude: 34.5448,
    weatherLongitude: 36.0797,
    openingMinutes: 540,
    closingMinutes: 1140,
    hoursLabel: '9 AM - 7 PM',
    eventMessage: "Hello, I'd like to inquire about booking an event at Ourjouwan Resort & Pool.",
  },
  navigation: [
    {_key: 'nav-home', page: 'home', label: copy('nav.home')},
    {_key: 'nav-menu', page: 'menu', label: copy('nav.menu')},
    {_key: 'nav-gallery', page: 'gallery', label: copy('nav.gallery')},
  ],
  hero: {
    tagline: copy('hero.tagline'),
    since: copy('hero.since'),
    primaryCta: copy('hero.viewMenu'),
    secondaryCta: copy('hero.eventsGallery'),
  },
  menuIntro: {
    label: copy('menu.eyebrow'),
    title: copy('menu.title'),
    description: copy('menu.desc'),
  },
  guestMoments: {
    label: sectionCopy('guestLabel'),
    title: sectionCopy('guestTitle'),
    description: sectionCopy('guestDesc'),
    moments: section.en.moments.map((label, index) => ({
      _key: key('moment', index),
      label: loc(label, section.ar.moments[index]),
      kicker: loc(section.en.captions[index]?.[0], section.ar.captions[index]?.[0]),
      title: loc(section.en.captions[index]?.[1], section.ar.captions[index]?.[1]),
      description: loc(section.en.captions[index]?.[2], section.ar.captions[index]?.[2]),
    })),
  },
  experience: {
    label: sectionCopy('experienceLabel'),
    title: sectionCopy('experienceTitle'),
    description: sectionCopy('experienceDesc'),
    features: section.en.features.map((feature, index) => ({
      _key: key('feature', index),
      title: loc(feature[0], section.ar.features[index]?.[0]),
      description: loc(feature[1], section.ar.features[index]?.[1]),
    })),
  },
  atmosphere: {
    label: sectionCopy('atmosphereLabel'),
    title: sectionCopy('atmosphereTitle'),
    description: sectionCopy('atmosphereCopy'),
  },
  atmosphereImages: [
    {_key: 'atmosphere-01', alt: loc('Pool atmosphere photo 1', 'صورة أجواء المسبح ١')},
    {_key: 'atmosphere-02', alt: loc('Pool atmosphere photo 2', 'صورة أجواء المسبح ٢')},
    {_key: 'atmosphere-03', alt: loc('Pool atmosphere photo 3', 'صورة أجواء المسبح ٣')},
    {_key: 'atmosphere-04', alt: loc('Pool atmosphere photo 4', 'صورة أجواء المسبح ٤')},
  ],
  gallery: {
    label: sectionCopy('galleryLabel'),
    title: sectionCopy('galleryTitle'),
    description: sectionCopy('galleryDesc'),
    eventCards: section.en.eventCards.map((event, index) => ({
      _key: key('event', index),
      label: loc(event[0], section.ar.eventCards[index]?.[0]),
      title: loc(event[1], section.ar.eventCards[index]?.[1]),
      description: loc(event[2], section.ar.eventCards[index]?.[2]),
      photos: [
        {
          _key: key(`event-${index + 1}-photo`, 0),
          alt: loc(`${event[1]} photo 1`, `${section.ar.eventCards[index]?.[1]} صورة ١`),
        },
        {
          _key: key(`event-${index + 1}-photo`, 1),
          alt: loc(`${event[1]} photo 2`, `${section.ar.eventCards[index]?.[1]} صورة ٢`),
        },
        {
          _key: key(`event-${index + 1}-photo`, 2),
          alt: loc(`${event[1]} photo 3`, `${section.ar.eventCards[index]?.[1]} صورة ٣`),
        },
        {
          _key: key(`event-${index + 1}-photo`, 3),
          alt: loc(`${event[1]} photo 4`, `${section.ar.eventCards[index]?.[1]} صورة ٤`),
        },
      ],
    })),
  },
  booking: {
    label: sectionCopy('bookLabel'),
    title: sectionCopy('bookTitle'),
    description: sectionCopy('bookCopy'),
  },
  footer: {
    brandText: sectionCopy('footerBrand'),
    locationLabel: sectionCopy('location'),
  },
}

const iconKeyFor = (id) => (id === 'hot-drinks' ? 'hotDrinks' : id)
const docs = [siteSettings]

menuCategories.forEach((category, categoryIndex) => {
  const arCategory = menuAr.categories[category.id] || {}
  docs.push({
    _id: `menuCategory-${category.id}`,
    _type: 'menuCategory',
    id: {_type: 'slug', current: category.id},
    order: categoryIndex,
    tabLabel: loc(category.tabLabel, arCategory.tab),
    title: loc(category.title, arCategory.title),
    iconKey: iconKeyFor(category.id),
    hidden: false,
    items: category.items.map((item, itemIndex) => ({
      _key: key(`${category.id}-item`, itemIndex),
      name: loc(item[0], menuAr.items[item[0]]),
      price: item[1],
      tag: loc(item[2], menuAr.tags[item[2]]),
      hidden: false,
    })),
  })
})

fs.writeFileSync('seed.ndjson', docs.map((doc) => JSON.stringify(doc)).join('\n') + '\n', 'utf8')
console.log(`Wrote ${docs.length} documents to seed.ndjson`)
