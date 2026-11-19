/* My orders: past orders saved in this browser, their (demo) status,
   cancel within 5 minutes, and "buy again". */
(function () {
  "use strict";
  const { t } = Core;
  const { el } = Site;
  const $ = (id) => document.getElementById(id);
  const placedId = new URLSearchParams(location.search).get("placed");
  const dialog = $("cancelDialog");
  let cancelling = null;

  function deliveryText(d) {
    const method = t("co.m." + d.method);
    const where = d.method === "pickup" ? t("point." + d.point) : d.address;
    return [method, t("region." + d.region), where].filter(Boolean).join(" · ");
  }

  function orderCard(order) {
    const status = Shop.status(order);
    const count = order.items.reduce((s, it) => s + it.qty, 0);
    const headingId = "order-" + order.id;

    return el("article", { class: "order" + (order.id === placedId ? " is-new" : ""), "aria-labelledby": headingId, "data-order": order.id },
      el("header", { class: "order-head" },
        el("h2", { id: headingId, text: t("orders.number", { number: order.id }) }),
        el("p", { class: "order-date", text: t("orders.placed", { date: Site.formatDate(new Date(order.placedAt), { year: true, time: true }) }) }),
        // Status is shown by text and an icon, not only by colour.
        el("p", { class: "status status-" + status },
          Site.icon({ processing: "clock", shipping: "truck", delivered: "check", cancelled: "ban" }[status], 16),
          el("span", { text: t("status." + status) })
        )
      ),
      el("div", { class: "order-body" },
      el("ul", { class: "mini-lines" },
        order.items.map((it) => {
          const book = Shop.book(it.id);
          return el("li", null,
            book ? el("a", { class: "mini-title", href: "book.html?id=" + it.id, text: Shop.title(book) }) : el("span", { class: "mini-title", text: "—" }),
            el("span", { class: "mini-qty", text: "× " + it.qty }),
            el("span", { class: "mini-total", text: Shop.price(it.price * it.qty) })
          );
        })
      ),
      el("dl", { class: "order-facts" },
        [
          [t("orders.items"), t("cart.items", { count })],
          [t("cart.delivery"), deliveryText(order.details) + " — " + (order.delivery ? Shop.price(order.delivery) : t("free"))],
          [t("co.payment"), t("pay." + order.details.payment)],
          order.discount ? [t("cart.discount", { code: order.code }), "−" + Shop.price(order.discount)] : null,
          [t("cart.total"), Shop.price(order.total)],
        ].filter(Boolean).map(([term, value]) => el("div", null, el("dt", { text: term }), el("dd", { text: value })))
      )
      ),
      el("div", { class: "order-actions" },
        el("button", { type: "button", class: "btn btn-ghost", text: t("orders.again"), onclick: () => buyAgain(order) }),
        status === "processing" && el("button", {
          type: "button", class: "btn btn-danger-ghost", text: t("orders.cancel"),
          onclick: () => askCancel(order),
        })
      )
    );
  }

  function buyAgain(order) {
    const added = order.items.reduce((sum, it) => sum + Shop.cart.add(it.id, it.qty), 0);
    if (added) Core.toast(t("orders.againDone", { count: added }), { label: t("toast.viewCart"), onClick: () => (location.href = "cart.html") });
    else Core.toast(t("orders.againNone"));
  }

  function askCancel(order) {
    cancelling = order.id;
    $("cancelTitle").textContent = t("orders.cancelQ", { number: order.id });
    dialog.showModal();
  }
  // The buttons handle closing themselves (the dialog's "close" event is not
  // fired reliably in every browser).
  function closeDialog(confirmed) {
    const id = cancelling;
    cancelling = null;
    dialog.close();
    if (confirmed && id) {
      const ok = Shop.cancelOrder(id);
      Core.toast(t(ok ? "orders.cancelled" : "orders.tooLate", { number: id }));
    }
    // Put focus back on the order that was being cancelled.
    const heading = document.querySelector(`[data-order="${id}"] h2`);
    if (heading) {
      heading.tabIndex = -1;
      heading.focus();
    }
  }
  dialog.querySelector('[value="cancel"]').addEventListener("click", (e) => {
    e.preventDefault();
    closeDialog(true);
  });
  dialog.querySelector('[value="keep"]').addEventListener("click", (e) => {
    e.preventDefault();
    closeDialog(false);
  });
  dialog.addEventListener("cancel", (e) => {
    // Escape key
    e.preventDefault();
    closeDialog(false);
  });

  function render() {
    const orders = Shop.orders();
    $("ordersEmpty").hidden = orders.length > 0;
    $("ordersNote").hidden = orders.length === 0;
    $("ordersList").replaceChildren(...orders.map(orderCard));

    const placed = orders.find((o) => o.id === placedId);
    $("placedNote").hidden = !placed;
    if (placed) $("placedNote").textContent = t("orders.thanks", { number: placed.id });
  }

  // Statuses change with time (processing → on the way → delivered), so
  // redraw once a minute, but never while the cancel dialog is open.
  let lastStatuses = "";
  setInterval(() => {
    const now = Shop.orders().map((o) => Shop.status(o)).join();
    if (now !== lastStatuses && !dialog.open) {
      lastStatuses = now;
      render();
    }
  }, 60 * 1000);

  Site.start(render, {
    title: () => t("page.orders"),
    onChange: () => {
      if (!dialog.open) render();
    },
  });
  lastStatuses = Shop.orders().map((o) => Shop.status(o)).join();
})();
