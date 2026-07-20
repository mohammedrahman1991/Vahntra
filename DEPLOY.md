# Deploying Vahntra

Vahntra is a static site (vanilla HTML/CSS/JS) — there is no build step. It is already live and connected end-to-end; this doc is the reference for how a change gets from your machine to `https://vahntra.com`.

## Fast path (confirmed working)

```bash
./deploy.sh "Describe what changed"
```

That's the entire deploy: stages everything, commits, pushes `first-push` to GitHub, then publishes `first-push:main` — which is what triggers the Vercel auto-deploy. No manual Vercel step, no dashboard visit needed. This exact sequence has been run and verified end-to-end (confirmed via `npx vercel project ls --scope rahmancodetests-4423s-projects` showing the deploy timestamp match the push).

Before running it on anything visual, do a local check first:

```bash
python3 -m http.server 8642 --directory .
# open http://localhost:8642, click around, check for console errors
```

Then deploy. If you want to verify the live deploy landed:

```bash
npx vercel project ls --scope rahmancodetests-4423s-projects
# "vahntra" row's "Updated" column should say something like "1m" right after a push
```

## The chain

```text
Your code (local, ~/Desktop/Vahntra)
        ↓  git push origin first-push:main
GitHub — github.com/mohammedrahman1991/Vahntra
        ↓  automatic on every push to main
Vercel — vercel.com/rahmancodetests-4423s-projects
        ↓
https://vahntra.com
```

- **GitHub repo:** `github.com/mohammedrahman1991/Vahntra`
- **Vercel project:** `rahmancodetests-4423s-projects` — watches the `main` branch and redeploys automatically on every push to it. No manual deploy step is normally needed; a deploy finishes in roughly a minute.
- **Domain registrar:** GoDaddy, holding DNS for `vahntra.com` and `www.vahntra.com`, pointed at the DNS records Vercel issued (A record for the apex, CNAME for `www`).

## Branch workflow

- **`first-push`** is the development branch. All work happens here.
- **`main`** is production. It is never committed to directly — it only receives merges from `first-push` when you're ready to go live.
- Pushing to `main` is what triggers the Vercel deploy, so treat `git push origin first-push:main` as the "publish" button.
- `./deploy.sh "message"` (see Fast Path above) runs all four steps below in one shot. This is the manual breakdown, useful if something needs to happen out of order (e.g. push to `first-push` without publishing yet):

```bash
# 1. Stage
git add .

# 2. Commit
git commit -m "Describe what changed"

# 3. Save work to GitHub (dev branch)
git push origin first-push

# 4. Publish to production (triggers Vercel deploy)
git push origin first-push:main
```

## If the site doesn't update

```bash
npx vercel deploy --prod --yes
```

Then hard-refresh: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows).

## Verifying deployment state

```bash
# Any local commits not yet pushed to main? No output = production matches local.
git log origin/main..HEAD --oneline

# Recent Vercel deployments
npx vercel ls
```

## Before going live — content checklist

- [ ] Replace `/assets/logo/vahntra-logo.png` with the final logo file.
- [ ] Replace placeholder imagery in `/assets/hero/`, `/assets/editorial/`, `/assets/fits/`, `/assets/products/`, `/assets/journal/` with real photography.
- [ ] Paste real Amazon SiteStripe links into every `amazonLink` field in `data/products.json`.
- [ ] Fill in `contactEmail`, `instagramUrl`, `tiktokUrl`, `pinterestUrl`, and `amazonStoreUrl` in `js/config.js` once real accounts exist.
- [ ] Confirm `enableAdminPreview` stays `false` in `js/config.js`.
- [ ] Connect a real newsletter provider in `js/newsletter.js` (see README) before promising subscribers anything.
- [ ] Connect a real backend for the review form in `js/reviews.js` before accepting public reviews.
- [ ] Set `googleAnalyticsId` in `js/config.js` only once an analytics provider is actually configured, and update `privacy-policy.html` to match.

## First-time setup reference (already done for this project)

Kept here only for reference if the project ever needs to be re-linked to Vercel or moved to a new registrar:

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new). Framework preset **Other**, empty Build Command, Output Directory `.` — the repo is served as-is. `vercel.json` handles cache headers and clean URLs automatically.
2. In the Vercel project, **Settings → Domains** → add `vahntra.com` and `www.vahntra.com`.
3. In GoDaddy's DNS settings for `vahntra.com`, add the exact A/CNAME records Vercel's domain page displays.
4. Wait for DNS propagation and automatic SSL issuance.
