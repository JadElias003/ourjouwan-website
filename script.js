// ─────────────────────────────────────────────
// INITIAL WEBSITE LOADER
// ─────────────────────────────────────────────

const VENUE = {
  name: "Ourjouwan Resort & Pool",
  phone: "96176178787",
  latitude: 34.52155565803008,
  longitude: 36.07189484159277,
  weatherLatitude: 34.5448,
  weatherLongitude: 36.0797,
  openingMinutes: 9 * 60,
  closingMinutes: 19 * 60,
  hoursLabel: "9 AM - 7 PM",
  eventMessage:
    "Hello, I'd like to inquire about booking an event at Ourjouwan Resort & Pool.",
};

const SANITY = window.SANITY_PUBLIC || {};
const SANITY_READY = Boolean(SANITY.projectId && SANITY.dataset);

VENUE.whatsappUrl = `https://wa.me/${VENUE.phone}`;
VENUE.eventWhatsappUrl = `${VENUE.whatsappUrl}?text=${encodeURIComponent(
  VENUE.eventMessage,
)}`;
VENUE.mapUrl = `https://maps.google.com/?q=${VENUE.latitude},${VENUE.longitude}`;
VENUE.weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${VENUE.weatherLatitude}&longitude=${VENUE.weatherLongitude}&current_weather=true`;

function refreshVenueUrls() {
  VENUE.whatsappUrl = `https://wa.me/${VENUE.phone}`;
  VENUE.eventWhatsappUrl = `${VENUE.whatsappUrl}?text=${encodeURIComponent(
    VENUE.eventMessage,
  )}`;
  VENUE.mapUrl = `https://maps.google.com/?q=${VENUE.latitude},${VENUE.longitude}`;
  VENUE.weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${VENUE.weatherLatitude}&longitude=${VENUE.weatherLongitude}&current_weather=true`;
}

window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  const hasVisited = getStoredValue(sessionStorage, "ourjouwan_visited");

  if (!loader) {
    setTimeout(maybeShowLanguagePrompt, 350);
    return;
  }

  if (!hasVisited) {
    setStoredValue(sessionStorage, "ourjouwan_visited", "true");
    setTimeout(() => {
      loader.classList.add("hidden");
      setTimeout(() => {
        loader.style.display = "none";
        maybeShowLanguagePrompt();
      }, 700);
    }, 3200);
  } else {
    loader.style.display = "none";
    setTimeout(maybeShowLanguagePrompt, 350);
  }
});

// ─────────────────────────────────────────────
// SPA PAGE ROUTING — no reloads, pure DOM swap
// ─────────────────────────────────────────────

// Track the current page (matches body[data-page] on load)
let currentPage = document.body.dataset.page || "home";

/**
 * Switch to a page by name: "home" | "menu" | "gallery"
 * Hides all .page divs, shows #page-{name}, updates nav + dock.
 */
function showPage(page) {
  if (page === currentPage) {
    closeMenu();
    return;
  }

  // remove active
  document.querySelectorAll(".page").forEach((p) => {
    p.classList.remove("active");
  });

  // add active
  const target = document.getElementById(`page-${page}`);

  if (target) {
    target.classList.add("active");
  }

  currentPage = page;

  document.body.dataset.page = page;

  // reset scroll
  window.scrollTo({
    top: 0,
    behavior: "instant",
  });

  // nav state
  markActivePage(page);

  // widgets
  setWidgetsVisibility();

  // mobile menu
  closeMenu();

  // reset menu tabs
  if (page === "menu") {
    const firstMenuTab = MENU_CATEGORIES.find((category) => !category.hidden);
    switchTab(
      firstMenuTab?.id || "sandwiches",
      document.querySelector(`[data-tab="${firstMenuTab?.id || "sandwiches"}"]`),
    );
  }

  requestAnimationFrame(() => {
    initReveal();
  });
}

/**
 * Animated page transition: shows the loader overlay briefly, then calls showPage().
 * @param {string} page   - page name ("home" | "menu" | "gallery")
 * @param {string} label  - text shown in the loader
 */
function getPageLoaderLabel(page) {
  const labels = {
    home: t("loader.home"),
    menu: t("loader.menu"),
    gallery: t("loader.gallery"),
  };

  return labels[page] || t("loader.default");
}

function getPageLoaderTheme(page) {
  const loader = document.getElementById("page-loader");

  loader.classList.remove("loader-home", "loader-menu", "loader-gallery");

  loader.classList.add(`loader-${page}`);
}

function navigateWithLoader(page, label = null) {
  if (page === currentPage) return;

  const pageLoader = document.getElementById("page-loader");
  const pageLabel = document.getElementById("pl-label");

  // set text
  pageLabel.textContent = label || getPageLoaderLabel(page);

  // set theme
  getPageLoaderTheme(page);

  // SHOW loader
  pageLoader.classList.add("visible");

  // STEP 1:
  // wait for loader intro animation
  setTimeout(() => {
    // STEP 2:
    // switch page ONLY after loader fully covers screen
    showPage(page);

    // STEP 3:
    // small delay so DOM paints correctly
    requestAnimationFrame(() => {
      setTimeout(() => {
        // STEP 4:
        // hide loader
        pageLoader.classList.remove("visible");
      }, 250);
    });
  }, 850);
}
// ─────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────

function getStoredValue(storage, key) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function setStoredValue(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch {
    // Storage can be unavailable in private browsing or strict browser modes.
  }
}

// ─────────────────────────────────────────────
// SANITY CONTENT
// ─────────────────────────────────────────────

function sanityQueryUrl(query) {
  const host = SANITY.useCdn === false ? "api" : "apicdn";
  const base = `https://${SANITY.projectId}.${host}.sanity.io/v${SANITY.apiVersion || "2025-05-01"}/data/query/${SANITY.dataset}`;
  const url = `${base}?query=${encodeURIComponent(query)}`;
  sanityDebug("Sanity query URL built", {
    host,
    useCdn: SANITY.useCdn,
    projectId: SANITY.projectId,
    dataset: SANITY.dataset,
    url,
  });
  return url;
}

function sanityDebug(...args) {
  if (typeof console === "undefined") return;
  if (console.debug) {
    console.debug("[Sanity Debug]", ...args);
  } else {
    console.log("[Sanity Debug]", ...args);
  }
}

function localizedValue(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[currentLanguage] || value.en || value.ar || "";
}

function applyLocalizedCopy(target, key, value) {
  if (!value || typeof value !== "object") return;
  if (value.en) target.en[key] = value.en;
  if (value.ar) target.ar[key] = value.ar;
}

function imageUrl(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.imageUrl || value.url || "";
}

function imageAlt(value, fallback = "") {
  return localizedValue(value?.alt) || fallback;
}

function applyImage(selector, value, fallbackAlt = "", root = document) {
  const url = imageUrl(value);
  if (!url) return;
  const img = root.querySelector(selector);
  if (!img) return;
  img.src = url;
  const alt = imageAlt(value, fallbackAlt);
  if (alt) img.alt = alt;
}

function applySanityImages(settings) {
  applyImage(".hero-img-wrap img", settings.hero?.logoImageUrl);

  if (Array.isArray(settings.guestMoments?.moments)) {
    const panels = document.querySelectorAll("[data-moment-panel]");
    settings.guestMoments.moments.forEach((moment, index) => {
      if (!moment?.imageUrl) return;
      const panel = panels[index];
      if (!panel) return;
      const img = panel.querySelector("img");
      if (!img) return;
      img.src = moment.imageUrl;
      const alt = localizedValue(moment.imageAlt) || localizedValue(moment.title);
      if (alt) img.alt = alt;
    });
  }

  if (Array.isArray(settings.atmosphereImages)) {
    const images = document.querySelectorAll(".atmosphere-gallery img");
    settings.atmosphereImages.forEach((item, index) => {
      const url = imageUrl(item);
      const img = images[index];
      if (!url || !img) return;
      img.src = url;
      const alt = imageAlt(item);
      if (alt) img.alt = alt;
    });
  }

  if (Array.isArray(settings.gallery?.eventCards)) {
    const cards = document.querySelectorAll(".event-stack-card");
    settings.gallery.eventCards.forEach((event, cardIndex) => {
      const card = cards[cardIndex];
      if (!card || !Array.isArray(event.photos)) return;
      const images = card.querySelectorAll(".stack-photo");
      event.photos.forEach((photo, photoIndex) => {
        const url = imageUrl(photo);
        const img = images[photoIndex];
        if (!url || !img) return;
        img.src = url;
        const alt = imageAlt(photo, localizedValue(event.title));
        if (alt) img.alt = alt;
      });
    });
  }
}

