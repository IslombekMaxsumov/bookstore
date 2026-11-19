/* Checkout: contact and delivery form with checks on every field, delivery
   method and price, order summary, then "place order" (saved in this browser).
   No card details are ever asked for: payment happens on delivery (demo). */
(function () {
  "use strict";
  const { t, store } = Core;
  const { el } = Site;
  const $ = (id) => document.getElementById(id);
  const form = $("coForm");

  const REGIONS = [
    "tashkentCity", "tashkent", "andijan", "bukhara", "fergana", "jizzakh", "kashkadarya",
    "khorezm", "namangan", "navoi", "samarkand", "surkhandarya", "syrdarya", "karakalpakstan",
  ];
  const POINTS = ["chilonzor", "yunusobod", "mirzoUlugbek"];
  const DRAFT_FIELDS = ["name", "phone", "email", "region", "address", "point", "comment"];

  /* ---------- reading the form ---------- */
  const method = () => form.querySelector('[name="method"]:checked').value;
  const payment = () => form.querySelector('[name="payment"]:checked').value;
  const digits = (s) => s.replace(/\D/g, "");

  // "+998 90 123 45 67". Accepts 9 digits (local) or 12 starting with 998.
  function phoneDigits(value) {
    const d = digits(value);
    if (d.length === 9) return "998" + d;
    return d;
  }
  function formatPhone(value) {
    const d = phoneDigits(value);
    if (d.length !== 12 || !d.startsWith("998")) return value.trim();
    return `+998 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10)}`;
  }

  /* ---------- checks: each returns an error key, or "" if fine ---------- */
  const CHECKS = {
    name: () => {
      const v = form.name.value.trim();
      return v.length >= 3 && /\p{L}/u.test(v) ? "" : "err.name";
    },
    phone: () => {
      const d = phoneDigits(form.phone.value);
      return d.length === 12 && d.startsWith("998") ? "" : "err.phone";
    },
    email: () => {
      const v = form.email.value.trim();
      return !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "err.email";
    },
    region: () => (form.region.value ? "" : "err.region"),
    address: () => (method() === "pickup" || form.address.value.trim().length >= 5 ? "" : "err.address"),
    point: () => (method() !== "pickup" || form.point.value ? "" : "err.point"),
    agree: () => (form.agree.checked ? "" : "err.agree"),
  };

  const touched = new Set(); // fields are only checked after the visitor leaves them once

  function showError(name, key) {
    const input = form[name];
    input.setAttribute("aria-invalid", String(Boolean(key)));
    $(name + "-err").textContent = key ? t(key) : "";
  }
  function check(name) {
    const key = CHECKS[name]();
    showError(name, key);
    return key;
  }

  /* ---------- delivery options ---------- */
  function updateDelivery() {
    // Pickup points are only in Tashkent city.
    const pickup = form.querySelector('[name="method"][value="pickup"]');
    const inTashkent = form.region.value === "tashkentCity";
    pickup.disabled = !inTashkent;
    $("pickupNote").hidden = inTashkent;
    if (!inTashkent && pickup.checked) form.querySelector('[name="method"][value="courier"]').checked = true;

    const isPickup = method() === "pickup";
    $("addressField").hidden = isPickup;
    $("pointField").hidden = !isPickup;

    Object.keys(Shop.DELIVERY).forEach((m) => {
      const cost = Shop.totals(m).delivery;
      $("price-" + m).textContent = cost ? Shop.price(cost) : t("free");
    });
    renderSummary();
  }

  /* ---------- summary ---------- */
  function renderSummary() {
    const lines = Shop.cart.lines();
    $("coLines").replaceChildren(
      ...lines.map(({ book, qty, total }) =>
        el("li", null,
          el("span", { class: "mini-title", text: Shop.title(book) }),
          el("span", { class: "mini-qty", text: "× " + qty }),
          el("span", { class: "mini-total", text: Shop.price(total) })
        )
      )
    );
    const sum = Shop.totals(method());
    const rows = [[t("cart.subtotal"), Shop.price(sum.subtotal)]];
    if (sum.discount) rows.push([t("cart.discount", { code: sum.code }), "−" + Shop.price(sum.discount)]);
    rows.push([t("cart.delivery"), sum.delivery ? Shop.price(sum.delivery) : t("free")]);
    rows.push([t("cart.total"), Shop.price(sum.total), "is-total"]);
    $("coTotals").replaceChildren(
      ...rows.map(([term, value, cls]) => el("div", { class: cls || null }, el("dt", { text: term }), el("dd", { text: value })))
    );
    $("placeBtn").textContent = t("co.place", { total: Shop.price(sum.total) });
  }

  /* ---------- select options (translated) ---------- */
  let draftSelects = {}; // saved region/point, used once the options exist
  function fillSelects() {
    const keep = [form.region.value || draftSelects.region || "", form.point.value || draftSelects.point || ""];
    draftSelects = {};
    form.region.replaceChildren(
      el("option", { value: "", text: t("co.regionPick") }),
      ...REGIONS.map((r) => el("option", { value: r, text: t("region." + r) }))
    );
    form.point.replaceChildren(
      el("option", { value: "", text: t("co.pointPick") }),
      ...POINTS.map((p) => el("option", { value: p, text: t("point." + p) }))
    );
    [form.region.value, form.point.value] = keep;
  }

  function updateCounter() {
    $("comment-count").textContent = t("co.chars", { count: form.comment.value.length, max: 300 });
  }

  /* ---------- draft: the form survives a reload ---------- */
  function saveDraft() {
    const draft = { method: method(), payment: payment() };
    DRAFT_FIELDS.forEach((f) => (draft[f] = form[f].value));
    store.setJSON("checkoutDraft", draft);
  }
  function loadDraft() {
    const draft = store.getJSON("checkoutDraft", null);
    if (!draft || typeof draft !== "object") return;
    DRAFT_FIELDS.forEach((f) => {
      if (typeof draft[f] === "string") form[f].value = draft[f];
    });
    draftSelects = { region: draft.region, point: draft.point };
    ["method", "payment"].forEach((group) => {
      const radio = form.querySelector(`[name="${group}"][value="${draft[group]}"]`);
      if (radio) radio.checked = true;
    });
  }

  /* ---------- events ---------- */
  form.addEventListener("focusout", (e) => {
    const name = e.target.name;
    if (name === "phone") form.phone.value = formatPhone(form.phone.value);
    if (CHECKS[name] && e.target.value !== "") touched.add(name);
    if (touched.has(name)) check(name);
  });

  form.addEventListener("input", (e) => {
    const name = e.target.name;
    if (touched.has(name)) check(name); // errors go away as soon as the field is fixed
    if (name === "comment") updateCounter();
    saveDraft();
  });

  form.addEventListener("change", (e) => {
    if (e.target.name === "region" || e.target.name === "method") {
      updateDelivery();
      if (touched.has("address")) check("address");
      if (touched.has("point")) check("point");
    }
    if (e.target.name === "agree" || e.target.name === "region") {
      touched.add(e.target.name);
      check(e.target.name);
    }
    saveDraft();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.phone.value = formatPhone(form.phone.value);
    const failed = Object.keys(CHECKS).filter((name) => {
      touched.add(name);
      return check(name);
    });

    const summary = $("errorSummary");
    if (failed.length) {
      // List the problems at the top, each a link to its field.
      summary.hidden = false;
      summary.replaceChildren(
        el("p", { text: t("err.summary", { count: failed.length }) }),
        el("ul", null, failed.map((name) =>
          el("li", null, el("a", {
            href: "#" + name, text: t(CHECKS[name]()),
            onclick: (ev) => {
              ev.preventDefault();
              form[name].focus();
            },
          }))
        ))
      );
      form[failed[0]].focus();
      return;
    }
    summary.hidden = true;

    const details = {
      name: form.name.value.trim(),
      phone: formatPhone(form.phone.value),
      email: form.email.value.trim(),
      region: form.region.value,
      method: method(),
      address: method() === "pickup" ? "" : form.address.value.trim(),
      point: method() === "pickup" ? form.point.value : "",
      payment: payment(),
      comment: form.comment.value.trim(),
    };
    const order = Shop.placeOrder(details);
    if (!order) return showState();
    store.setJSON("checkoutDraft", null);
    showDone(order);
  });

  /* ---------- page states ---------- */
  let placed = null;

  function showDone(order) {
    placed = order;
    $("coFull").hidden = true;
    $("coEmpty").hidden = true;
    $("done").hidden = false;
    renderDone();
    $("doneTitle").focus();
  }

  function renderDone() {
    const [from, to] = Shop.deliveryDates(placed.details.method, placed.placedAt);
    const dates = from.toDateString() === to.toDateString()
      ? Site.formatDate(from)
      : Site.formatDate(from) + " – " + Site.formatDate(to);
    $("doneTitle").textContent = t("done.title", { number: placed.id });
    $("doneText").textContent = t("done.text", { phone: placed.details.phone, dates, total: Shop.price(placed.total) });
    $("doneOrders").href = "orders.html?placed=" + encodeURIComponent(placed.id);
  }

  function showState() {
    const empty = Shop.cart.count() === 0;
    $("coEmpty").hidden = !empty;
    $("coFull").hidden = empty;
  }

  function render() {
    if (placed) return renderDone();
    fillSelects();
    updateDelivery();
    updateCounter();
    // Re-show any errors in the new language.
    touched.forEach((name) => check(name));
  }

  Shop.cart.fix();
  loadDraft();
  showState();
  Site.start(render, {
    title: () => t("page.checkout"),
    onChange: () => {
      if (placed) return;
      showState();
      updateDelivery();
    },
  });
})();
