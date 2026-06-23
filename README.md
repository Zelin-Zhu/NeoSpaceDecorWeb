# Neospace Decor Web

Static multilingual website for Neospace Decor.

## Language strategy

- `index.html`: entry page.
- `cn/index.html`: Chinese site.
- `id/index.html`: Indonesian site.
- `en/index.html`: English site.
- Country mapping:
  - `CN` -> Chinese
  - `ID` -> Indonesian
  - Other countries -> English

## Cloudflare compatibility

This project is ready for Cloudflare Workers with Static Assets:

- `index.js` applies the edge language redirect on `/` using `request.cf.country`.
- Language chosen from navbar is stored in both `localStorage` and cookie (`neospace-preferred-lang`).
- Middleware prioritizes user cookie, then country fallback.
- If middleware is not available (pure static local server), `index.html` uses browser language fallback redirect.

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript
- Cloudflare Workers with Static Assets
- Cloudflare D1 content database
- Cloudflare R2 media storage

## Content API

The public pages retain their static content as a resilient fallback. When deployed with D1 configured, `js/content.js` loads the same page structure from:

```text
GET /api/public/home?locale=en|cn|id
```

The initial migration models editable hero slides, product series and images, reusable About blocks, translations, and media references. Existing repository images are seeded as static media URLs, while uploaded media can later use R2 through `/api/media/:id`.

## Local test

### 1) Quick static test (UI + responsive + interactions)

Run in project root:

```powershell
python -m http.server 5500
```

Open:

- `http://localhost:5500/en/index.html`
- `http://localhost:5500/id/index.html`
- `http://localhost:5500/cn/index.html`
- `http://localhost:5500/` (browser-language fallback redirect)

### 2) Cloudflare Worker behavior test (country-based redirect and APIs)

Use Worker local development:

```powershell
npm run dev
```

Then open `http://localhost:8787/` and verify `/` redirects by country (or by language cookie).

### 3) Local D1 content API test

Install the local development dependency once, then apply the migration and start Worker development:

```powershell
npm install
npm run db:migrate:local
npm run dev
```

Open `http://localhost:8787/en/index.html`. The page should load content from the local D1 database and fall back to static markup whenever the API is unavailable.

### 4) Local admin content editing

Open `http://localhost:8787/admin/index.html`. Local Worker development automatically permits the admin API. Upload images, edit the selected language, then use `发布首页内容`; reload the matching public page to see the published result.

In production, create a Cloudflare Access application that protects both `/admin/*` and `/api/admin/*`. The write APIs reject requests that do not carry the `CF-Access-Authenticated-User-Email` header injected by Access.

Before deploying, replace `database_id` in `wrangler.toml` with the real D1 ID, create the `neospace-media` R2 bucket, and apply the migration remotely:

```powershell
npm run db:migrate:remote
```

## Key improvements already done

- Fixed broken links and missing anchor sections.
- Removed conflicting slider logic and unified interactions.
- Added mobile navigation and responsive layout.
- Added lazy loading and explicit image dimensions.
- Updated visual style to a clean modern card layout.