function applySanitySiteSettings(settings) {
  if (!settings) return;

  if (settings.venue) {
    Object.assign(VENUE, {
      name: settings.venue.name || VENUE.name,
      phone: settings.venue.phone || VENUE.phone,
      latitude: settings.venue.latitude ?? VENUE.latitude,
      longitude: settings.venue.longitude ?? VENUE.longitude,
      weatherLatitude:
        settings.venue.weatherLatitude ?? settings.venue.latitude ?? VENUE.weatherLatitude,
      weatherLongitude:
        settings.venue.weatherLongitude ?? settings.venue.longitude ?? VENUE.weatherLongitude,
      openingMinutes:
        settings.venue.openingMinutes ?? VENUE.openingMinutes,
      closingMinutes:
        settings.venue.closingMinutes ?? VENUE.closingMinutes,
      hoursLabel: settings.venue.hoursLabel || VENUE.hoursLabel,
      eventMessage: settings.venue.eventMessage || VENUE.eventMessage,
    });
    refreshVenueUrls();
  }

  (settings.navigation || []).forEach((item) => {
    if (!item?.page) return;
    applyLocalizedCopy(I18N, `nav.${item.page}`, item.label);
  });

  applyLocalizedCopy(I18N, "hero.tagline", settings.hero?.tagline);
  applyLocalizedCopy(I18N, "hero.since", settings.hero?.since);
  applyLocalizedCopy(I18N, "hero.viewMenu", settings.hero?.primaryCta);
  applyLocalizedCopy(I18N, "hero.eventsGallery", settings.hero?.secondaryCta);

  applyLocalizedCopy(I18N, "menu.eyebrow", settings.menuIntro?.eyebrow);
  applyLocalizedCopy(I18N, "menu.title", settings.menuIntro?.title);
  applyLocalizedCopy(I18N, "menu.desc", settings.menuIntro?.description);

  const en = SECTION_COPY.en;
  const ar = SECTION_COPY.ar;
  applyLocalizedCopy(SECTION_COPY, "guestLabel", settings.guestMoments?.label);
  applyLocalizedCopy(SECTION_COPY, "guestTitle", settings.guestMoments?.title);
  applyLocalizedCopy(SECTION_COPY, "guestDesc", settings.guestMoments?.description);

  if (Array.isArray(settings.guestMoments?.moments)) {
    en.moments = settings.guestMoments.moments.map((item) => item.label?.en).filter(Boolean);
    ar.moments = settings.guestMoments.moments.map((item) => item.label?.ar).filter(Boolean);
    en.captions = settings.guestMoments.moments
      .map((item) => [item.kicker?.en, item.title?.en, item.description?.en])
      .filter((item) => item.some(Boolean));
    ar.captions = settings.guestMoments.moments
      .map((item) => [item.kicker?.ar, item.title?.ar, item.description?.ar])
      .filter((item) => item.some(Boolean));
  }

  applyLocalizedCopy(SECTION_COPY, "experienceLabel", settings.experience?.label);
  applyLocalizedCopy(SECTION_COPY, "experienceTitle", settings.experience?.title);
  applyLocalizedCopy(SECTION_COPY, "experienceDesc", settings.experience?.description);
  if (Array.isArray(settings.experience?.features)) {
    en.features = settings.experience.features
      .map((item) => [item.title?.en, item.description?.en])
      .filter((item) => item.some(Boolean));
    ar.features = settings.experience.features
      .map((item) => [item.title?.ar, item.description?.ar])
      .filter((item) => item.some(Boolean));
  }

  applyLocalizedCopy(SECTION_COPY, "atmosphereLabel", settings.atmosphere?.label);
  applyLocalizedCopy(SECTION_COPY, "atmosphereTitle", settings.atmosphere?.title);
  applyLocalizedCopy(SECTION_COPY, "atmosphereCopy", settings.atmosphere?.description);
  applyLocalizedCopy(SECTION_COPY, "footerBrand", settings.footer?.brandText);
  applyLocalizedCopy(SECTION_COPY, "location", settings.footer?.locationLabel);
  applyLocalizedCopy(SECTION_COPY, "galleryLabel", settings.gallery?.label);
  applyLocalizedCopy(SECTION_COPY, "galleryTitle", settings.gallery?.title);
  applyLocalizedCopy(SECTION_COPY, "galleryDesc", settings.gallery?.description);
  applyLocalizedCopy(SECTION_COPY, "bookLabel", settings.booking?.label);
  applyLocalizedCopy(SECTION_COPY, "bookTitle", settings.booking?.title);
  applyLocalizedCopy(SECTION_COPY, "bookCopy", settings.booking?.description);
  applyLocalizedCopy(SECTION_COPY, "chatWhatsApp", settings.booking?.buttonLabel);

  if (Array.isArray(settings.gallery?.eventCards)) {
    en.eventCards = settings.gallery.eventCards
      .map((item) => [item.label?.en, item.title?.en, item.description?.en])
      .filter((item) => item.some(Boolean));
    ar.eventCards = settings.gallery.eventCards
      .map((item) => [item.label?.ar, item.title?.ar, item.description?.ar])
      .filter((item) => item.some(Boolean));
  }

  applySanityImages(settings);
}

function normalizeSanityMenu(categories) {
  sanityDebug("normalizeSanityMenu called", { categoriesLength: categories?.length, categories });
  if (!Array.isArray(categories) || categories.length === 0) return;

  MENU_CATEGORIES = categories
    .filter((category) => category?.id)
    .map((category) => ({
      id: category.id,
      tabLabel: category.tabLabel?.en || category.title?.en || category.id,
      tabLabelAr: category.tabLabel?.ar || category.title?.ar || "",
      title: category.title?.en || category.tabLabel?.en || category.id,
      titleAr: category.title?.ar || category.tabLabel?.ar || "",
      icon: MENU_ICONS[category.iconKey] || MENU_ICONS.sandwiches,
      hidden: Boolean(category.hidden),
      items: (category.items || []).map((item) => {
        if (item && item.price != null && typeof item.price !== "string") {
          sanityDebug("Menu item price type mismatch", {
            category: category.id,
            name: item.name,
            priceType: typeof item.price,
            priceValue: item.price,
          });
        }
        if (item && item.price == null) {
          sanityDebug("Menu item price missing", {
            category: category.id,
            name: item.name,
            item,
          });
        }

        return {
          name: item.name?.en || "",
          nameAr: item.name?.ar || "",
          price: item.price || "",
          tag: item.tag?.en || "",
          tagAr: item.tag?.ar || "",
          hidden: Boolean(item.hidden),
        };
      }),
    }));
}

async function loadSanityContent() {
  if (!SANITY_READY) {
    console.warn("Sanity is not ready. Check sanity-config.js window.SANITY_PUBLIC values.", SANITY);
    return;
  }

  sanityDebug("Sanity config", SANITY);
  sanityDebug("Sanity ready", {
    ready: SANITY_READY,
    useCdn: SANITY.useCdn,
    host: SANITY.useCdn === false ? "api" : "apicdn",
  });

  const query = `{
    "settings": *[_type == "siteSettings"][0] {
      ...,
      hero {
        ...,
        "logoImageUrl": logoImage.asset->url
      },
      guestMoments {
        ...,
        moments[] {
          ...,
          "key": _key,
          "imageUrl": image.asset->url,
          "imageAlt": title
        }
      },
      atmosphereImages[] {
        ...,
        "imageUrl": image.asset->url
      },
      gallery {
        ...,
        eventCards[] {
          ...,
          photos[] {
            ...,
            "imageUrl": image.asset->url
          }
        }
      }
    },
    "menuCategories": *[_type == "menuCategory"] | order(order asc, title.en asc) {
      "id": id.current,
      tabLabel,
      title,
      iconKey,
      hidden,
      items[]{name, price, tag, hidden}
    }
  }`;

  try {
    const response = await fetch(sanityQueryUrl(query));
    if (!response.ok) throw new Error(`Sanity responded ${response.status}`);
    const payload = await response.json();
    sanityDebug("Sanity payload", payload);
    if (!payload?.result) {
      sanityDebug("Sanity payload missing result object", payload);
    }
    if (!payload?.result?.menuCategories) {
      sanityDebug("Sanity payload missing menuCategories", payload.result);
    }
    applySanitySiteSettings(payload.result?.settings);
    normalizeSanityMenu(payload.result?.menuCategories);
    sanityDebug("Applied Sanity settings and menu", {
      settings: payload.result?.settings,
      menuCategoryCount: payload.result?.menuCategories?.length,
    });
  } catch (error) {
    console.warn("Sanity content could not be loaded. Using local fallback.", error, {
      sanityConfig: SANITY,
      queryUrl: sanityQueryUrl(query),
    });
  }
}

// ─────────────────────────────────────────────
// LANGUAGE
// ─────────────────────────────────────────────

const LANGUAGE_KEY = "ourjouwan-language";
const SUPPORTED_LANGUAGES = ["en", "ar"];
const GOOGLE_TRANSLATE_SELECTORS = [
  ".goog-te-banner-frame",
  ".goog-te-balloon-frame",
  ".goog-te-menu-frame",
  ".goog-te-gadget",
  "#google_translate_element",
  "iframe[src*='translate.google']",
];

