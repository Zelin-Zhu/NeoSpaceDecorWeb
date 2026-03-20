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

This project is ready for Cloudflare Pages:

- `functions/_middleware.js` performs edge language redirect on `/` using `request.cf.country`.
- Language chosen from navbar is stored in both `localStorage` and cookie (`neospace-preferred-lang`).
- Middleware prioritizes user cookie, then country fallback.
- If middleware is not available (pure static local server), `index.html` uses browser language fallback redirect.

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript
- Cloudflare Pages Functions

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

### 2) Cloudflare edge behavior test (country-based redirect)

Use Pages local dev:

```powershell
npx wrangler pages dev .
```

Then open `http://localhost:8788/` and verify `/` redirects by country (or by language cookie).

## Key improvements already done

- Fixed broken links and missing anchor sections.
- Removed conflicting slider logic and unified interactions.
- Added mobile navigation and responsive layout.
- Added lazy loading and explicit image dimensions.
- Updated visual style to a clean modern card layout.
