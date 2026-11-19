/* Catalog: search, filters, sorting and pages of results.
   The filters live in the URL (catalog.html?cat=kids&sort=newest&page=2), so
   links from other pages work, a reload keeps them and the link can be shared. */
(function () {
  "use strict";
  const { t } = Core;
  const { el } = Site;
  const $ = (id) => document.getElementById(id);
  const form = $("filterForm");
  const PER_PAGE = 12;
  const SORTS = ["popular", "rating", "newest", "priceAsc", "priceDesc", "title"];

  /* ---------- state <-> URL ---------- */
  function readURL() {
    const p = new URLSearchParams(location.search);
    const num = (key) => {
      const n = parseInt(p.get(key), 10);
      return Number.isFinite(n) && n >= 0 ? n : null;
    };
    return {
      q: p.get("q") || "",
      cats: (p.get("cat") || "").split(",").filter((c) => Shop.CATEGORIES.includes(c)),
      lang: ["uz", "ru", "en"].includes(p.get("lang")) ? p.get("lang") : "",
      min: num("min"),
      max: num("max"),
      stock: p.get("stock") === "1",
      sale: p.get("sale") === "1",
      sort: SORTS.includes(p.get("sort")) ? p.get("sort") : "popular",
      page: Math.max(1, num("page") || 1),
    };
  }

  function writeURL(push) {
    const p = new URLSearchParams();
    if (state.q) p.set("q", state.q);
    if (state.cats.length) p.set("cat", state.cats.join(","));
    if (state.lang) p.set("lang", state.lang);
    if (state.min !== null) p.set("min", state.min);
    if (state.max !== null) p.set("max", state.max);
    if (state.stock) p.set("stock", "1");
    if (state.sale) p.set("sale", "1");
    if (state.sort !== "popular") p.set("sort", state.sort);
    if (state.page > 1) p.set("page", state.page);
    const url = location.pathname + (p.toString() ? "?" + p : "");
    history[push ? "pushState" : "replaceState"](null, "", url);
  }

  let state = readURL();

  // Puts the state into the form fields.
  function fillForm() {
    form.q.value = state.q;
    form.querySelectorAll('[name="cat"]').forEach((box) => (box.checked = state.cats.includes(box.value)));
    form.querySelector(`[name="lang"][value="${state.lang}"]`).checked = true;
    form.min.value = state.min ?? "";
    form.max.value = state.max ?? "";
    form.stock.checked = state.stock;
    form.sale.checked = state.sale;
    $("sort").value = state.sort;
  }

  // Reads the form fields into the state.
  function readForm() {
    const num = (input) => {
      const n = parseInt(input.value, 10);
      return Number.isFinite(n) && n >= 0 ? n : null;
    };
    state.q = form.q.value.trim();
    state.cats = [...form.querySelectorAll('[name="cat"]:checked')].map((b) => b.value);
    state.lang = form.querySelector('[name="lang"]:checked').value;
    state.min = num(form.min);
    state.max = num(form.max);
    state.stock = form.stock.checked;
    state.sale = form.sale.checked;
    state.sort = $("sort").value;
  }

  /* ---------- filtering ---------- */
  const priceBad = () => state.min !== null && state.max !== null && state.min > state.max;

  function results() {
    const lang = Core.getLang();
    const list = Shop.BOOKS.filter((b) =>
      (!state.q || Shop.matches(b, state.q)) &&
      (!state.cats.length || state.cats.includes(b.cat)) &&
      (!state.lang || b.lang === state.lang) &&
      (state.min === null || b.price >= state.min) &&
      (state.max === null || priceBad() || b.price <= state.max) &&
      (!state.stock || Shop.available(b.id) > 0) &&
      (!state.sale || Shop.onSale(b))
    );
    const sorters = {
      popular: (a, b) => b.reviews - a.reviews,
      rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
      newest: (a, b) => b.added.localeCompare(a.added),
      priceAsc: (a, b) => a.price - b.price,
      priceDesc: (a, b) => b.price - a.price,
      title: (a, b) => Shop.title(a).localeCompare(Shop.title(b), lang),
    };
    return list.sort(sorters[state.sort]);
  }

  function activeFilters() {
    return (state.q ? 1 : 0) + state.cats.length + (state.lang ? 1 : 0) +
      (state.min !== null || state.max !== null ? 1 : 0) + (state.stock ? 1 : 0) + (state.sale ? 1 : 0);
  }

  /* ---------- drawing ---------- */
  function renderCategories() {
    $("catBoxes").replaceChildren(
      ...Shop.CATEGORIES.map((cat) => {
        const count = Shop.BOOKS.filter((b) => b.cat === cat).length;
        return el("label", { class: "check" },
          el("input", { type: "checkbox", name: "cat", value: cat, checked: state.cats.includes(cat) }),
          el("span", { text: t("cat." + cat) }),
          el("span", { class: "check-count", text: String(count) })
        );
      })
    );
  }

  function renderResults() {
    const list = results();
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    if (state.page > pages) state.page = pages;
    const shown = list.slice((state.page - 1) * PER_PAGE, state.page * PER_PAGE);

    $("resultsCount").textContent = pages > 1
      ? t("results.paged", { count: list.length, page: state.page, pages })
      : t("results", { count: list.length });
    $("grid").replaceChildren(shown.length ? Site.bookGrid(shown) : "");
    $("filtersShow").textContent = t("filters.show", { count: list.length });
    $("empty").hidden = list.length > 0;

    const n = activeFilters();
    $("filterCount").textContent = n ? String(n) : "";
    $("filtersToggle").setAttribute("aria-label", n ? t("filters.toggle", { count: n }) : t("filters.title"));
    $("clearFilters").disabled = n === 0;

    $("priceError").textContent = priceBad() ? t("filters.priceError") : "";
    form.max.setAttribute("aria-invalid", String(priceBad()));

    renderPager(pages);
  }

  function renderPager(pages) {
    const pager = $("pager");
    pager.hidden = pages < 2;
    if (pages < 2) return pager.replaceChildren();
    const go = (page) => () => {
      state.page = page;
      writeURL(true);
      renderResults();
      // Start reading the new page from the top.
      $("resultsCount").focus();
      $("resultsCount").scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    };
    const items = [];
    items.push(el("button", { type: "button", class: "btn btn-ghost", disabled: state.page === 1, onclick: go(state.page - 1), text: t("pager.prev") }));
    for (let i = 1; i <= pages; i++) {
      items.push(el("button", {
        type: "button", class: "btn btn-ghost pager-num", onclick: go(i), text: String(i),
        "aria-label": t("pager.page", { n: i }), "aria-current": i === state.page ? "page" : null,
      }));
    }
    items.push(el("button", { type: "button", class: "btn btn-ghost", disabled: state.page === pages, onclick: go(state.page + 1), text: t("pager.next") }));
    pager.replaceChildren(...items);
  }

  function render() {
    renderCategories();
    fillForm();
    renderResults();
  }

  /* ---------- events ---------- */
  let searchTimer = 0;
  function changed(e) {
    readForm();
    state.page = 1;
    // Wait for a pause in typing before searching.
    clearTimeout(searchTimer);
    const apply = () => {
      writeURL(false);
      renderResults();
    };
    if (e && e.target === form.q) searchTimer = setTimeout(apply, 200);
    else apply();
  }
  form.addEventListener("input", changed);
  form.addEventListener("submit", (e) => e.preventDefault());
  $("sort").addEventListener("change", changed);

  function clearAll() {
    state = { ...readURL(), q: "", cats: [], lang: "", min: null, max: null, stock: false, sale: false, page: 1 };
    fillForm();
    writeURL(false);
    renderResults();
    form.q.focus();
  }
  $("clearFilters").addEventListener("click", clearAll);
  $("emptyClear").addEventListener("click", clearAll);

  // Phones and tablets: the filters are a drawer that slides in from the left.
  // Escape, the × button, the backdrop or "Show N books" close it, and focus
  // goes back to the Filters button.
  const drawerMedia = matchMedia("(max-width: 1023px)");
  function setDrawer(open) {
    $("filtersToggle").setAttribute("aria-expanded", String(open));
    document.querySelector(".catalog").classList.toggle("filters-open", open);
    $("filtersBackdrop").hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
    const panel = $("filters");
    if (open) {
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "true");
      $("filtersClose").focus();
    } else {
      panel.removeAttribute("role");
      panel.removeAttribute("aria-modal");
    }
  }
  const closeDrawer = () => {
    if ($("filtersToggle").getAttribute("aria-expanded") !== "true") return;
    setDrawer(false);
    $("filtersToggle").focus();
  };
  $("filtersToggle").addEventListener("click", () => setDrawer(true));
  $("filtersClose").addEventListener("click", closeDrawer);
  $("filtersShow").addEventListener("click", closeDrawer);
  $("filtersBackdrop").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
    // Keep Tab inside the open drawer.
    if (e.key === "Tab" && drawerMedia.matches && $("filtersToggle").getAttribute("aria-expanded") === "true") {
      const items = [...$("filters").querySelectorAll("button, input, select, a[href]")].filter((n) => !n.disabled && n.offsetParent);
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // Rotating to a wide screen: the drawer becomes the normal sidebar.
  drawerMedia.addEventListener("change", (e) => {
    if (!e.matches) setDrawer(false);
  });

  // Back/forward buttons move between result pages.
  window.addEventListener("popstate", () => {
    state = readURL();
    fillForm();
    renderResults();
  });

  $("resultsCount").tabIndex = -1;
  Site.start(render, {
    title: () => t("page.catalog"),
    // Stock can change (an order in another tab), which affects "in stock only".
    onChange: () => state.stock && renderResults(),
  });
})();