const I18N = {
  en: {
    "prompt.kicker": "Language",
    "prompt.title": "Choose your preferred language",
    "prompt.desc": "We will show the site in the language you choose",
    "prompt.english": "English",
    "prompt.arabic": "العربية",
    "nav.home": "Home",
    "nav.menu": "Menu",
    "nav.gallery": "Events & Gallery",
    "nav.directions": "Directions",
    "language.label": "Language",
    "theme.toggle": "Toggle dark mode",
    "status.hoursLabel": "Opening hours",
    "status.open": "OPEN",
    "status.closed": "CLOSED",
    "loader.home": "Entering Ourjouwan...",
    "loader.menu": "Preparing The Menu...",
    "loader.gallery": "Opening Events gallery...",
    "loader.default": "Loading...",
    "hero.tagline": "Resort & Pool - Restaurant",
    "hero.since": "Since 2005",
    "hero.viewMenu": "View Menu",
    "hero.eventsGallery": "Events & Gallery",
    "weather.hot": "Perfect Pool Escape Today",
    "weather.sunny": "Sunny Lebanese Pool Weather",
    "weather.fresh": "Fresh Mountain Breeze Today",
    "weather.fallback": "Poolside weather, always worth checking",
    "menu.eyebrow": "Culinary",
    "menu.title": "Our Menu",
    "menu.desc":
      "Fresh, seasonal, and crafted with care, from classic Lebanese mezze to poolside bites and signature cocktails.",
    "menu.search": "Search the menu",
    "menu.empty": "No menu items match that search.",
    "menu.count": (count) => `${count} item${count === 1 ? "" : "s"} found`,
    "filters.all": "All",
    "filters.plate": "Plates",
    "filters.sandwiches": "Sandwiches",
    "filters.salad": "Salads",
    "filters.appetizers": "Appetizers",
    "filters.sweet": "Sweets",
  },
  ar: {
    "prompt.kicker": "اللغة",
    "prompt.title": "اختر لغتك المفضلة",
    "prompt.desc": "سنظهر الموقع باللغة التي تختارها",
    "prompt.english": "English",
    "prompt.arabic": "العربية",
    "nav.home": "الرئيسية",
    "nav.menu": "القائمة",
    "nav.gallery": "المناسبات والصور",
    "nav.directions": "الاتجاهات",
    "language.label": "اللغة",
    "theme.toggle": "تبديل الوضع الداكن",
    "status.hoursLabel": "ساعات العمل",
    "status.open": "مفتوح",
    "status.closed": "مغلق",
    "loader.home": "أهلا بكم في أرجوان...",
    "loader.menu": "نحضّر القائمة...",
    "loader.gallery": "نفتح معرض المناسبات...",
    "loader.default": "جار التحميل...",
    "hero.tagline": "منتجع ومسبح - مطعم",
    "hero.since": "منذ 2005",
    "hero.viewMenu": "عرض القائمة",
    "hero.eventsGallery": "المناسبات والصور",
    "weather.hot": "يوم مثالي للمسبح",
    "weather.sunny": "طقس لبناني مشمس للمسبح",
    "weather.fresh": "نسمة جبلية منعشة اليوم",
    "weather.fallback": "طقس المسبح يستحق المتابعة",
    "menu.eyebrow": "المأكولات",
    "menu.title": "قائمتنا",
    "menu.desc":
      "أطباق طازجة محضرة بعناية، من المازة اللبنانية إلى الوجبات الخفيفة والمشروبات بجانب المسبح.",
    "menu.search": "ابحث في القائمة",
    "menu.empty": "لا توجد أصناف تطابق البحث.",
    "menu.count": (count) => `${count} ${count === 1 ? "صنف" : "أصناف"} مطابقة`,
    "filters.all": "الكل",
    "filters.plate": "أطباق",
    "filters.sandwiches": "سندويشات",
    "filters.salad": "سلطات",
    "filters.appetizers": "مقبلات",
    "filters.sweet": "حلويات",
  },
};

const SECTION_COPY = {
  en: {
    guestLabel: "Guest Moments",
    guestTitle: "Pick the mood,\nfeel the day.",
    guestDesc:
      "A quick look at the moments guests settle into: poolside bites, shisha, golden swims, and celebrations by the water.",
    moments: ["Food", "Shisha", "Sunset", "Events"],
    captions: [
      [
        "Poolside Bites",
        "Poolside bites between swims.",
        "Cold drinks, fries, burgers, and plates made for long summer days.",
      ],
      [
        "Shisha Lounge",
        "Slow afternoons by the water.",
        "Settle into the view with shisha, drinks, and easy poolside conversation.",
      ],
      [
        "Golden Swim",
        "Golden hour hits different here.",
        "Cooler air, softer light, and the kind of evening that keeps people staying longer.",
      ],
      [
        "Celebrations",
        "Turn the pool into the occasion.",
        "Birthdays, gatherings, and private moments framed by water, food, and summer energy.",
      ],
    ],
    experienceLabel: "Experience",
    experienceTitle: "Where the water meets the table",
    experienceDesc:
      "Ourjouwan is a haven of relaxation and fine dining in Lebanon, where crystal waters, summer sun, and exceptional cuisine come together in one unforgettable setting.",
    features: [
      [
        "Infinity Pool",
        "Our signature pool blends seamlessly with the horizon, creating a resort experience like no other in Lebanon.",
      ],
      [
        "Poolside Dining",
        "Fresh mezze, grilled seafood, and craft cocktails delivered to your sun lounger or table by the water.",
      ],
      [
        "Private Events",
        "Weddings, birthdays, corporate gatherings: we craft unforgettable experiences tailored to your vision.",
      ],
      [
        "Sunset Sessions",
        "Sunset pool parties, live DJs, vibrant evenings, and unforgettable summer energy by the water every weekend.",
      ],
    ],
    atmosphereLabel: "WATER GAMES & POOL FUN",
    atmosphereTitle: "Where splashes turn into summer stories.",
    atmosphereCopy:
      "Slides, pool games, floating challenges, and all-day water play made for families, friends, and every sun-soaked celebration.",
    footerBrand:
      "A destination of sun, water, and exceptional taste in the heart of Lebanon.",
    footerNavigate: "Navigate",
    footerVisit: "Visit Us",
    footerFollow: "Follow",
    footerEvents: "Events",
    location: "Akkar, Lebanon",
    galleryLabel: "Events & Moments",
    galleryTitle: "Where memories are made",
    galleryDesc:
      "From intimate weddings to grand celebrations, Ourjouwan transforms any occasion into an extraordinary experience.",
    eventCards: [
      [
        "Elegant Celebrations",
        "Weddings",
        "Luxury waterfront weddings with sunset ambiance, gourmet dining, floral staging, and unforgettable moments.",
      ],
      [
        "Summer Vibes",
        "Parties",
        "Poolside celebrations, DJs, cocktails, lights, and unforgettable nights with your closest people.",
      ],
      [
        "Senior Memories",
        "Prom",
        "Celebrate the final school year with a premium prom night by the water, surrounded by lights, music, and memories.",
      ],
    ],
    bookLabel: "Book an Event",
    bookTitle: "Planning something special?",
    bookCopy:
      "Contact our events team via WhatsApp and let us help you create an unforgettable experience at Ourjouwan.",
    whatsappBooking: "WhatsApp Booking",
    whatsappUs: "WhatsApp Us",
    chatWhatsApp: "Chat on WhatsApp",
    dock: {
      home: "Home",
      menu: "Menu",
      gallery: "Events",
      whatsapp: "WhatsApp",
      map: "Map",
    },
  },
  ar: {
    guestLabel: "لحظات الضيوف",
    guestTitle: "اختر الأجواء\nواشعر باليوم.",
    guestDesc:
      "نظرة سريعة على الأجواء التي يستمتع بها الضيوف: أكلات بجانب المسبح، أرجيلة، سباحة وقت الغروب، واحتفالات قرب الماء.",
    moments: ["الأكل", "الأرجيلة", "الغروب", "المناسبات"],
    captions: [
      [
        "أكلات بجانب المسبح",
        "وجبات خفيفة بين السباحات.",
        "مشروبات باردة، بطاطا، برغر، وأطباق تناسب أيام الصيف الطويلة.",
      ],
      [
        "جلسة أرجيلة",
        "بعد الظهر الهادئ قرب الماء.",
        "استمتع بالمنظر مع الأرجيلة والمشروبات وجلسة مريحة بجانب المسبح.",
      ],
      [
        "سباحة الغروب",
        "الغروب هنا له إحساس مختلف.",
        "هواء ألطف، ضوء أهدأ، وأمسية تجعل الضيوف يرغبون بالبقاء أكثر.",
      ],
      [
        "احتفالات",
        "حوّل المسبح إلى مناسبة مميزة.",
        "أعياد ميلاد، تجمعات، ولحظات خاصة تجمع الماء والطعام وأجواء الصيف.",
      ],
    ],
    experienceLabel: "التجربة",
    experienceTitle: "حيث يلتقي الماء بالمائدة",
    experienceDesc:
      "أرجوان مساحة للاسترخاء والطعام اللذيذ في لبنان، حيث تجتمع المياه الصافية وشمس الصيف والمأكولات المميزة في تجربة واحدة.",
    features: [
      [
        "مسبح بإطلالة مميزة",
        "مسبحنا يمنحك تجربة منتجع هادئة ومميزة وسط أجواء لبنان الصيفية.",
      ],
      [
        "طعام بجانب المسبح",
        "مازة طازجة، أطباق مشوية، ومشروبات تصل إلى جلستك أو طاولتك قرب الماء.",
      ],
      [
        "مناسبات خاصة",
        "أعراس، أعياد ميلاد، وتجمعات: نساعدك على تصميم تجربة تناسب رؤيتك.",
      ],
      [
        "جلسات الغروب",
        "حفلات صيفية، موسيقى، أمسيات نابضة بالحياة، وطاقة لا تُنسى قرب الماء.",
      ],
    ],
    atmosphereLabel: "ألعاب مائية ومتعة المسبح",
    atmosphereTitle: "حيث تتحول الرشات إلى ذكريات صيفية.",
    atmosphereCopy:
      "زحاليق، ألعاب مسبح، تحديات مائية، ومتعة طوال اليوم للعائلات والأصدقاء وكل احتفال تحت الشمس.",
    footerBrand: "وجهة تجمع الشمس والماء والطعم المميز في قلب لبنان.",
    footerNavigate: "التصفح",
    footerVisit: "زورونا",
    footerFollow: "تابعونا",
    footerEvents: "المناسبات",
    location: "عكار، لبنان",
    galleryLabel: "المناسبات واللحظات",
    galleryTitle: "حيث تصنع الذكريات",
    galleryDesc:
      "من الأعراس الصغيرة إلى الاحتفالات الكبيرة، يحوّل أرجوان أي مناسبة إلى تجربة استثنائية.",
    eventCards: [
      [
        "احتفالات راقية",
        "الأعراس",
        "أعراس فاخرة قرب الماء مع أجواء الغروب، طعام مميز، تنسيق جميل، ولحظات لا تُنسى.",
      ],
      [
        "أجواء صيفية",
        "الحفلات",
        "احتفالات بجانب المسبح، موسيقى، مشروبات، إضاءة، وليالٍ مميزة مع أقرب الناس.",
      ],
      [
        "ذكريات التخرج",
        "حفلات التخرج",
        "احتفل بنهاية السنة الدراسية بليلة مميزة قرب الماء وسط الأضواء والموسيقى والذكريات.",
      ],
    ],
    bookLabel: "احجز مناسبة",
    bookTitle: "تخطط لشيء مميز؟",
    bookCopy:
      "تواصل مع فريق المناسبات عبر واتساب ودعنا نساعدك على صنع تجربة لا تُنسى في أرجوان.",
    whatsappBooking: "حجز عبر واتساب",
    whatsappUs: "راسلنا واتساب",
    chatWhatsApp: "تواصل عبر واتساب",
    dock: {
      home: "الرئيسية",
      menu: "القائمة",
      gallery: "المناسبات",
      whatsapp: "واتساب",
      map: "الخريطة",
    },
  },
};

