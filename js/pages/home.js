/* Home page: hero with a cover composition, perks, categories, numbered
   bestsellers, new arrivals, the KITOB10 campaign, sale, recently viewed. */
(function () {
  "use strict";
  const { t } = Core;
  const { el, icon } = Site;
  const $ = (id) => document.getElementById(id);

  const byNewest = (a, b) => b.added.localeCompare(a.added);
  const byPopular = (a, b) => b.reviews - a.reviews;
  const withCover = (b) => Boolean(b.cover);

  // Five covers of different sizes for the hero (ids from books.js).
  const HERO = [1, 20, 11, 9, 26];

  function renderHero() {
    const art = $("heroArt");
    if (art.childElementCount) return; // covers don't change with the language
    art.append(
      el("span", { class: "shape shape-block" }),
      el("span", { class: "shape shape-sage" }),
      el("span", { class: "shape shape-rule" }),
      ...HERO.map((id, i) => {
        const book = Shop.book(id);
        return el("div", { class: "hero-cover hc-" + (i + 1) }, Site.cover(book, "md", "", true));
      })
    );
  }

  function renderPerks() {
    const free = Shop.price(Shop.FREE_FROM);
    $("perks").replaceChildren(
      ...[
        ["truck", t("home.perk1", { amount: free }), t("home.perk1Text")],
        ["store", t("home.perk2"), t("home.perk2Text")],
        ["wallet", t("home.perk3"), t("home.perk3Text")],
      ].map(([name, title, text]) =>
        el("li", null,
          el("span", { class: "perk-icon" }, icon(name, 20)),
          el("span", { class: "perk-copy" }, el("strong", { text: title }), el("span", { text }))
        )
      )
    );
  }

  // Category tiles: number, name, count and a peek at real covers from it.
  // The first (Uzbek literature) is the featured, larger tile.
  function renderCategories() {
    $("cats").replaceChildren(
      ...Shop.CATEGORIES.map((cat, i) => {
        const books = Shop.BOOKS.filter((b) => b.cat === cat);
        const covers = books.filter(withCover).sort(byPopular).slice(0, i === 0 ? 3 : 2);
        return el("li", { class: i === 0 ? "cat-featured" : null },
          el("a", { class: "cat-tile", href: "catalog.html?cat=" + cat },
            el("span", { class: "cat-no", "aria-hidden": "true", text: String(i + 1).padStart(2, "0") }),
            el("span", { class: "cat-name", text: t("cat." + cat) }),
            el("span", { class: "cat-count", text: t("home.catCount", { count: books.length }) }),
            el("span", { class: "cat-covers", "aria-hidden": "true" },
              covers.map((b) => el("img", { src: b.cover, alt: "", loading: "lazy", decoding: "async" }))
            )
          )
        );
      })
    );
  }

  // Bestsellers as a numbered list: the rank sits next to each cover.
  function renderBest() {
    const books = Shop.BOOKS.filter((b) => b.best).sort(byPopular).slice(0, 5);
    $("best").replaceChildren(
      el("ol", { class: "book-grid book-row best-list" },
        books.map((b, i) => el("li", null, el("span", { class: "rank display", "aria-hidden": "true", text: String(i + 1) }), Site.bookCard(b)))
      )
    );
  }

  function renderRecent() {
    const recent = Shop.recent.ids().map(Shop.book).slice(0, 8);
    $("recentSection").hidden = recent.length === 0;
    $("recent").replaceChildren(
      ...recent.map((b) =>
        el("li", null,
          el("a", { href: "book.html?id=" + b.id, class: "recent-item" },
            Site.cover(b, "sm"),
            el("span", { class: "recent-title", text: Shop.title(b) })
          )
        )
      )
    );
  }

  function render() {
    $("heroText").textContent = t("home.heroText", { amount: Shop.price(Shop.FREE_FROM) });
    $("promoText").textContent = t("home.promoText", { code: "KITOB10" });
    renderHero();
    renderPerks();
    renderCategories();
    renderBest();
    $("new").replaceChildren(Site.bookGrid([...Shop.BOOKS].sort(byNewest).slice(0, 5), "book-row"));
    $("sale").replaceChildren(
      Site.bookGrid(Shop.BOOKS.filter(Shop.onSale).sort((a, b) => Shop.salePercent(b) - Shop.salePercent(a)).slice(0, 5), "book-row")
    );
    renderRecent();
  }

  // Copy the promo code (with a fallback message if the clipboard is blocked).
  $("copyCode").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("KITOB10");
      Core.toast(t("home.copied", { code: "KITOB10" }));
    } catch {
      Core.toast(t("home.copyFail", { code: "KITOB10" }));
    }
  });

  Site.start(render);
})();
