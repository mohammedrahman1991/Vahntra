# Vahntra

Curated fashion outfits, fully shoppable through Amazon. A vanilla HTML, CSS and JavaScript site — no framework, no build step.

## Stack

- Vanilla HTML / CSS / JavaScript (ES modules)
- Data-driven via static JSON in `/data`
- Hosted on Vercel as a static site

## Running locally

Because pages load JSON over `fetch()` and use ES modules, you must serve the site over HTTP — opening `index.html` directly via `file://` will not work.

```bash
python3 -m http.server 8000
# or
npx serve .
```

Then visit `http://localhost:8000`.

## Project structure

- `index.html`, `fits.html`, `fit.html`, `product.html`, `saved.html`, `men.html`, `women.html`, `unisex.html`, `new.html`, `journal.html`, `article.html`, `about.html`, `faq.html`, `contact.html` — public pages
- `affiliate-disclosure.html`, `privacy-policy.html`, `terms.html`, `accessibility.html` — legal pages
- `admin-preview.html` — local-only JSON validator, disabled by default (see below)
- `css/` — design system, one file per concern (variables, global, intro, navigation, fit-grid, fit-breakdown, components, pages, responsive)
- `js/` — one ES module per concern; `main.js` is the per-page bootstrapper
- `data/` — `products.json`, `fits.json`, `articles.json`, `demo-reviews.json`
- `assets/` — logo, hero, editorial, fits, products, journal, icons

## How the data model works

`data/products.json` holds every individual item (name, brand, price, color, sizes, image, Amazon link). `data/fits.json` holds each curated outfit and references products by ID:

```json
{
  "id": "midnight-movement-001",
  "title": "Midnight Movement",
  "productIds": ["oversized-black-tee", "wide-leg-cargo-pants", "minimal-leather-sneakers", "silver-frame-sunglasses"]
}
```

`js/data-loader.js` joins the two at render time (`joinFitWithProducts`), so a single product can appear in multiple fits, and updating a price or Amazon link in one place updates every fit that references it.

### Adding a product

1. Open `data/products.json`.
2. Add a new object with a unique `id`, `label` (e.g. `TOP`, `BOTTOM`, `SHOES`, `ACCESSORY`), `name`, `brand`, `price`, `originalPrice` (or `null`), `color`, `sizes`, `image`, and `amazonLink`.
3. Add the product image to `assets/products/`.

### Adding a fit

1. Open `data/fits.json`.
2. Add a new object with a unique `id`, `fitNumber`, `title`, `slug`, `gender` (`Men` / `Women` / `Unisex`), `style`, `description`, `coverImage`, `fullImage`, `featured`, `newArrival`, `dateAdded`, `tags`, and `productIds` — an array of IDs that already exist in `products.json`.
3. Add `coverImage` (4:5) and `fullImage` (4:5, higher resolution) to `assets/fits/<slug>/`.

### Assigning products to a fit

Just list the product `id`s in that fit's `productIds` array, in the order you want them to appear in the breakdown panel.

### How fit totals are calculated

`calculateFitTotal()` in `js/data-loader.js` sums the `price` of every resolved product. If a product has no numeric `price`, its Amazon button/breakdown row shows **CHECK AMAZON** instead of a dollar amount, and it's excluded from the running total rather than shown as `$0`.

### Pasting Amazon SiteStripe links

While signed into the approved Amazon Associates account, open the product on Amazon, generate a link through SiteStripe, and paste the resulting URL into that product's `amazonLink` field in `data/products.json`. Never fabricate or guess a tracking ID.

### Replacing fit and product images

Drop replacement files into `assets/fits/<slug>/` or `assets/products/` using the same filenames referenced in the JSON (or update the `coverImage` / `fullImage` / `image` paths to match new filenames).

### Updating the Vahntra logo

Replace `/assets/logo/vahntra-logo.png` with the final logo file at the same path. The file currently in the repo is a placeholder generated locally — swap it before launch. Do not recolor, distort, or place text beneath the logo image.

### Changing filters

Gender and style tabs are defined directly in each page's HTML (`data-filter-group="gender"` / `data-filter-group="style"` buttons with `data-filter-value`). Add or remove a `<button>` to add or remove a filter option — `js/filters.js` and `js/data-loader.js#filterFits` pick up new values automatically as long as they match a `gender`/`style` string used in `fits.json`.

### Updating or disabling the intro

Edit the markup inside `<div class="intro" data-intro>` (present at the top of every page) for copy/animation changes, or `js/intro.js` for timing. To stop the intro from reappearing every session, leave `showIntroEveryVisit: false` in `js/config.js` (default). Set it to `true` only for testing.

### How saved fits work

Saved fits are stored in `localStorage` (`js/saved-fits.js`), keyed by fit `id`. No account or backend is required. Saved counts and the Saved page update live via a `vahntra:saved-changed` custom event.

### Connecting real reviews

`js/reviews.js` currently renders `data/demo-reviews.json`, and the review form shows "Review submission is not connected yet." on submit. To go live, connect the form to a real backend (Supabase, Firebase, or a Vercel Function) and replace the demo data source.

### Connecting the newsletter

`js/newsletter.js` has a single integration point: `submitToProvider()`. Replace its body with a real API call to Mailchimp, ConvertKit, Beehiiv, or Resend once you have a provider and API key. Until then, the form validates email format but explicitly tells users it isn't connected.

## Admin Preview

`admin-preview.html` is a local-only tool for validating a fit JSON object before you hand-add it to `data/fits.json`. It is:

- Disabled by default (`enableAdminPreview: false` in `js/config.js`) — flip to `true` only in local development.
- Not password-protected (there is no login), since it never writes to production data — it only validates JSON shape and checks that referenced `productIds` exist.
- Excluded from `sitemap.xml` and disallowed in `robots.txt`.

## Deploying to Vercel

See [DEPLOY.md](DEPLOY.md).