const MENU_AR = {
  categories: {
    sandwiches: { tab: "سندويشات", title: "سندويشات" },
    mains: { tab: "أطباق رئيسية", title: "أطباق رئيسية" },
    poolside: { tab: "بجانب المسبح", title: "وجبات بجانب المسبح" },
    desserts: { tab: "حلويات", title: "حلويات" },
    drinks: { tab: "مشروبات", title: "مشروبات وكوكتيلات" },
    "hot-drinks": { tab: "مشروبات ساخنة", title: "مشروبات ساخنة" },
    shisha: { tab: "أرجيلة", title: "أرجيلة" },
  },
  items: {
    Fries: "بطاطا مقلية",
    Tawouk: "طاووق",
    "Classic Burger (Beef / Chicken)": "برغر كلاسيك (لحم / دجاج)",
    "Cheese Burger": "تشيز برغر",
    Boneless: "بونلس",
    "Crispy Cheese Burger": "كريسبي تشيز برغر",
    "Chicken Ceasar Salad": "سلطة سيزر بالدجاج",
    "Crab Salad": "سلطة كراب",
    Fattoush: "فتوش",
    Tabouleh: "تبولة",
    Fajita: "فاهيتا",
    "Hot Dog": "هوت دوغ",
    Crispy: "كريسبي",
    Nuggets: "ناغتس",
    "Loaded Fries": "لودد فرايز",
    "Chicken Loaded Fries": "لودد فرايز بالدجاج",
    "Mozzarella Sticks": "أصابع موزاريلا",
    Wings: "أجنحة دجاج",
    "Crepe Chocolat": "كريب شوكولا",
    "Kinder Crepe": "كريب كيندر",
    "Oreo Crepe": "كريب أوريو",
    "Water (Large)": "مياه كبيرة",
    "Water (Small)": "مياه صغيرة",
    "Soft Drinks": "مشروبات غازية",
    "Energy Drinks": "مشروبات طاقة",
    "Sparkling Water": "مياه غازية",
    "Fresh Orange Juice": "عصير برتقال طازج",
    Frisco: "فريسكو",
    "Merry Cream": "ميري كريم",
    Beer: "بيرة",
    "Mexican Beer": "بيرة مكسيكية",
    "Almaza Rose": "ألمازا روز",
    "Vodka (Glass)": "فودكا (كأس)",
    "Whiskey (Glass)": "ويسكي (كأس)",
    "Red Bull": "ريد بول",
    Tea: "شاي",
    Cappuccino: "كابتشينو",
    Nescafe: "نسكافيه",
    "Turkish Coffee": "قهوة تركية",
    "Arguile Idara": "أركيلة إدارة",
  },
  tags: {
    Sandwiches: "سندويشات",
    Burgers: "برغر",
    Salad: "سلطة",
    Appetizers: "مقبلات",
    Plate: "طبق",
    Sweet: "حلويات",
    Still: "مياه",
    "Non-Alcoholic": "بدون كحول",
    Energy: "طاقة",
    Sparkling: "غازية",
    Fresh: "طازج",
    Refreshing: "منعش",
    "Ice cream": "آيس كريم",
    Alcoholic: "كحولي",
    Hot: "ساخن",
    Coffee: "قهوة",
    Shisha: "أرجيلة",
  },
};

let currentLanguage = detectInitialLanguage();

function detectInitialLanguage() {
  const savedLanguage = getStoredValue(localStorage, LANGUAGE_KEY);
  if (SUPPORTED_LANGUAGES.includes(savedLanguage)) return savedLanguage;

  return "en";
}

