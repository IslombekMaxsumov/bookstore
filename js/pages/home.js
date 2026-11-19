/* Home page: hero, perks, categories, bestsellers, new arrivals, sale, recently viewed. */
(function () {
  "use strict";
  const { t } = Core;
  const { el, icon } = Site;
  const $ = (id) => document.getElementById(id);

  const byNewest = (a, b) => b.added.localeCompare(a.added);
  const byPopular = (a, b) => b.reviews - a.reviews;

  function render() {
    const free = Shop.price(Shop.FREE_FROM);
    $("heroText").textContent = t("home.heroText", { amount: free });
    $("promoText").textContent = t("home.promoText", { code: "KITOB10" });

    $("perks").replaceChildren(
      ...[
        ["truck", t("home.perk1", { amount: free })],
        ["store", t("home.perk2")],
        ["wallet", t("home.perk3")],
      ].map(([name, text]) => el("li", null, icon(name, 22), el("span", { text })))
    );

    // Category tiles with how many books each has.
    $("cats").replaceChildren(
      ...Shop.CATEGORIES.map((cat) => {
        const count = Shop.BOOKS.filter((b) => b.cat === cat).length;
        return el("li", null,
          el("a", { class: "cat-tile", href: "catalog.html?cat=" + cat, "data-cat": cat },
            el("span", { class: "cat-name", text: t("cat." + cat) }),
            el("span", { class: "cat-count", text: t("home.catCount", { count }) })
          )
        );
      })
    );

    const row = (id, books) => $(id).replaceChildren(Site.bookGrid(books.slice(0, 4), "book-row"));
    row("best", Shop.BOOKS.filter((b) => b.best).sort(byPopular));
    row("new", [...Shop.BOOKS].sort(byNewest));
    row("sale", Shop.BOOKS.filter(Shop.onSale).sort((a, b) => Shop.salePercent(b) - Shop.salePercent(a)));

    const recent = Shop.recent.ids().map(Shop.book);
    $("recentSection").hidden = recent.length === 0;
    if (recent.length) row("recent", recent);
  }

  Site.start(render);
})();
