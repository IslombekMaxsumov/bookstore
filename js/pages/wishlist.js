/* Wishlist: saved books, add all to cart. Tapping a heart removes the book
   (with Undo in the toast). */
(function () {
  "use strict";
  const { t } = Core;
  const $ = (id) => document.getElementById(id);
  let shownIds = "";

  function render() {
    const books = Shop.wishlist.ids().map(Shop.book);
    shownIds = books.map((b) => b.id).join();
    $("wishCount").textContent = books.length ? t("wish.count", { count: books.length }) : "";
    $("wishEmpty").hidden = books.length > 0;
    $("wishActions").hidden = books.length === 0;
    $("wishGrid").replaceChildren(books.length ? Site.bookGrid(books) : "");
    updateAllButton();
  }

  // "Add all to cart" only makes sense if some saved books aren't in the cart yet.
  function addable() {
    return Shop.wishlist.ids().filter((id) => Shop.cart.qty(id) === 0 && Shop.available(id) > 0);
  }
  function updateAllButton() {
    $("allToCart").disabled = addable().length === 0;
  }

  $("allToCart").addEventListener("click", () => {
    const added = addable().filter((id) => Shop.cart.add(id, 1) > 0).length;
    Core.toast(t("wish.allDone", { count: added }), { label: t("toast.viewCart"), onClick: () => (location.href = "cart.html") });
  });

  Site.start(render, {
    title: () => t("page.wishlist"),
    onChange: () => {
      // Redraw only if the list itself changed (a heart was tapped).
      if (Shop.wishlist.ids().join() !== shownIds) {
        const hadFocus = $("wishGrid").contains(document.activeElement);
        render();
        if (hadFocus) $("wishTitle").focus();
      } else {
        updateAllButton();
      }
    },
  });
})();