function clearGoogleTranslateCookie() {
  ["googtrans", "/googtrans"].forEach((name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${location.hostname}`;
  });
}

function removeGoogleTranslateArtifacts() {
  GOOGLE_TRANSLATE_SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => el.remove());
  });
  document.body.classList.remove("translated-ltr", "translated-rtl");
  document.documentElement.style.top = "";
  document.body.style.top = "";
}

function disableGoogleTranslate() {
  clearGoogleTranslateCookie();
  removeGoogleTranslateArtifacts();
}

function t(key, ...args) {
  const value = I18N[currentLanguage]?.[key] ?? I18N.en[key] ?? key;
  return typeof value === "function" ? value(...args) : value;
}

function setLanguage(language, { persist = true } = {}) {
  disableGoogleTranslate();
  currentLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : "en";
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";
  document.documentElement.dataset.language = currentLanguage;

  if (persist) {
    setStoredValue(localStorage, LANGUAGE_KEY, currentLanguage);
  }

  applyStaticTranslations();
  syncLanguageToggleState();
  renderMenu();
  updateOpenStatus();
  updateMenuResults();
  loadWeather();
}

function maybeShowLanguagePrompt() {
  const prompt = document.getElementById("languagePrompt");
  if (!prompt) return;
  if (prompt.classList.contains("visible")) return;
  applyLanguagePromptCopy(currentLanguage);
  document.body.classList.add("language-prompt-open");
  prompt.classList.add("visible");
  prompt.setAttribute("aria-hidden", "false");
  prompt.querySelector("[data-language-prompt-choice]")?.focus();
}

function closeLanguagePrompt() {
  const prompt = document.getElementById("languagePrompt");
  if (!prompt) return;
  document.body.classList.remove("language-prompt-open");
  prompt.classList.remove("visible");
  prompt.setAttribute("aria-hidden", "true");
}

function applyStaticTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel));
  });
  applySectionTranslations();
  applyLanguagePromptCopy(currentLanguage);
}

function applyLanguagePromptCopy(language) {
  const copy = I18N[language] || I18N.en;
  setText("[data-language-prompt-kicker]", copy["prompt.kicker"]);
  setText("[data-language-prompt-title]", copy["prompt.title"]);
  setText("[data-language-prompt-desc]", copy["prompt.desc"]);
  document.querySelectorAll("[data-language-prompt-choice]").forEach((btn) => {
    const key =
      btn.dataset.languagePromptChoice === "ar"
        ? "prompt.arabic"
        : "prompt.english";
    btn
      .querySelector("span")
      ?.replaceChildren(document.createTextNode(copy[key]));
  });
}

function setText(selector, value, root = document) {
  const el = root.querySelector(selector);
  if (el && value) el.textContent = value;
}

function setAllText(selector, values) {
  document.querySelectorAll(selector).forEach((el, index) => {
    if (values[index] !== undefined) el.textContent = values[index];
  });
}

function setDockLabel(selector, label) {
  document.querySelectorAll(selector).forEach((el) => {
    el.setAttribute("title", label);
    el.setAttribute("aria-label", label);
  });
}

function applySectionTranslations() {
  const copy = SECTION_COPY[currentLanguage] || SECTION_COPY.en;

  setText(".guest-reel-copy .section-label", copy.guestLabel);
  setText("#guestReelTitle", copy.guestTitle);
  setText(".guest-reel-desc", copy.guestDesc);
  setAllText(".guest-moment-tab", copy.moments);
  document
    .querySelectorAll(".guest-moment-caption")
    .forEach((caption, index) => {
      const item = copy.captions[index];
      if (!item) return;
      setText("span", item[0], caption);
      setText("h3", item[1], caption);
      setText("p", item[2], caption);
    });

  setText(".home-features > .section-label", copy.experienceLabel);
  setText(".home-features .section-title", copy.experienceTitle);
  setText(".home-features .section-desc", copy.experienceDesc);
  document.querySelectorAll(".feature-card").forEach((card, index) => {
    const feature = copy.features[index];
    if (!feature) return;
    setText(".feature-title", feature[0], card);
    setText(".feature-desc", feature[1], card);
  });

  setText(".atmosphere-label", copy.atmosphereLabel);
  setText(".atmosphere-title", copy.atmosphereTitle);
  setText(".atmosphere-copy", copy.atmosphereCopy);

  document.querySelectorAll(".footer-brand p").forEach((el) => {
    el.textContent = copy.footerBrand;
  });
  document.querySelectorAll(".footer-col-title").forEach((el) => {
    const text = el.textContent.trim().toLowerCase();
    if (text.includes("navigate") || text.includes("التصفح"))
      el.textContent = copy.footerNavigate;
    if (text.includes("visit") || text.includes("زورونا"))
      el.textContent = copy.footerVisit;
    if (text.includes("follow") || text.includes("تابعونا"))
      el.textContent = copy.footerFollow;
    if (text.includes("events") || text.includes("المناسبات"))
      el.textContent = copy.footerEvents;
  });
  document
    .querySelectorAll("footer [data-page-link='home']")
    .forEach((el) => (el.textContent = t("nav.home")));
  document
    .querySelectorAll("footer [data-page-link='menu']")
    .forEach((el) => (el.textContent = t("nav.menu")));
  document
    .querySelectorAll("footer [data-page-link='gallery']")
    .forEach((el) => (el.textContent = t("nav.gallery")));
  document
    .querySelectorAll("footer [data-venue-map-link]")
    .forEach((el) => (el.textContent = copy.location));
  document
    .querySelectorAll("footer [data-venue-whatsapp-link]")
    .forEach((el) => (el.textContent = copy.whatsappBooking));

  setText(".gallery-hero .section-label", copy.galleryLabel);
  setText(".gallery-hero .section-title", copy.galleryTitle);
  setText(".gallery-hero .section-desc", copy.galleryDesc);
  document.querySelectorAll(".event-stack-card").forEach((card, index) => {
    const event = copy.eventCards[index];
    if (!event) return;
    setText(".event-stack-label", event[0], card);
    setText(".event-stack-title", event[1], card);
    setText(".event-stack-desc", event[2], card);
    const stack = card.querySelector(".photo-stack");
    if (stack) {
      stack.dataset.galleryName = event[1];
      stack.setAttribute(
        "aria-label",
        `${currentLanguage === "ar" ? "افتح معرض" : "Open"} ${event[1]}`,
      );
    }
  });
  const bookingBlock = document.querySelector(".btn-whatsapp")?.closest("div");
  if (bookingBlock) {
    setText(".section-label", copy.bookLabel, bookingBlock);
    setText(".section-title", copy.bookTitle, bookingBlock);
    setText("p:not(.section-label)", copy.bookCopy, bookingBlock);
    const chat = bookingBlock.querySelector(".btn-whatsapp");
    if (chat) {
      [...chat.childNodes].forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) node.textContent = "";
      });
      chat.append(document.createTextNode(copy.chatWhatsApp));
    }
  }

  setDockLabel("[data-dock-page='home']", copy.dock.home);
  setDockLabel("[data-dock-page='menu']", copy.dock.menu);
  setDockLabel("[data-dock-page='gallery']", copy.dock.gallery);
  setDockLabel("[data-venue-whatsapp-link].dock-btn", copy.dock.whatsapp);
  setDockLabel("[data-venue-map-link].dock-btn", copy.dock.map);
}

function syncLanguageToggleState() {
  document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
    btn.setAttribute(
      "aria-pressed",
      btn.dataset.langSwitch === currentLanguage ? "true" : "false",
    );
  });
}

function syncThemeToggleState() {
  const isDark = document.documentElement.dataset.theme === "dark";
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.setAttribute("aria-pressed", isDark ? "true" : "false");
  });
}

function toggleTheme() {
  const html = document.documentElement;

  const isDark = html.dataset.theme === "dark";

  html.dataset.theme = isDark ? "light" : "dark";

  setStoredValue(localStorage, "ourjouwan-theme", html.dataset.theme);
  syncThemeToggleState();
}

const savedTheme = getStoredValue(localStorage, "ourjouwan-theme");
if (savedTheme === "light" || savedTheme === "dark") {
  document.documentElement.dataset.theme = savedTheme;
}

// ─────────────────────────────────────────────
// NAV HELPERS
// ─────────────────────────────────────────────

function markActive(el) {
  document
    .querySelectorAll(".nav-links a")
    .forEach((a) => a.classList.remove("active"));
  if (el) el.classList.add("active");
}

function markActivePage(page) {
  const pageToHref = { home: "#home", menu: "#menu", gallery: "#gallery" };
  const href = pageToHref[page];

  document.querySelectorAll(".nav-links a").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === href);
  });
  document.querySelectorAll("[data-dock-page]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.dockPage === page);
  });
}

function initDeclarativeActions() {
  document.addEventListener("click", (e) => {
    const pageTrigger = e.target.closest("[data-page-link]");
    if (pageTrigger) {
      e.preventDefault();
      const page = pageTrigger.dataset.pageLink;
      navigateWithLoader(page);
      return;
    }

    if (e.target.closest("[data-theme-toggle]")) {
      toggleTheme();
      return;
    }

    const languageButton = e.target.closest("[data-lang-switch]");
    if (languageButton) {
      setLanguage(languageButton.dataset.langSwitch);
      return;
    }

    const promptLanguageButton = e.target.closest(
      "[data-language-prompt-choice]",
    );
    if (promptLanguageButton) {
      setLanguage(promptLanguageButton.dataset.languagePromptChoice);
      closeLanguagePrompt();
      return;
    }

    if (e.target.closest("[data-menu-toggle]")) {
      toggleMenu();
      return;
    }

    const tab = e.target.closest("[data-tab]");
    if (tab) {
      switchTab(tab.dataset.tab, tab);
      return;
    }

    const stack = e.target.closest(".photo-stack");
    if (stack) {
      openGalleryLightbox(stack);
    }
  });

  document.addEventListener("keydown", (e) => {
    const stack = e.target.closest(".photo-stack");
    if (stack) handleGalleryStackKey(e, stack);
  });
}

function initHoursPopovers() {
  document.querySelectorAll(".status-widget").forEach((widget) => {
    widget.addEventListener("click", (e) => {
      e.stopPropagation();
      widget.classList.toggle("hours-open");
    });
  });
  document.addEventListener("click", (e) => {
    if (e.target.closest(".status-widget")) return;
    document
      .querySelectorAll(".status-widget.hours-open")
      .forEach((w) => w.classList.remove("hours-open"));
  });
}

window.addEventListener("scroll", () => {
  document
    .getElementById("navbar")
    .classList.toggle("scrolled", window.scrollY > 30);
});

// ─────────────────────────────────────────────
// MOBILE MENU
// ─────────────────────────────────────────────

function toggleMenu() {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileWidgets = document.getElementById("mobileWidgets");

  hamburger.classList.toggle("open");
  mobileMenu.classList.toggle("open");
  hamburger.setAttribute(
    "aria-expanded",
    mobileMenu.classList.contains("open") ? "true" : "false",
  );

  if (mobileMenu.classList.contains("open")) {
    mobileWidgets.style.display = "none";
  } else {
    if (currentPage === "home") mobileWidgets.style.display = "flex";
  }
}

function closeMenu() {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileWidgets = document.getElementById("mobileWidgets");

  hamburger.classList.remove("open");
  mobileMenu.classList.remove("open");
  hamburger.setAttribute("aria-expanded", "false");

  if (currentPage === "home" && window.innerWidth <= 768) {
    mobileWidgets.style.display = "flex";
  }
}

// ─────────────────────────────────────────────
// WIDGET VISIBILITY
// ─────────────────────────────────────────────

function setWidgetsVisibility() {
  const isMobile = window.innerWidth <= 768;
  const isHome = currentPage === "home";
  const menuOpen = document
    .getElementById("mobileMenu")
    .classList.contains("open");
  const mobileW = document.getElementById("mobileWidgets");
  const desktopW = document.getElementById("navWidgets");

  if (mobileW)
    mobileW.style.display = isHome && isMobile && !menuOpen ? "flex" : "none";
  if (desktopW) desktopW.style.display = isHome && !isMobile ? "flex" : "none";
}

// ─────────────────────────────────────────────
// MENU TABS
// ─────────────────────────────────────────────

const MENU_ICONS = {
  sandwiches: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11h18M3 13h18M5 7h14a2 2 0 0 1 2 2v1H3V9a2 2 0 0 1 2-2zM5 17h14a2 2 0 0 0 2-2v-1H3v1a2 2 0 0 0 2 2z"/></svg>`,
  mains: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 3v9l4 4"/></svg>`,
  poolside: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm3 4H5l1-4h4l-1 4z"/></svg>`,
  desserts: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7z"/></svg>`,
  drinks: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 3h6l1 9a5 5 0 0 1-10 0L7 3zM6 3h12M12 17v4M8 21h8"/></svg>`,
  hotDrinks: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
  shisha: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2c0 0-2 3-2 5s2 3 2 5-2 3-2 5M8 4c0 0 2 2 2 4s-2 3-2 5 2 3 2 5"/><ellipse cx="12" cy="20" rx="5" ry="2"/></svg>`,
};

let MENU_CATEGORIES = [
  {
    id: "sandwiches",
    tabLabel: "Sandwiches",
    title: "Sandwiches",
    icon: MENU_ICONS.sandwiches,
    items: [
      ["Fries", "350,000 LL", "Sandwiches"],
      ["Tawouk", "550,000 LL", "Sandwiches"],
      ["Classic Burger (Beef / Chicken)", "550,000 LL", "Burgers"],
      ["Cheese Burger", "650,000 LL", "Burgers"],
      ["Boneless", "600,000 LL", "Sandwiches"],
      ["Crispy Cheese Burger", "700,000 LL", "Burgers"],
    ],
  },
  {
    id: "mains",
    tabLabel: "Mains",
    title: "Main Courses",
    icon: MENU_ICONS.mains,
    items: [
      ["Chicken Ceasar Salad", "900,000 LL", "Salad"],
      ["Crab Salad", "1,000,000 LL", "Salad"],
      ["Fattoush", "600,000 LL", "Salad"],
      ["Tabouleh", "600,000 LL", "Salad"],
    ],
  },
  {
    id: "poolside",
    tabLabel: "Poolside",
    title: "Poolside Bites",
    icon: MENU_ICONS.poolside,
    items: [
      ["Fries", "450,000 LL", "Appetizers"],
      ["Tawouk", "1,000,000 LL", "Plate"],
      ["Classic Burger (Beef / Chicken)", "1,000,000 LL", "Plate"],
      ["Fajita", "1,150,000 LL", "Plate"],
      ["Hot Dog", "1,150,000 LL", "Plate"],
      ["Crispy", "1,100,000 LL", "Plate"],
      ["Nuggets", "1,000,000 LL", "Plate"],
      ["Loaded Fries", "500,000 LL", "Appetizers"],
      ["Chicken Loaded Fries", "600,000 LL", "Appetizers"],
      ["Mozzarella Sticks", "600,000 LL", "Appetizers"],
      ["Wings", "600,000 LL", "Appetizers"],
      ["Crispy Cheese Burger", "1,100,000 LL", "Plate"],
    ],
  },
  {
    id: "desserts",
    tabLabel: "Desserts",
    title: "Desserts",
    icon: MENU_ICONS.desserts,
    items: [
      ["Crepe Chocolat", "600,000 LL", "Sweet"],
      ["Kinder Crepe", "700,000 LL", "Sweet"],
      ["Oreo Crepe", "700,000 LL", "Sweet"],
    ],
  },
  {
    id: "drinks",
    tabLabel: "Drinks",
    title: "Drinks & Cocktails",
    icon: MENU_ICONS.drinks,
    items: [
      ["Water (Large)", "150,000 LL", "Still"],
      ["Water (Small)", "100,000 LL", "Still"],
      ["Soft Drinks", "200,000 LL", "Non-Alcoholic"],
      ["Energy Drinks", "250,000 LL", "Energy"],
      ["Sparkling Water", "200,000 LL", "Sparkling"],
      ["Fresh Orange Juice", "300,000 LL", "Fresh"],
      ["Frisco", "300,000 LL", "Refreshing"],
      ["Merry Cream", "350,000 LL", "Ice cream"],
      ["Beer", "400,000 LL", "Alcoholic"],
      ["Mexican Beer", "450,000 LL", "Alcoholic"],
      ["Almaza Rose", "400,000 LL", "Alcoholic"],
      ["Vodka (Glass)", "450,000 LL", "Alcoholic"],
      ["Whiskey (Glass)", "450,000 LL", "Alcoholic"],
      ["Red Bull", "450,000 LL", "Energy"],
    ],
  },
  {
    id: "hot-drinks",
    tabLabel: "Hot Drinks",
    title: "Hot Drinks",
    icon: MENU_ICONS.hotDrinks,
    items: [
      ["Tea", "150,000 LL", "Hot"],
      ["Cappuccino", "150,000 LL", "Coffee"],
      ["Nescafe", "150,000 LL", "Coffee"],
      ["Turkish Coffee", "", "Coffee"],
    ],
  },
  {
    id: "shisha",
    tabLabel: "Shisha",
    title: "Shisha",
    icon: MENU_ICONS.shisha,
    items: [["Arguile Idara", "700,000 LL", "Shisha"]],
  },
];

let currentMenuTab = "sandwiches";
let activeMenuFilter = "all";

function localizeMenuCategory(category, field) {
  if (currentLanguage !== "ar") {
    return field === "tab" ? category.tabLabel : category.title;
  }

  const arField = field === "tab" ? "tabLabelAr" : "titleAr";
  return (
    category[arField] ||
    MENU_AR.categories[category.id]?.[field] ||
    category[field] ||
    category.title
  );
}

function getMenuItemName(item) {
  return Array.isArray(item) ? item[0] : item.name;
}

function getMenuItemPrice(item) {
  return Array.isArray(item) ? item[1] : item.price;
}

function getMenuItemTag(item) {
  return Array.isArray(item) ? item[2] : item.tag;
}

function localizeMenuItemText(item) {
  const name = getMenuItemName(item);
  if (currentLanguage === "ar" && !Array.isArray(item) && item.nameAr) {
    return item.nameAr;
  }
  return currentLanguage === "ar" ? MENU_AR.items[name] || name : name;
}

function localizeMenuTag(item) {
  const tag = getMenuItemTag(item);
  if (currentLanguage === "ar" && !Array.isArray(item) && item.tagAr) {
    return item.tagAr;
  }
  return currentLanguage === "ar" ? MENU_AR.tags[tag] || tag : tag;
}

function createMenuItem(itemData) {
  const name = getMenuItemName(itemData);
  const price = getMenuItemPrice(itemData);
  const tag = getMenuItemTag(itemData);
  const item = document.createElement("div");
  item.className = "menu-item";
  item.dataset.searchText = normalizeMenuText(
    [
      name,
      tag,
      !Array.isArray(itemData) && itemData.nameAr,
      !Array.isArray(itemData) && itemData.tagAr,
      MENU_AR.items[name],
      MENU_AR.tags[tag],
    ]
      .filter(Boolean)
      .join(" "),
  );

  const body = document.createElement("div");
  body.className = "menu-item-body";

  const top = document.createElement("div");
  top.className = "menu-item-top";

  const itemName = document.createElement("div");
  itemName.className = "menu-item-name";
  itemName.textContent = localizeMenuItemText(itemData);
  top.appendChild(itemName);

  if (price) {
    const itemPrice = document.createElement("div");
    itemPrice.className = "menu-item-price";
    itemPrice.textContent = price;
    top.appendChild(itemPrice);
  }

  const itemTag = document.createElement("span");
  itemTag.className = "menu-item-tag";
  itemTag.textContent = localizeMenuTag(itemData);

  body.append(top, itemTag);
  item.appendChild(body);
  return item;
}

function renderMenu() {
  const tabBar = document.getElementById("menuTabBar");
  const sections = document.getElementById("menuSections");
  if (!tabBar || !sections) return;

  tabBar.setAttribute("role", "tablist");
  tabBar.textContent = "";
  sections.textContent = "";

  const visibleCategories = MENU_CATEGORIES.filter(
    (category) => category && category.id && !category.hidden,
  );

  if (!visibleCategories.some((category) => category.id === currentMenuTab)) {
    currentMenuTab = visibleCategories[0]?.id || currentMenuTab;
  }

  visibleCategories.forEach((category) => {
    const tab = document.createElement("button");
    tab.className = "tab-btn";
    tab.type = "button";
    tab.dataset.tab = category.id;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", `tab-${category.id}`);
    tab.innerHTML = category.icon;
    tab.append(document.createTextNode(localizeMenuCategory(category, "tab")));
    tabBar.appendChild(tab);

    const section = document.createElement("section");
    section.className = "menu-section";
    section.id = `tab-${category.id}`;
    section.setAttribute("role", "tabpanel");

    const title = document.createElement("div");
    title.className = "menu-category-title";
    title.innerHTML = category.icon;
    title.append(
      document.createTextNode(localizeMenuCategory(category, "title")),
    );

    const grid = document.createElement("div");
    grid.className = "menu-grid";
    (category.items || [])
      .filter((item) => !item.hidden)
      .forEach((item) => grid.appendChild(createMenuItem(item)));

    section.append(title, grid);
    sections.appendChild(section);
  });

  switchTab(currentMenuTab);
}

function switchTab(name, btn) {
  currentMenuTab = name;
  resetMenuFilters();

  document.querySelectorAll(".menu-section").forEach((s) => {
    s.classList.remove("active");
    s.style.display = "none";
  });
  document.querySelectorAll(".tab-btn").forEach((b) => {
    const isActive = b.dataset.tab === name;
    b.classList.toggle("active", isActive);
    b.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  const target = document.getElementById("tab-" + name);
  if (target) {
    target.style.display = "block";
    target.classList.add("active");
  }

  const activeBtn = btn || document.querySelector('[data-tab="' + name + '"]');
  if (activeBtn) activeBtn.classList.add("active");

  updateMenuResults();
}

function resetMenuFilters() {
  const search = document.getElementById("menuSearch");
  if (search) search.value = "";
  activeMenuFilter = "all";
  document.querySelectorAll("[data-menu-filter]").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.menuFilter === "all");
  });
}

function normalizeMenuText(value) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getMenuItemText(item) {
  if (!item.dataset.searchText) {
    item.dataset.searchText = normalizeMenuText(item.textContent);
  }
  return item.dataset.searchText;
}

function menuItemMatchesFilter(item, filter) {
  if (filter === "all") return true;
  const text = getMenuItemText(item);
  const section = item.closest(".menu-section");
  const sectionId = section ? section.id.replace("tab-", "") : "";

  const filterMap = {
    plate: ["plate", "طبق"],
    appetizers: ["appetizers", "sticks", "wings", "مقبلات"],
    sweet: [
      "sweet",
      "dessert",
      "crepe",
      "chocolat",
      "kinder",
      "oreo",
      "حلويات",
    ],
    salad: ["salad", "ceasar", "crab", "fattoush", "tabouleh", "سلطة"],
    sandwiches: ["sandwiches", "سندويشات"],
  };

  return (
    sectionId.includes(filter) ||
    (filterMap[filter] || [filter]).some((term) => text.includes(term))
  );
}

function hasActiveMenuSearch() {
  const search = document.getElementById("menuSearch");
  return Boolean(search && search.value.trim()) || activeMenuFilter !== "all";
}

function updateMenuResults() {
  const query = normalizeMenuText(document.getElementById("menuSearch")?.value);
  const searching = hasActiveMenuSearch();
  let visibleCount = 0;

  document.querySelectorAll(".menu-section").forEach((section) => {
    let sectionMatches = 0;

    section.querySelectorAll(".menu-item").forEach((item) => {
      const matchesQuery = !query || getMenuItemText(item).includes(query);
      const matchesFilter = menuItemMatchesFilter(item, activeMenuFilter);
      const shouldShow = matchesQuery && matchesFilter;

      item.hidden = !shouldShow;
      if (shouldShow) {
        sectionMatches += 1;
        visibleCount += 1;
      }
    });

    if (searching) {
      section.style.display = sectionMatches ? "block" : "none";
      section.classList.toggle("active", sectionMatches > 0);
    } else {
      const isCurrent = section.id === `tab-${currentMenuTab}`;
      section.style.display = isCurrent ? "block" : "none";
      section.classList.toggle("active", isCurrent);
    }
  });

  const empty = document.getElementById("menuEmpty");
  const count = document.getElementById("menuResultsCount");
  if (empty) empty.hidden = visibleCount > 0 || !searching;
  if (count) {
    count.textContent = searching ? t("menu.count", visibleCount) : "";
  }
}

function initMenuSearch() {
  const search = document.getElementById("menuSearch");
  if (search) search.addEventListener("input", updateMenuResults);

  document.querySelectorAll("[data-menu-filter]").forEach((chip) => {
    chip.addEventListener("click", () => {
      activeMenuFilter = chip.dataset.menuFilter;
      document
        .querySelectorAll("[data-menu-filter]")
        .forEach((btn) => btn.classList.toggle("active", btn === chip));
      updateMenuResults();
    });
  });
}

// ─────────────────────────────────────────────
// GUEST MOMENTS REEL
// ─────────────────────────────────────────────

function switchGuestMoment(moment) {
  document.querySelectorAll("[data-moment-target]").forEach((tab) => {
    const isActive = tab.dataset.momentTarget === moment;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  document.querySelectorAll("[data-moment-panel]").forEach((panel) => {
    const isActive = panel.dataset.momentPanel === moment;
    panel.classList.toggle("active", isActive);
    panel.hidden = !isActive;
  });
}

function initGuestMoments() {
  document.querySelectorAll("[data-moment-target]").forEach((tab) => {
    tab.addEventListener("click", () => {
      switchGuestMoment(tab.dataset.momentTarget);
    });
  });
}

// ─────────────────────────────────────────────
// SCROLL REVEAL
// ─────────────────────────────────────────────

function initReveal() {
  // Only target un-revealed elements in the current active page
  const elements = document.querySelectorAll(
    ".page.active .reveal:not(.visible)",
  );

  if (!("IntersectionObserver" in window)) {
    document
      .querySelectorAll(".page.active .reveal")
      .forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  elements.forEach((el) => observer.observe(el));
}

// ─────────────────────────────────────────────
// BUBBLES
// ─────────────────────────────────────────────

function createBubbles() {
  const container = document.getElementById("bubbles");
  if (!container) return;
  for (let i = 0; i < 18; i++) {
    const b = document.createElement("div");
    b.className = "bubble";
    const size = Math.random() * 40 + 8;
    const left = Math.random() * 100;
    const dur = Math.random() * 15 + 8;
    const delay = Math.random() * 10;
    const startY = 80 + Math.random() * 20;
    b.style.cssText = `width:${size}px;height:${size}px;left:${left}%;top:${startY}%;animation-duration:${dur}s;animation-delay:-${delay}s;`;
    b.style.animationName = "bubbleFloat";
    container.appendChild(b);
  }
}

const bStyle = document.createElement("style");
bStyle.textContent = `@keyframes bubbleFloat{0%{transform:translateY(0) scale(1);opacity:0;}10%{opacity:1;}90%{opacity:0.6;}100%{transform:translateY(-110vh) scale(0.8);opacity:0;}}`;
document.head.appendChild(bStyle);
createBubbles();

// ─────────────────────────────────────────────
// CURSOR RIPPLE
// ─────────────────────────────────────────────

document.addEventListener("click", (e) => {
  const r = document.createElement("div");
  r.className = "cursor-ripple";
  r.style.left = e.clientX + "px";
  r.style.top = e.clientY + "px";
  document.body.appendChild(r);
  r.addEventListener("animationend", () => r.remove());
});

// ─────────────────────────────────────────────
// WEATHER
// ─────────────────────────────────────────────

async function loadWeather() {
  try {
    const res = await fetch(VENUE.weatherUrl);
    if (!res.ok) throw new Error("Weather request failed");
    const data = await res.json();
    const w = data.current_weather;
    if (!w || typeof w.temperature !== "number") {
      throw new Error("Weather response missing current temperature");
    }
    const temp = Math.round(w.temperature);

    let icon = "☀";
    if (w.weathercode >= 1 && w.weathercode <= 3) icon = "⛅";
    if (w.weathercode >= 45) icon = "🌫";
    if (w.weathercode >= 51) icon = "🌧";
    if (w.weathercode >= 71) icon = "❄";

    ["temperatureNav", "temperatureNavM"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = temp + "°";
    });
    ["weatherIconNav", "weatherIconNavM"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = icon;
    });

    const atm = document.getElementById("liveAtmosphere");
    if (atm) {
      if (temp >= 33) {
        atm.textContent = t("weather.hot");
        document.body.classList.add("hot-weather");
      } else {
        document.body.classList.remove("hot-weather");
        if (temp >= 26) atm.textContent = t("weather.sunny");
        else atm.textContent = t("weather.fresh");
      }
    }
  } catch {
    setWeatherFallback();
  }
}

function setWeatherFallback() {
  ["temperatureNav", "temperatureNavM"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = "Live";
  });
  ["weatherIconNav", "weatherIconNavM"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = "☀";
  });

  const atm = document.getElementById("liveAtmosphere");
  if (atm) atm.textContent = t("weather.fallback");
  document.body.classList.remove("hot-weather");
}

