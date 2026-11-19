/* Cart page: change quantities, remove (with Undo), promo codes, totals and
   progress toward free delivery. */
(function () {
  "use strict";
  const { t } = Core;
  const { el, icon } = Site;
  const $ = (id) => document.getElementById(id);
  let focusAfterRender = null; // where keyboard focus goes after a line is removed

  /* ---------- one cart line ---------- */
  function line({ book, qty }) {
    const title = Shop.title(book);
    const href = "book.html?id=" + book.id;
    const input = el("input", {
      type: "number", class: "input qty-input", min: 1, max: Shop.available(book.id), value: qty,
      inputmode: "numeric", "aria-label": t("cart.qtyAria", { title }),
    });
    input.addEventListener("change", () => Shop.cart.set(book.id, Number(input.value)));

    return el("li", { class: "cart-line", "data-line": book.id },
      el("a", { href, class: "line-cover", tabindex: "-1", "aria-hidden": "true" }, Site.cover(book, "sm")),
      el("div", { class: "line-info" },
        el("h3", { class: "line-title" }, el("a", { href, text: title })),
        el("p", { class: "line-author", text: Shop.author(book) }),
        el("p", { class: "line-each", text: t("cart.each", { price: Shop.price(book.price) }) }),
        el("p", { class: "line-stock hint" })
      ),
      el("div", { class: "stepper" },
        el("button", {
          type: "button", class: "icon-btn", "data-step": -1, "aria-label": t("cart.dec", { title }),
          onclick: () => Shop.cart.set(book.id, Shop.cart.qty(book.id) - 1),
        }, icon("minus", 18)),
        input,
        el("button", {
          type: "button", class: "icon-btn", "data-step": 1, "aria-label": t("cart.inc", { title }),
          onclick: () => Shop.cart.set(book.id, Shop.cart.qty(book.id) + 1),
        }, icon("plus", 18))
      ),
      el("p", { class: "line-total" }),
      el("button", {
        type: "button", class: "icon-btn line-remove", "aria-label": t("cart.removeAria", { title }), title: t("cart.remove"),
        onclick: () => removeLine(book.id),
      }, icon("trash", 18))
    );
  }

  // Updates numbers on an existing line (keeps focus on the + / − buttons).
  function updateLine(node, { book, qty, total }) {
    const max = Shop.available(book.id);
    const input = node.querySelector("input");
    if (document.activeElement !== input) input.value = qty;
    input.max = max;
    node.querySelector('[data-step="-1"]').disabled = qty <= 1;
    node.querySelector('[data-step="1"]').disabled = qty >= max;
    node.querySelector(".line-total").textContent = Shop.price(total);
    node.querySelector(".line-stock").textContent = qty >= max ? t("cart.maxNote", { count: max }) : "";
  }

  function removeLine(id) {
    const ids = Shop.cart.items().map((l) => l.id);
    focusAfterRender = ids.indexOf(id);
    const removed = Shop.cart.remove(id);
    Core.toast(t("toast.removed", { title: Shop.title(Shop.book(id)) }), {
      label: t("toast.undo"),
      onClick: () => Shop.cart.restore(removed),
    });
  }

  /* ---------- whole page ---------- */
  function renderLines() {
    const lines = Shop.cart.lines();
    $("cartEmpty").hidden = lines.length > 0;
    $("cartFull").hidden = lines.length === 0;
    $("cartLines").replaceChildren(...lines.map(line));
    lines.forEach((l) => updateLine($("cartLines").querySelector(`[data-line="${l.book.id}"]`), l));

    // After a removal, focus the next line (or the page title if the cart is empty).
    if (focusAfterRender !== null) {
      const links = $("cartLines").querySelectorAll(".line-title a");
      (links[Math.min(focusAfterRender, links.length - 1)] || $("cartTitle")).focus();
      focusAfterRender = null;
    }
  }

  function renderSummary() {
    const count = Shop.cart.count();
    $("itemsTitle").textContent = t("cart.items", { count });
    const sum = Shop.totals("courier");
    const rule = sum.code ? Shop.promo.rule(sum.code) : null;

    // Free delivery progress
    const freeByCode = sum.promoWorks && rule.freeDelivery;
    const bar = $("freeBar");
    if (freeByCode || sum.freeLeft === 0) {
      bar.replaceChildren(el("p", { class: "free-yes" }, icon("check", 18), el("span", { text: t("cart.freeYes") })));
    } else {
      const done = Shop.FREE_FROM - sum.freeLeft;
      bar.replaceChildren(
        el("p", { id: "freeText", text: t("cart.freeLeft", { amount: Shop.price(sum.freeLeft) }) }),
        el("progress", { max: Shop.FREE_FROM, value: done, "aria-labelledby": "freeText" })
      );
    }

    // Applied code
    const applied = $("appliedPromo");
    applied.replaceChildren();
    if (sum.code) {
      // (append() would print `false` as text, so it goes through el())
      applied.append(el("div", { class: "applied-inner" },
        el("p", null,
          el("strong", { text: sum.code }), " — ",
          t("promo." + sum.code, { amount: Shop.price(rule.min || 0) })
        ),
        !sum.promoWorks && el("p", { class: "warn", text: t("promo.needMore", { amount: Shop.price(rule.min - sum.subtotal) }) }),
        el("button", {
          type: "button", class: "btn btn-ghost btn-small", text: t("promo.remove"),
          onclick: () => {
            Shop.promo.clear();
            $("promoMsg").textContent = t("promo.removed");
            $("promo").focus();
          },
        })
      ));
    }

    // Totals
    const rows = [[t("cart.subtotal"), Shop.price(sum.subtotal)]];
    if (sum.discount) rows.push([t("cart.discount", { code: sum.code }), "−" + Shop.price(sum.discount)]);
    rows.push([t("cart.delivery"), sum.delivery ? Shop.price(sum.delivery) : t("free")]);
    rows.push([t("cart.total"), Shop.price(sum.total), "is-total"]);
    $("totals").replaceChildren(
      ...rows.map(([term, value, cls]) => el("div", { class: cls || null }, el("dt", { text: term }), el("dd", { text: value })))
    );
  }

  function render() {
    $("promoHint").textContent = t("promo.hint", { codes: Shop.promo.list.join(", ") });
    renderLines();
    renderSummary();
  }

  // Cart changed: update lines in place if the same books are there,
  // otherwise redraw them (a line was removed or put back).
  function onChange() {
    const lines = Shop.cart.lines();
    const shown = [...$("cartLines").children].map((n) => Number(n.dataset.line));
    const same = shown.length === lines.length && lines.every((l, i) => l.book.id === shown[i]);
    if (same && lines.length) lines.forEach((l, i) => updateLine($("cartLines").children[i], l));
    else renderLines();
    renderSummary();
  }

  $("promoForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("promo");
    const error = Shop.promo.apply(input.value);
    input.setAttribute("aria-invalid", String(Boolean(error)));
    $("promoMsg").className = "field-msg " + (error ? "is-error" : "is-ok");
    if (error) {
      $("promoMsg").textContent = t("promo.err." + error);
      input.focus();
    } else {
      $("promoMsg").textContent = t("promo.ok", { code: Shop.promo.current() });
      input.value = "";
    }
  });

  // Stock may have dropped since the books were added (an order in another tab).
  if (Shop.cart.fix()) $("stockNote").hidden = false;

  Site.start(render, { title: () => t("page.cart"), onChange });
})();
