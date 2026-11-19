/* Shop logic: books, cart, wishlist, promo codes, delivery, orders.
   Everything is saved in localStorage (through Core.store), so it survives
   reloads and works across all pages. No backend.

   Any change fires a "shop:change" event, so every page (and other open tabs,
   through the "storage" event) can update its header badges and buttons. */
(function () {
  "use strict";
  const { store, t } = Core;
  const NS = window.APP_NS + ":";

  /* ---------- books ---------- */
  const BOOKS = window.BOOKS;
  const byId = new Map(BOOKS.map((b) => [b.id, b]));
  const lang = () => Core.getLang();

  // Book text in the current language (English if a translation is missing).
  const title = (b) => b.title[lang()] || b.title.en;
  const author = (b) => b.author[lang()] || b.author.en;
  const desc = (b) => b.desc[lang()] || b.desc.en;

  // Search ignores case and apostrophes, so "otkan" finds "O'tkan kunlar",
  // and matches the title/author in all three languages.
  const norm = (s) => s.toLowerCase().replace(/['ʻʼ‘’`´]/g, "").replace(/ё/g, "е");
  BOOKS.forEach((b) => {
    b.haystack = norm([...Object.values(b.title), ...Object.values(b.author)].join(" "));
  });
  const matches = (b, query) => norm(query).trim().split(/\s+/).every((word) => b.haystack.includes(word));

  // The 8 most recently added books count as "new".
  const newest = [...BOOKS].sort((a, b) => b.added.localeCompare(a.added)).slice(0, 8).map((b) => b.id);
  const isNew = (b) => newest.includes(b.id);
  const onSale = (b) => b.old > b.price;
  const salePercent = (b) => (onSale(b) ? Math.round((1 - b.price / b.old) * 100) : 0);

  // "89 000 so'm" (UZ/RU) or "89,000 UZS" (EN). Uzbek number formatting is
  // missing in some browsers, so the grouping is done by hand.
  function price(n) {
    const sep = lang() === "en" ? "," : " ";
    const amount = String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    return t("price", { amount });
  }

  /* ---------- change events ---------- */
  function emit() {
    window.dispatchEvent(new Event("shop:change"));
  }
  function onChange(fn) {
    window.addEventListener("shop:change", fn);
    // Another tab changed the cart, wishlist or orders.
    window.addEventListener("storage", (e) => {
      if (e.key && e.key.startsWith(NS) && !e.key.endsWith(":lang") && !e.key.endsWith(":theme")) fn();
    });
  }

  /* ---------- stock ---------- */
  // Copies sold by orders placed in this browser: { bookId: count }.
  const sold = () => store.getJSON("sold", {}) || {};
  function available(id) {
    const b = byId.get(id);
    return b ? Math.max(0, b.stock - (sold()[id] || 0)) : 0;
  }

  /* ---------- cart: [{ id, qty }] ---------- */
  function readCart() {
    const raw = store.getJSON("cart", []);
    if (!Array.isArray(raw)) return [];
    return raw.filter((l) => l && byId.has(l.id) && Number.isInteger(l.qty) && l.qty > 0);
  }
  function writeCart(lines) {
    store.setJSON("cart", lines);
    emit();
  }

  const cart = {
    items: readCart,
    qty: (id) => (readCart().find((l) => l.id === id) || { qty: 0 }).qty,
    count: () => readCart().reduce((sum, l) => sum + l.qty, 0),

    // Adds up to `n` copies, never more than are in stock. Returns how many were added.
    add(id, n = 1) {
      const lines = readCart();
      const line = lines.find((l) => l.id === id);
      const inCart = line ? line.qty : 0;
      const added = Math.max(0, Math.min(n, available(id) - inCart));
      if (!added) return 0;
      if (line) line.qty += added;
      else lines.push({ id, qty: added });
      writeCart(lines);
      return added;
    },

    // Sets the quantity, kept between 1 and what's in stock.
    set(id, qty) {
      const lines = readCart();
      const line = lines.find((l) => l.id === id);
      if (!line) return;
      line.qty = Math.max(1, Math.min(Math.floor(qty) || 1, available(id)));
      writeCart(lines);
    },

    // Returns what was removed, so it can be put back with restore() (Undo).
    remove(id) {
      const lines = readCart();
      const index = lines.findIndex((l) => l.id === id);
      if (index === -1) return null;
      const [line] = lines.splice(index, 1);
      writeCart(lines);
      return { line, index };
    },
    restore(removed) {
      if (!removed) return;
      const lines = readCart().filter((l) => l.id !== removed.line.id);
      lines.splice(removed.index, 0, removed.line);
      writeCart(lines);
    },

    // Lowers quantities if stock went down (e.g. an order in another tab).
    // Returns true if anything changed.
    fix() {
      const lines = readCart();
      let changed = false;
      const fixed = lines
        .map((l) => {
          const max = available(l.id);
          if (l.qty > max) changed = true;
          return { id: l.id, qty: Math.min(l.qty, max) };
        })
        .filter((l) => l.qty > 0);
      if (changed) writeCart(fixed);
      return changed;
    },

    lines: () => readCart().map((l) => {
      const book = byId.get(l.id);
      return { book, qty: l.qty, total: book.price * l.qty };
    }),
    subtotal: () => cart.lines().reduce((sum, l) => sum + l.total, 0),
    clear: () => writeCart([]),
  };

  /* ---------- wishlist: [id, ...] ---------- */
  function readWish() {
    const raw = store.getJSON("wishlist", []);
    return Array.isArray(raw) ? raw.filter((id) => byId.has(id)) : [];
  }
  const wishlist = {
    ids: readWish,
    has: (id) => readWish().includes(id),
    count: () => readWish().length,
    // Returns true if the book is now in the wishlist.
    toggle(id) {
      const ids = readWish();
      const on = !ids.includes(id);
      store.setJSON("wishlist", on ? [id, ...ids] : ids.filter((x) => x !== id));
      emit();
      return on;
    },
  };

  /* ---------- promo codes ---------- */
  const PROMOS = {
    KITOB10: { percent: 10 },
    TALABA15: { percent: 15, min: 150000 },
    BEPUL: { freeDelivery: true },
  };
  const promo = {
    list: Object.keys(PROMOS),
    rule: (code) => PROMOS[code],
    current() {
      const code = store.get("promo", "");
      return PROMOS[code] ? code : "";
    },
    // Returns "" if applied, otherwise the reason: "empty" or "unknown".
    apply(input) {
      const code = String(input || "").trim().toUpperCase();
      if (!code) return "empty";
      if (!PROMOS[code]) return "unknown";
      store.set("promo", code);
      emit();
      return "";
    },
    clear() {
      store.set("promo", "");
      emit();
    },
  };

  /* ---------- delivery and totals ---------- */
  const FREE_FROM = 300000; // free courier delivery from this amount (after discount)
  const DELIVERY = {
    courier: { cost: 25000, days: [1, 2] },
    pickup: { cost: 0, days: [1, 1] },
    post: { cost: 15000, days: [3, 7] },
  };

  function totals(method = "courier") {
    const subtotal = cart.subtotal();
    const code = promo.current();
    const rule = PROMOS[code];
    // A minimum-order code stays saved, but only counts once the order is big enough.
    const promoWorks = Boolean(rule) && subtotal >= (rule.min || 0);
    let discount = 0;
    if (promoWorks && rule.percent) discount = Math.round((subtotal * rule.percent) / 100 / 100) * 100;
    const afterDiscount = subtotal - discount;

    const option = DELIVERY[method] || DELIVERY.courier;
    let delivery = option.cost;
    if (method === "courier" && afterDiscount >= FREE_FROM) delivery = 0;
    if (promoWorks && rule.freeDelivery) delivery = 0;
    if (!subtotal) delivery = 0;

    return {
      subtotal, discount, delivery, code, promoWorks,
      total: afterDiscount + delivery,
      freeLeft: Math.max(0, FREE_FROM - afterDiscount),
    };
  }

  /* ---------- orders ---------- */
  function readOrders() {
    const raw = store.getJSON("orders", []);
    return Array.isArray(raw) ? raw.filter((o) => o && o.id && Array.isArray(o.items)) : [];
  }

  // Demo order status, based on how long ago the order was placed: it can be
  // cancelled for 5 minutes, is "on the way" for a day, then "delivered".
  const CANCEL_WINDOW = 5 * 60 * 1000;
  function status(order, now = Date.now()) {
    if (order.cancelled) return "cancelled";
    const age = now - order.placedAt;
    if (age < CANCEL_WINDOW) return "processing";
    if (age < 24 * 60 * 60 * 1000) return "shipping";
    return "delivered";
  }

  function addSold(items, sign) {
    const s = sold();
    items.forEach((it) => {
      s[it.id] = Math.max(0, (s[it.id] || 0) + sign * it.qty);
    });
    store.setJSON("sold", s);
  }

  // details: { name, phone, email, region, address, method, point, payment, comment }
  function placeOrder(details) {
    cart.fix();
    const lines = cart.lines();
    if (!lines.length) return null;
    const now = Date.now();
    const order = {
      id: "VQ-" + String(now).slice(-6),
      placedAt: now,
      items: lines.map((l) => ({ id: l.book.id, qty: l.qty, price: l.book.price })),
      ...totals(details.method),
      details,
      cancelled: false,
    };
    store.setJSON("orders", [order, ...readOrders()]);
    addSold(order.items, 1);
    store.setJSON("cart", []);
    store.set("promo", "");
    emit();
    return order;
  }

  function cancelOrder(id) {
    const orders = readOrders();
    const order = orders.find((o) => o.id === id);
    if (!order || status(order) !== "processing") return false;
    order.cancelled = true;
    store.setJSON("orders", orders);
    addSold(order.items, -1); // the books go back into stock
    emit();
    return true;
  }

  // Earliest and latest delivery date for a method.
  function deliveryDates(method, from = Date.now()) {
    const days = (DELIVERY[method] || DELIVERY.courier).days;
    return days.map((d) => new Date(from + d * 24 * 60 * 60 * 1000));
  }

  /* ---------- recently viewed ---------- */
  const recent = {
    ids: () => {
      const raw = store.getJSON("recent", []);
      return Array.isArray(raw) ? raw.filter((id) => byId.has(id)) : [];
    },
    push(id) {
      store.setJSON("recent", [id, ...recent.ids().filter((x) => x !== id)].slice(0, 8));
    },
  };

  window.Shop = {
    BOOKS, CATEGORIES: window.CATEGORIES, FREE_FROM, DELIVERY,
    book: (id) => byId.get(Number(id)),
    title, author, desc, matches, isNew, onSale, salePercent, price, available,
    cart, wishlist, promo, totals,
    orders: readOrders, status, placeOrder, cancelOrder, deliveryDates, CANCEL_WINDOW,
    recent, onChange,
  };
})();