// ─────────────────────────────────────────────
// OPEN / CLOSED STATUS
// ─────────────────────────────────────────────

function updateOpenStatus() {
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const isOpen = cur >= VENUE.openingMinutes && cur < VENUE.closingMinutes;

  [
    ["openStatus", "statusWidget", "statusDot"],
    ["openStatusM", "statusWidgetM", "statusDotM"],
  ].forEach(([tid, wid, did]) => {
    const txt = document.getElementById(tid);
    const widget = document.getElementById(wid);
    const dot = document.getElementById(did);
    if (!txt) return;

    if (isOpen) {
      txt.textContent = t("status.open");
      if (widget) widget.className = "nav-widget status-widget open";
      if (dot) {
        dot.className = "status-dot open-dot";
        dot.style.background = "";
      }
    } else {
      txt.textContent = t("status.closed");
      if (widget) widget.className = "nav-widget status-widget closed";
      if (dot) {
        dot.className = "status-dot closed-dot";
        dot.style.background = "#ff5252";
      }
    }
  });
}

function hydrateVenueDetails() {
  document
    .querySelectorAll("[data-venue-map-link]")
    .forEach((link) => (link.href = VENUE.mapUrl));
  document
    .querySelectorAll("[data-venue-whatsapp-link]")
    .forEach((link) => (link.href = VENUE.whatsappUrl));
  document
    .querySelectorAll("[data-venue-event-whatsapp-link]")
    .forEach((link) => (link.href = VENUE.eventWhatsappUrl));
  document
    .querySelectorAll(".hours-popover-time")
    .forEach((el) => (el.textContent = VENUE.hoursLabel));
}

