# Lynn Chamat — Portfolio

Static website version of Lynn Chamat's PR & events portfolio. Built as plain HTML/CSS/JS (no framework, no build step) for simple deployment to Vercel.

## Local preview

```bash
cd "Lynn Portfolio"
python3 -m http.server 5173
# open http://localhost:5173
```

## Deploy to Vercel

### Option A — CLI

```bash
npm i -g vercel       # one-time
cd "Lynn Portfolio"
vercel                # follow prompts, accept defaults
vercel --prod         # promote the preview to production
```

### Option B — GitHub + Vercel dashboard

1. Push this folder to a new GitHub repo.
2. In the Vercel dashboard: **Add New → Project → Import Git Repository**.
3. Framework preset: **Other**. Output directory: **(root)**. No build command needed.
4. Click **Deploy**. Subsequent pushes auto-deploy.

A custom domain can be wired up under the project's **Settings → Domains** tab.

## Project structure

```
Lynn Portfolio/
├── Lynn Chamat Portfolio.pdf   # original source (kept for reference)
├── index.html                  # all 25 sections
├── styles.css                  # design tokens + components + responsive
├── app.js                      # scroll-reveal, page indicator, keyboard nav
├── favicon.svg
├── vercel.json                 # cache headers for static assets
└── public/
    ├── cover-art.webp          # extracted from PDF page 1
    ├── logos/                  # Mutual, The Ordinary, MUFE, Havas Red, Dubai Holding, L'Oréal
    └── pages/                  # rendered image-spread pages (4–7, 9, 11–15, 18–19, 21–24)
```

## Keyboard shortcuts

- ↑ / ↓ / ← / → / PgUp / PgDn / Space — navigate slide-by-slide
- Home / End — jump to first / last slide

## Accessibility

- Honors `prefers-reduced-motion: reduce` (disables all animations).
- All images have descriptive alt text.
- Semantic `<section>` per slide with `aria-label`.
