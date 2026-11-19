# Varaq — online bookstore

Site #3 of my 10-websites course project. A multi-page bookstore in plain HTML, CSS and JavaScript (no framework, no build step, no backend).

## Pages
| Page | What it does |
| --- | --- |
| `index.html` | Home: categories, bestsellers, new arrivals, sale, recently viewed |
| `catalog.html` | Search (title or author, any language), category / language / price / stock / sale filters, sorting, pages. Filters are saved in the URL |
| `book.html?id=3` | Book page: price, stock, quantity, add to cart, wishlist, details, similar books |
| `cart.html` | Change quantities, remove with Undo, promo codes, free-delivery progress, totals |
| `checkout.html` | Form with checks on every field, delivery method and price, order summary, order confirmation |
| `wishlist.html` | Saved books, add all to cart |
| `orders.html` | Past orders, status, cancel (first 5 minutes), buy again |

Demo promo codes: `KITOB10` (10% off), `TALABA15` (15% off from 150 000 so'm), `BEPUL` (free delivery).

## Features
- UZ / RU / EN interface, book titles and descriptions in all three languages
- Dark / light mode (saved), mobile-first, keyboard and screen-reader friendly
- Cart, wishlist, orders and stock are saved in localStorage and stay in sync between tabs
- Stock limits: you can't add more copies than the shop has; cancelling an order puts them back
- No card details are ever asked for (payment on delivery, demo only)

## Code
- `js/core.js`: shared helpers (translations, theme, storage, toasts)
- `js/lang.js`: interface text in three languages
- `js/books.js`: the 30 books
- `js/shop.js`: cart, wishlist, promo codes, delivery, orders
- `js/layout.js`: header, footer, book cards, shared buttons
- `js/pages/*.js`: one file per page

Run locally with any static server, for example `node ../_shared/serve.mjs . 5175`.

## Design
- Brand: logo files in `assets/brand/` (a page with a folded corner and a bookmark ribbon whose notch is a "V"; the ribbon is also the tail of the "q" in the wordmark).
- Colours: warm paper, deep ink, vermilion (tokens in `css/base.css`, some darkened to pass WCAG AA; the original values are noted there).
- Fonts: Roboto Slab (headlines) and Manrope (everything else), both with Cyrillic.
- Signature detail: every page carries a page number like a printed book ("02 / 07"), and sections and checkout steps are numbered.
- Real covers for 26 of the 30 books, stored locally in `assets/covers/` (sources in `assets/covers/SOURCES.md`). The other 4 show a plain typographic cover.