// ─────────────────────────────────────────────
// EXTERNAL LINK CONFIRMATION DIALOG
// ─────────────────────────────────────────────

const externalConfirmCopy = {
  en: {
    cancel: "Stay here",
    whatsapp: {
      title: "Continue to WhatsApp?",
      message:
        "You are about to open WhatsApp to contact Ourjouwan for bookings or event inquiries.",
      action: "Open WhatsApp",
      icon: `<svg viewBox="0 0 24 24"><path d="M4.5 19.5 5.7 16A8 8 0 1 1 9 19.2l-4.5.3Z"/><path d="M9.2 8.6c.4 2 2.1 3.8 4.1 4.5l1.3-1.2 2.1.6c.2 1-.1 1.9-.9 2.4-3.5.4-7.2-2.9-8-6.2.4-.8 1.2-1.2 2.1-1l.7 2-1.4 1.1Z"/></svg>`,
    },
    location: {
      title: "Open directions?",
      message:
        "You are about to leave the site and open Google Maps for Ourjouwan Resort & Pool.",
      action: "Open Maps",
      icon: `<svg viewBox="0 0 24 24"><path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z"/><circle cx="12" cy="10" r="2.2"/></svg>`,
    },
  },
  ar: {
    cancel: "البقاء هنا",
    whatsapp: {
      title: "المتابعة إلى واتساب؟",
      message:
        "أنت على وشك فتح واتساب للتواصل مع أرجوان بخصوص الحجوزات أو الاستفسار عن المناسبات.",
      action: "فتح واتساب",
      icon: `<svg viewBox="0 0 24 24"><path d="M4.5 19.5 5.7 16A8 8 0 1 1 9 19.2l-4.5.3Z"/><path d="M9.2 8.6c.4 2 2.1 3.8 4.1 4.5l1.3-1.2 2.1.6c.2 1-.1 1.9-.9 2.4-3.5.4-7.2-2.9-8-6.2.4-.8 1.2-1.2 2.1-1l.7 2-1.4 1.1Z"/></svg>`,
    },
    location: {
      title: "فتح الاتجاهات؟",
      message:
        "أنت على وشك مغادرة الموقع وفتح خرائط Google للوصول إلى Ourjouwan Resort & Pool.",
      action: "فتح الخريطة",
      icon: `<svg viewBox="0 0 24 24"><path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z"/><circle cx="12" cy="10" r="2.2"/></svg>`,
    },
  },
};

