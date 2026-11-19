/* Book page (book.html?id=3): cover, price, stock, quantity, add to cart,
   wishlist, details, description and similar books. */
(function () {
  "use strict";
  const { t } = Core;
  const { el, icon } = Site;
  const view = document.getElementById("bookView");
  const book = Shop.book(new URLSearchParams(location.search).get("id"));

  if (book) Shop.recent.push(book.id);

  function notFound() {
    view.replaceChildren(
      el("div", { class: "empty" },
        Site.emptyArt(),
        el("h1", { text: t("book.notFound") }),
        el("p", { text: t("book.notFoundText") }),
        el("a", { class: "btn", href: "catalog.html", text: t("book.back") })
      )
    );
  }

  // Quantity stepper: − [ 2 ] +
  function stepper() {
    const input = el("input", { id: "qty", type: "number", class: "input qty-input", min: 1, value: 1, inputmode: "numeric" });
    const change = (delta) => () => {
      input.value = clamp(Number(input.value) + delta);
      updateBuy();
    };
    input.addEventListener("change", () => {
      input.value = clamp(Number(input.value));
      updateBuy();
    });
    return el("div", { class: "field" },
      el("label", { for: "qty", text: t("book.qty") }),
      el("div", { class: "stepper" },
        el("button", { type: "button", class: "icon-btn", id: "qtyDec", "aria-label": t("book.dec"), onclick: change(-1) }, icon("minus", 18)),
        input,
        el("button", { type: "button", class: "icon-btn", id: "qtyInc", "aria-label": t("book.inc"), onclick: change(1) }, icon("plus", 18))
      )
    );
  }

  // How many more copies can still go into the cart.
  const remaining = () => Math.max(0, Shop.available(book.id) - Shop.cart.qty(book.id));
  const clamp = (n) => Math.max(1, Math.min(Math.floor(n) || 1, Math.max(1, remaining())));

  function stockText() {
    const left = Shop.available(book.id);
    if (left === 0) return [t("book.out"), "is-out"];
    if (left <= 5) return [t("book.left", { count: left }), "is-low"];
    return [t("book.inStock"), "is-ok"];
  }

  // Keeps the buy box right after any change (cart, stock, wishlist).
  function updateBuy() {
    const qty = document.getElementById("qty");
    if (!qty) return;
    const left = remaining();
    const inCart = Shop.cart.qty(book.id);
    qty.max = Math.max(1, left);
    if (Number(qty.value) > left && left > 0) qty.value = left;
    qty.disabled = left === 0;
    document.getElementById("qtyDec").disabled = left === 0 || Number(qty.value) <= 1;
    document.getElementById("qtyInc").disabled = left === 0 || Number(qty.value) >= left;

    const buy = document.getElementById("buyBtn");
    buy.disabled = left === 0;
    buy.textContent = left === 0 && inCart ? t("book.allInCart") : left === 0 ? t("card.out") : t("card.add");

    const [text, cls] = stockText();
    const stock = document.getElementById("stockLine");
    stock.textContent = text;
    stock.className = "stock " + cls;

    const note = document.getElementById("inCartNote");
    note.replaceChildren();
    if (inCart) note.append(t("book.inCart", { count: inCart }) + " ", el("a", { href: "cart.html", text: t("toast.viewCart") }));

    const wish = document.getElementById("wishBtn");
    wish.querySelector("span").textContent = t(Shop.wishlist.has(book.id) ? "book.wished" : "book.wish");
  }

  function render() {
    if (!book) return notFound();
    const title = Shop.title(book);
    const catLink = "catalog.html?cat=" + book.cat;

    // Same category first, then the most popular of the rest, 4 in total.
    const similar = [
      ...Shop.BOOKS.filter((b) => b.cat === book.cat && b.id !== book.id).sort((a, b) => b.reviews - a.reviews),
      ...Shop.BOOKS.filter((b) => b.cat !== book.cat).sort((a, b) => b.reviews - a.reviews),
    ].slice(0, 4);

    view.replaceChildren(
      el("nav", { class: "crumbs", "aria-label": t("crumbs.label") },
        el("ol", null,
          el("li", null, el("a", { href: "index.html", text: t("page.home") })),
          el("li", null, el("a", { href: "catalog.html", text: t("page.catalog") })),
          el("li", null, el("a", { href: catLink, text: t("cat." + book.cat) })),
          el("li", null, el("span", { "aria-current": "page", text: title }))
        )
      ),

      el("div", { class: "book-layout" },
        el("div", { class: "book-cover" }, Site.cover(book, "lg", t("book.coverAlt", { title }))),
        el("div", { class: "book-info" },
          Site.folio(),
          Site.tags(book),
          el("h1", { class: "book-title", text: title }),
          el("p", { class: "book-author", text: Shop.author(book) }),
          Site.rating(book),
          Site.priceTag(book),
          Shop.onSale(book) && el("p", { class: "save", text: t("book.save", { amount: Shop.price(book.old - book.price) }) }),
          el("p", { id: "stockLine", class: "stock" }),

          el("div", { class: "buy-box" },
            stepper(),
            el("button", {
              type: "button", id: "buyBtn", class: "btn",
              onclick: () => {
                const qty = document.getElementById("qty");
                if (Site.addToCart(book.id, Number(qty.value))) qty.value = 1;
              },
            }),
            el("button", { type: "button", id: "wishBtn", class: "btn btn-ghost btn-wish", "data-wish": book.id }, icon("heart", 18), el("span"))
          ),
          el("p", { id: "inCartNote", class: "in-cart-note", role: "status" }),

          el("ul", { class: "book-perks" },
            el("li", null, icon("truck", 18), el("span", { text: t("book.perkDelivery", { amount: Shop.price(Shop.FREE_FROM) }) })),
            el("li", null, icon("wallet", 18), el("span", { text: t("home.perk3") }))
          )
        )
      ),

      el("div", { class: "book-more" },
        el("section", { class: "book-about", "aria-labelledby": "aboutTitle" },
          el("h2", { id: "aboutTitle", text: t("book.about") }),
          el("p", { text: Shop.desc(book) })
        ),
        el("section", { class: "book-details", "aria-labelledby": "detailsTitle" },
          el("h2", { id: "detailsTitle", text: t("book.details") }),
          el("dl", null,
            [
              [t("book.author"), Shop.author(book)],
              [t("book.category"), el("a", { href: catLink, text: t("cat." + book.cat) })],
              [t("book.lang"), t("blang." + book.lang)],
              [t("book.year"), String(book.year)],
              [t("book.pages"), String(book.pages)],
            ].map(([term, value]) => el("div", null, el("dt", { text: term }), el("dd", null, value)))
          )
        )
      ),

      el("section", { class: "section", "aria-labelledby": "similarTitle" },
        el("div", { class: "section-head" }, el("h2", { id: "similarTitle", text: t("book.similar") })),
        Site.bookGrid(similar, "book-row")
      )
    );
    updateBuy();
  }

  Site.start(render, {
    title: () => (book ? Shop.title(book) : t("book.notFound")),
    onChange: () => book && updateBuy(),
  });
})();
