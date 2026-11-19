/* Parts shared by every page: header (menu, search, cart and wishlist badges,
   language and theme), footer, book cards, the date format and the
   add-to-cart / wishlist buttons. A page calls  Site.start(render)  and
   `render` runs again whenever the language changes.

   All text from data goes in with textContent (through el()), never innerHTML. */
(function () {
  "use strict";
  const { t } = Core;
  const page = document.body.dataset.page;

  /* ---------- tiny DOM helper ----------
     el("a", { href: "x", class: "y", text: "Hi" }, child1, child2)
     Children may be nodes, strings (added as plain text) or arrays. */
  function el(tag, props, ...children) {
    const node = document.createElement(tag);
    Object.entries(props || {}).forEach(([key, value]) => {
      if (value === null || value === undefined || value === false) return;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "vars") Object.entries(value).forEach(([k, v]) => node.style.setProperty(k, v));
      else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? "" : value);
    });
    children.flat(Infinity).forEach((c) => {
      if (c !== null && c !== undefined && c !== false) node.append(c);
    });
    return node;
  }

  /* ---------- icons (Lucide, ISC licence) ----------
     These are fixed strings written here, not user data, so innerHTML is safe. */
  const ICONS = {
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    store: '<path d="M3 9h18l-1.5-5h-15z"/><path d="M5 9v11h14V9M9 20v-6h6v6"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    package: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
    arrowLeft: '<path d="m12 19-7-7 7-7M19 12H5"/>',
    arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
  };
  function icon(name, size = 20) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const attrs = {
      viewBox: "0 0 24 24", width: size, height: size, fill: "none", stroke: "currentColor",
      "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true",
      class: "icon icon-" + name,
    };
    Object.entries(attrs).forEach(([k, v]) => svg.setAttribute(k, v));
    svg.innerHTML = ICONS[name] || "";
    return svg;
  }

  /* ---------- dates ----------
     Some browsers have no Uzbek month names, so Uzbek dates are built by hand:
     "19-noyabr, 2026". */
  const UZ_MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
  function formatDate(date, { year = false, time = false } = {}) {
    const hhmm = String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0");
    if (Core.getLang() === "uz") {
      let s = date.getDate() + "-" + UZ_MONTHS[date.getMonth()];
      if (year) s += ", " + date.getFullYear();
      return time ? s + ", " + hhmm : s;
    }
    const opts = { day: "numeric", month: "long" };
    if (year) opts.year = "numeric";
    const s = Core.formatDate(date, opts);
    return time ? s + ", " + hhmm : s;
  }

  /* ---------- logo ----------
     The real logo files (assets/brand). Both are in the page and CSS shows
     the one that fits the theme. */
  // file: "logo" (header) or "lockup" (footer, with "KITOB DO'KONI · TOSHKENT").
  function logo(cls, file = "logo") {
    const [w, h] = file === "logo" ? [195, 66] : [300, 80];
    return el("a", { class: cls, href: "index.html" },
      el("img", { class: "logo-light", src: `assets/brand/varaq-${file}.svg`, alt: "Varaq", width: w, height: h }),
      el("img", { class: "logo-dark", src: `assets/brand/varaq-${file}-dark.svg`, alt: "Varaq", width: w, height: h })
    );
  }

  /* ---------- page numbers ----------
     Varaq means "a page", so each of the 7 pages carries a folio like a printed
     page: "02 / 07". */
  const PAGES = ["home", "catalog", "book", "cart", "checkout", "wishlist", "orders"];
  const folioText = (name = page) => String(PAGES.indexOf(name) + 1).padStart(2, "0") + " / " + String(PAGES.length).padStart(2, "0");
  const folio = (extra = "") => el("p", { class: "folio " + extra, "aria-hidden": "true", text: folioText() });

  // Small drawing for empty states: a blank page with the Varaq ribbon.
  const EMPTY_ART =
    '<svg viewBox="0 0 120 96" width="120" height="96" aria-hidden="true" focusable="false">' +
    '<path d="M30 14h44l14 14v58H30z" fill="var(--raised)" stroke="var(--line-strong)" stroke-width="1.5"/>' +
    '<path d="M22 8h44l14 14v58H22z" fill="var(--surface)" stroke="var(--ink)" stroke-width="2"/>' +
    '<path d="M66 8v14h14" fill="var(--raised)" stroke="var(--ink)" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M36 40h30M36 48h30M36 56h18" stroke="var(--line-strong)" stroke-width="2.5" stroke-linecap="round"/>' +
    '<path d="M30 8h9v80l-4.5-6-4.5 6z" fill="var(--brand)"/></svg>';
  function emptyArt() {
    const box = el("div", { class: "empty-art" });
    box.innerHTML = EMPTY_ART; // fixed drawing written here, no user data
    return box;
  }

  /* ---------- header ---------- */
  const NAV = [
    ["home", "index.html"],
    ["catalog", "catalog.html"],
    ["wishlist", "wishlist.html"],
    ["orders", "orders.html"],
  ];

  function renderHeader() {
    const host = document.getElementById("site-header");
    if (!host) return;
    const menuBtn = el("button", {
      type: "button", class: "icon-btn menu-btn", "aria-expanded": "false", "aria-controls": "site-nav",
      "data-i18n-aria": "nav.menu",
    }, icon("menu"), icon("x"));

    const nav = el("nav", { id: "site-nav", class: "site-nav", "data-i18n-aria": "nav.label" },
      el("ul", null, NAV.map(([key, href]) =>
        el("li", null, el("a", { href, "aria-current": page === key ? "page" : null, "data-i18n": "page." + key }))
      ))
    );

    const search = el("form", { class: "header-search", role: "search", action: "catalog.html" },
      el("label", { for: "headerQ", class: "visually-hidden", "data-i18n": "header.search" }),
      el("input", { id: "headerQ", name: "q", type: "search", class: "input", autocomplete: "off", "data-i18n-placeholder": "header.searchPh" }),
      el("button", { type: "submit", class: "icon-btn", "data-i18n-aria": "header.searchBtn" }, icon("search"))
    );

    const badgeLink = (id, href, name) =>
      el("a", { id, href, class: "icon-btn badge-link", "aria-current": page === name ? "page" : null },
        icon(name === "cart" ? "cart" : "heart"),
        el("span", { class: "badge", "aria-hidden": "true" }),
        el("span", { class: "visually-hidden badge-label" })
      );

    const langs = el("div", { class: "seg", role: "group", "data-i18n-aria": "lang.label" },
      ["uz", "ru", "en"].map((code) =>
        el("button", { type: "button", "data-lang": code, lang: code, text: code.toUpperCase() })
      )
    );
    const theme = el("button", { type: "button", id: "themeToggle", class: "icon-btn" }, icon("sun", 18), icon("moon", 18));

    host.append(
      el("div", { class: "container header-bar" },
        logo("brand"),
        nav,
        search,
        el("div", { class: "header-tools" },
          badgeLink("wishLink", "wishlist.html", "wishlist"),
          badgeLink("cartLink", "cart.html", "cart"),
          menuBtn
        ),
        // Language and theme: in the top row, or inside the menu on small phones.
        el("div", { class: "header-prefs" }, langs, theme)
      )
    );

    // Phone menu: open/close, close on Escape or after picking a link.
    const setOpen = (open) => {
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", t(open ? "nav.close" : "nav.menu"));
      host.classList.toggle("menu-open", open);
    };
    menuBtn.addEventListener("click", () => setOpen(menuBtn.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && host.classList.contains("menu-open")) {
        setOpen(false);
        menuBtn.focus();
      }
    });
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
  }

  function updateBadges() {
    const set = (id, count, key) => {
      const link = document.getElementById(id);
      if (!link) return;
      link.querySelector(".badge").textContent = count ? String(count) : "";
      link.querySelector(".badge-label").textContent = t(key, { count });
      link.setAttribute("title", t(key, { count }));
    };
    set("cartLink", Shop.cart.count(), "header.cart");
    set("wishLink", Shop.wishlist.count(), "header.wishlist");
  }

  /* ---------- footer ---------- */
  function renderFooter() {
    const host = document.getElementById("site-footer");
    if (!host) return;
    const links = [
      ["page.home", "index.html"], ["page.catalog", "catalog.html"], ["page.cart", "cart.html"],
      ["page.wishlist", "wishlist.html"], ["page.orders", "orders.html"],
    ];
    // Column headings are numbered like chapters: 01, 02, 03.
    const heading = (id, n, key) => el("h2", { id }, el("span", { class: "foot-num", "aria-hidden": "true", text: n }), el("span", { "data-i18n": key }));
    host.append(
      el("div", { class: "container footer-grid" },
        el("div", { class: "footer-about" },
          logo("footer-logo", "lockup"),
          el("p", { class: "footer-tagline", "data-i18n": "footer.tagline" })
        ),
        el("nav", { "aria-labelledby": "footShop" },
          heading("footShop", "01", "footer.shop"),
          el("ul", null, links.map(([key, href]) => el("li", null, el("a", { href, "data-i18n": key }))))
        ),
        el("nav", { "aria-labelledby": "footCats" },
          heading("footCats", "02", "footer.cats"),
          el("ul", null, Shop.CATEGORIES.map((c) =>
            el("li", null, el("a", { href: "catalog.html?cat=" + c, "data-i18n": "cat." + c }))
          ))
        ),
        el("section", { "aria-labelledby": "footAbout" },
          heading("footAbout", "03", "footer.about"),
          el("p", { "data-i18n": "footer.note" }),
          el("p", { "data-i18n": "footer.saved" })
        )
      ),
      el("div", { class: "container footer-bottom" },
        el("p", { "data-i18n": "footer.copy" }),
        el("p", { class: "footer-folio", "aria-hidden": "true", text: "Varaq — " + folioText() })
      )
    );
  }

  /* ---------- book pieces ---------- */
  // The real cover (a local image), shown whole inside a 2:3 frame. If a book
  // has no cover image, or it fails to load, a plain typographic cover is shown.
  // alt is empty when the title is written right next to the cover anyway.
  function fallbackCover(book) {
    return el("div", { class: "cover-fallback" },
      el("span", { class: "cf-author", text: Shop.author(book) }),
      el("span", { class: "cf-title", text: Shop.title(book) }),
      el("img", { class: "cf-mark", src: "assets/brand/varaq-symbol.svg", alt: "", width: 20, height: 20 })
    );
  }
  function cover(book, size = "md", alt = "", eager = false) {
    const frame = el("div", { class: "cover cover-" + size });
    if (!book.cover) {
      frame.append(fallbackCover(book));
      if (alt) frame.setAttribute("role", "img"), frame.setAttribute("aria-label", alt);
      else frame.setAttribute("aria-hidden", "true");
      return frame;
    }
    const img = el("img", { src: book.cover, alt, loading: size === "lg" || eager ? "eager" : "lazy", decoding: "async" });
    img.addEventListener("error", () => img.replaceWith(fallbackCover(book)), { once: true });
    frame.append(img);
    return frame;
  }

  function rating(book) {
    return el("p", { class: "rating" },
      icon("star", 16),
      el("span", { "aria-hidden": "true", text: book.rating.toFixed(1) }),
      el("span", { class: "visually-hidden", text: t("card.rating", { rating: book.rating.toFixed(1) }) }),
      el("span", { class: "rating-count", text: t("card.reviews", { count: book.reviews }) })
    );
  }

  function priceTag(book) {
    return el("p", { class: "price" },
      el("span", { class: "price-now", text: Shop.price(book.price) }),
      Shop.onSale(book) && el("s", { class: "price-old" },
        el("span", { class: "visually-hidden", text: t("card.was") + " " }),
        Shop.price(book.old)
      )
    );
  }

  function tags(book) {
    const list = [];
    if (Shop.onSale(book)) list.push(el("span", { class: "tag tag-sale", text: "−" + Shop.salePercent(book) + "%" }));
    if (Shop.isNew(book)) list.push(el("span", { class: "tag tag-new", text: t("card.new") }));
    if (book.best) list.push(el("span", { class: "tag tag-best", text: t("card.best") }));
    return list.length ? el("p", { class: "tags" }, list) : null;
  }

  // Card for grids. The add and heart buttons are handled once for the whole
  // page (see the click handler below), and syncCards() keeps their state right.
  function bookCard(book) {
    const href = "book.html?id=" + book.id;
    const card = el("article", { class: "card", "data-card": book.id },
      el("a", { href, class: "card-cover", tabindex: "-1", "aria-hidden": "true" }, cover(book)),
      el("div", { class: "card-body" },
        tags(book),
        el("h3", { class: "card-title" }, el("a", { href, text: Shop.title(book) })),
        el("p", { class: "card-author", text: Shop.author(book) }),
        rating(book),
        priceTag(book)
      ),
      el("div", { class: "card-actions" },
        el("button", { type: "button", class: "btn btn-add", "data-add": book.id },
          icon("cart", 17), icon("check", 17), el("span", { class: "lbl" })
        ),
        el("button", { type: "button", class: "icon-btn btn-wish", "data-wish": book.id }, icon("heart", 18))
      )
    );
    syncCards(card);
    return card;
  }

  // A <ul> grid of cards.
  function bookGrid(books, extraClass = "") {
    return el("ul", { class: "book-grid " + extraClass }, books.map((b) => el("li", null, bookCard(b))));
  }

  // Updates add/heart buttons in place (so keyboard focus is never lost).
  function syncCards(root = document) {
    root.querySelectorAll("[data-add]").forEach((btn) => {
      const book = Shop.book(btn.dataset.add);
      const inCart = Shop.cart.qty(book.id) > 0;
      const out = !inCart && Shop.available(book.id) === 0;
      btn.disabled = out;
      btn.classList.toggle("is-in-cart", inCart);
      btn.querySelector(".lbl").textContent = t(out ? "card.out" : inCart ? "card.inCart" : "card.add");
      btn.setAttribute("aria-label", t(out ? "card.outAria" : inCart ? "card.inCartAria" : "card.addAria", { title: Shop.title(book) }));
    });
    root.querySelectorAll("[data-wish]").forEach((btn) => {
      const book = Shop.book(btn.dataset.wish);
      const on = Shop.wishlist.has(book.id);
      btn.classList.toggle("is-on", on);
      // Icon-only heart: a toggle button with a fixed name. (A heart button with
      // visible text changes its text instead, see book.js.)
      if (!btn.querySelector("span")) {
        btn.setAttribute("aria-pressed", String(on));
        btn.setAttribute("aria-label", t("card.wishAria", { title: Shop.title(book) }));
        btn.setAttribute("title", t(on ? "card.wishOn" : "card.wishOff"));
      }
    });
  }

  /* ---------- shared actions ---------- */
  const goToCart = { get label() { return t("toast.viewCart"); }, onClick: () => (location.href = "cart.html") };

  function addToCart(id, n = 1) {
    const book = Shop.book(id);
    const added = Shop.cart.add(book.id, n);
    if (added) Core.toast(t("toast.added", { title: Shop.title(book), count: added }), { label: goToCart.label, onClick: goToCart.onClick });
    else Core.toast(t("toast.noStock"));
    return added;
  }

  function toggleWish(id) {
    const book = Shop.book(id);
    const on = Shop.wishlist.toggle(book.id);
    Core.toast(t(on ? "toast.wishAdded" : "toast.wishRemoved", { title: Shop.title(book) }), {
      label: t("toast.undo"),
      onClick: () => Shop.wishlist.toggle(book.id),
    });
  }

  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) {
      // Already in the cart: the button works as a link to the cart.
      if (Shop.cart.qty(Number(add.dataset.add)) > 0) location.href = "cart.html";
      else addToCart(add.dataset.add);
      return;
    }
    const wish = e.target.closest("[data-wish]");
    if (wish) toggleWish(wish.dataset.wish);
  });

  /* ---------- page title ---------- */
  let titleFn = null;
  function setTitle() {
    const part = titleFn ? titleFn() : "";
    document.title = part ? part + " — " + t("brand") : t("meta.title");
  }

  /* ---------- start ----------
     render: draws the page's own content (runs on load and on language change)
     options.title: () => text for the browser tab
     options.onChange: runs when the cart, wishlist or orders change */
  function start(render, options = {}) {
    titleFn = options.title || null;
    renderHeader();
    renderFooter();
    // Page number above the page title, and the drawing in empty states.
    const h1 = document.querySelector("main h1");
    if (h1 && page !== "home") h1.before(folio());
    document.querySelectorAll(".empty").forEach((box) => box.prepend(emptyArt()));
    Core.onLang(() => {
      render();
      updateBadges();
      syncCards();
      setTitle();
    });
    Shop.onChange(() => {
      updateBadges();
      syncCards();
      if (options.onChange) options.onChange();
    });
    Core.init();
  }

  window.Site = { el, icon, cover, rating, priceTag, tags, bookCard, bookGrid, syncCards, addToCart, formatDate, setTitle, start, folio, emptyArt };
})();