let pendingExternalUrl = "";
const allowedExternalHosts = new Set(["wa.me", "maps.google.com"]);

function getExternalLinkType(url) {
  let parsed;
  try {
    parsed = new URL(url, window.location.href);
  } catch {
    return "";
  }

  if (parsed.protocol !== "https:" || !allowedExternalHosts.has(parsed.host)) {
    return "";
  }

  if (parsed.host === "wa.me") return "whatsapp";
  if (parsed.host === "maps.google.com") return "location";
  return "";
}

function ensureConfirmDialog() {
  let overlay = document.getElementById("externalConfirm");
  if (overlay) return overlay;

  overlay = document.createElement("div");
  overlay.id = "externalConfirm";
  overlay.className = "confirm-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
      <div class="confirm-content">
        <div class="confirm-icon" id="confirmIcon"></div>
        <div class="confirm-title" id="confirmTitle"></div>
        <p class="confirm-message" id="confirmMessage"></p>
        <div class="confirm-actions">
          <button class="confirm-cancel" type="button" data-confirm-cancel></button>
          <button class="confirm-continue" type="button" data-confirm-continue></button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.closest("[data-confirm-cancel]"))
      closeExternalConfirm();
    if (e.target.closest("[data-confirm-continue]")) {
      const url = pendingExternalUrl;
      closeExternalConfirm();
      if (url && getExternalLinkType(url)) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeExternalConfirm();
  });

  return overlay;
}

function openExternalConfirm(url, type) {
  const languageCopy =
    externalConfirmCopy[currentLanguage] || externalConfirmCopy.en;
  const copy = languageCopy[type];
  if (!copy) return;
  pendingExternalUrl = url;
  const overlay = ensureConfirmDialog();
  overlay.dir = currentLanguage === "ar" ? "rtl" : "ltr";
  document.getElementById("confirmIcon").innerHTML = copy.icon;
  document.getElementById("confirmTitle").textContent = copy.title;
  document.getElementById("confirmMessage").textContent = copy.message;
  overlay.querySelector("[data-confirm-cancel]").textContent =
    languageCopy.cancel;
  overlay.querySelector("[data-confirm-continue]").textContent = copy.action;
  overlay.classList.add("visible");
  overlay.setAttribute("aria-hidden", "false");
}

function closeExternalConfirm() {
  const overlay = document.getElementById("externalConfirm");
  if (!overlay) return;
  overlay.classList.remove("visible");
  overlay.setAttribute("aria-hidden", "true");
  pendingExternalUrl = "";
}

// Intercept external link clicks
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[href]");
  if (!link) return;
  const href = link.getAttribute("href") || "";
  const type = getExternalLinkType(href);
  if (!type) return;
  e.preventDefault();
  openExternalConfirm(link.href, type);
});

// ─────────────────────────────────────────────
// PHOTO STACK CYCLER
// ─────────────────────────────────────────────

function cycleStack(stack) {
  const photos = stack.querySelectorAll(".stack-photo");
  const first = photos[0];

  first.classList.add("animating");
  setTimeout(() => {
    first.classList.remove("animating");
    stack.appendChild(first);
    refreshStack(stack);
  }, 650);
}

function refreshStack(stack) {
  const photos = stack.querySelectorAll(".stack-photo");
  photos.forEach((photo, index) => {
    photo.style.zIndex = photos.length - index;
    if (index === 0)
      photo.style.transform = "translateY(0px) rotate(-2deg) scale(1)";
    if (index === 1)
      photo.style.transform = "translateY(10px) rotate(2deg) scale(.97)";
    if (index === 2)
      photo.style.transform = "translateY(20px) rotate(-3deg) scale(.94)";
    if (index === 3)
      photo.style.transform = "translateY(30px) rotate(3deg) scale(.91)";
  });
}

let galleryLightboxItems = [];
let galleryLightboxIndex = 0;

function ensureGalleryLightbox() {
  let lightbox = document.getElementById("galleryLightbox");
  if (lightbox) return lightbox;

  lightbox = document.createElement("div");
  lightbox.id = "galleryLightbox";
  lightbox.className = "gallery-lightbox";
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.innerHTML = `
    <div class="gallery-lightbox-panel" role="dialog" aria-modal="true" aria-labelledby="galleryLightboxTitle">
      <button class="gallery-lightbox-close" type="button" aria-label="Close gallery" data-gallery-close>
        <span></span><span></span>
      </button>
      <button class="gallery-lightbox-nav gallery-lightbox-prev" type="button" aria-label="Previous photo" data-gallery-prev>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>
      </button>
      <figure>
        <img alt="" data-gallery-image />
        <figcaption>
          <span id="galleryLightboxTitle" data-gallery-title></span>
          <span data-gallery-count></span>
        </figcaption>
      </figure>
      <button class="gallery-lightbox-nav gallery-lightbox-next" type="button" aria-label="Next photo" data-gallery-next>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>
      </button>
    </div>`;
  document.body.appendChild(lightbox);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.closest("[data-gallery-close]")) {
      closeGalleryLightbox();
    }
    if (e.target.closest("[data-gallery-prev]")) showGalleryLightboxImage(-1);
    if (e.target.closest("[data-gallery-next]")) showGalleryLightboxImage(1);
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("visible")) return;
    if (e.key === "Escape") closeGalleryLightbox();
    if (e.key === "ArrowLeft") showGalleryLightboxImage(-1);
    if (e.key === "ArrowRight") showGalleryLightboxImage(1);
  });

  return lightbox;
}

function openGalleryLightbox(stack, startIndex = 0) {
  galleryLightboxItems = Array.from(stack.querySelectorAll(".stack-photo")).map(
    (img) => ({
      src: img.currentSrc || img.src,
      alt: img.alt || stack.dataset.galleryName || "Ourjouwan gallery photo",
      title: stack.dataset.galleryName || "Gallery",
    }),
  );
  galleryLightboxIndex = startIndex;

  const lightbox = ensureGalleryLightbox();
  lightbox.classList.add("visible");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  renderGalleryLightbox();

  const close = lightbox.querySelector("[data-gallery-close]");
  if (close) close.focus();
}

function renderGalleryLightbox() {
  const lightbox = ensureGalleryLightbox();
  const item = galleryLightboxItems[galleryLightboxIndex];
  if (!item) return;

  const image = lightbox.querySelector("[data-gallery-image]");
  const title = lightbox.querySelector("[data-gallery-title]");
  const count = lightbox.querySelector("[data-gallery-count]");

  image.src = item.src;
  image.alt = item.alt;
  title.textContent = item.title;
  count.textContent = `${galleryLightboxIndex + 1} / ${galleryLightboxItems.length}`;
}

function showGalleryLightboxImage(direction) {
  if (!galleryLightboxItems.length) return;
  galleryLightboxIndex =
    (galleryLightboxIndex + direction + galleryLightboxItems.length) %
    galleryLightboxItems.length;
  renderGalleryLightbox();
}

function closeGalleryLightbox() {
  const lightbox = document.getElementById("galleryLightbox");
  if (!lightbox) return;
  lightbox.classList.remove("visible");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
}

function handleGalleryStackKey(event, stack) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  openGalleryLightbox(stack);
}

// ─────────────────────────────────────────────
// INIT ON DOM READY
// ─────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
  await loadSanityContent();
  hydrateVenueDetails();
  setLanguage(currentLanguage, { persist: false });
  initDeclarativeActions();
  initMenuSearch();
  initGuestMoments();

  updateMenuResults();

  // Set correct active state for initial page
  markActivePage(currentPage);
  initHoursPopovers();
  setWidgetsVisibility();
  syncThemeToggleState();
  requestAnimationFrame(initReveal);

  // Respond to resize (widget bar visibility)
  window.addEventListener("resize", setWidgetsVisibility);

  // Weather & status polling
  updateOpenStatus();
  setInterval(loadWeather, 300000); // every 5 min
  setInterval(updateOpenStatus, 60000); // every 1 min
});

// ─────────────────────────────────────────────
// MOBILE SWIPE NAVIGATION
// ─────────────────────────────────────────────

let touchStartX = 0;
let touchEndX = 0;

document.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;

  handleSwipeGesture();
});

function handleSwipeGesture() {
  const diff = touchEndX - touchStartX;

  if (Math.abs(diff) < 80) return;

  const pages = ["home", "menu", "gallery"];
  let index = pages.indexOf(currentPage);

  // swipe left
  if (diff < 0 && index < pages.length - 1) {
    navigateWithLoader(pages[index + 1], getPageLoaderLabel(pages[index + 1]));
  }

  // swipe right
  if (diff > 0 && index > 0) {
    navigateWithLoader(pages[index - 1], getPageLoaderLabel(pages[index - 1]));
  }
}

// ─────────────────────────────────────────────
// 3D CARD TILT
// ─────────────────────────────────────────────

document.querySelectorAll(".event-stack-card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -(y - centerY) / 18;
    const rotateY = (x - centerX) / 18;

    card.style.transform = `
      perspective(1200px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(-10px)
    `;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});
