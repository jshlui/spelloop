# Spelloop Netlify Deployment Design

**Date:** 2026-04-25  
**Status:** Approved

## Problem

Spelloop is currently only runnable locally (open `index.html` on your Mac). Other kids can't play it. The goal is to put it online at a public URL so any kid can access it on a desktop browser — instantly, no installation.

## Outcome

Spelloop is live at `spelloop.netlify.app` (or a custom subdomain of your choice). Any child with the URL can open it in a desktop browser and play. The owner pushes to GitHub → Netlify auto-deploys in ~30 seconds.

## Architecture

```
Developer's Mac
  └── git push → GitHub (main branch)
                    └── Netlify webhook → rebuild & publish
                                            └── CDN edge nodes worldwide
                                                  └── spelloop.netlify.app
```

Spelloop is a **zero-build static site** — React 18 and Babel are loaded from unpkg CDN via `<script>` tags. Netlify simply serves the raw files. No build pipeline is needed.

## Files to Create / Modify

### 1. `netlify.toml` (new)

Tells Netlify there is no build command and the publish directory is the project root (where `index.html` lives).

```toml
[build]
  publish = "."
  command = ""

[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=3600"
```

### 2. `_redirects` (new)

Required for React single-page apps — ensures every URL serves `index.html` rather than returning a 404.

```
/* /index.html 200
```

### 3. `index.html` — swap dev builds for production builds

The current script tags load `react.development.js` and `react-dom.development.js`. These include extra warnings and are ~3× larger than production builds. Swap to production for faster load times on school/home networks.

**Before:**
```html
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" ...>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" ...>
```

**After:**
```html
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" ...>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" ...>
```

> Note: The integrity (SRI) hashes must be updated to match the production build files.

## GitHub Setup

The project needs to be in a GitHub repository. Steps:
1. Create a new repo at github.com (e.g. `spelloop`)
2. `git init` in the project folder (already a git repo per git status)
3. `git remote add origin <repo-url>`
4. Commit all files and push to `main`

## Netlify Setup (one-time, in browser)

1. Go to netlify.com → "Add new site" → "Import from GitHub"
2. Connect GitHub account, select the `spelloop` repo
3. Build command: leave blank
4. Publish directory: `.`
5. Click Deploy — done

Netlify assigns a URL like `spelloop.netlify.app` or a random name you can rename in the dashboard.

## What Does NOT Change

- All game logic, screens, pet system, and data are untouched
- All localStorage (profiles, progress, settings) continues to work per-browser
- ElevenLabs voice integration continues to work (user-provided API key, stored in localStorage)
- No backend, no database, no auth — fully client-side

## Testing After Deploy

1. Visit the Netlify URL in Chrome/Edge on desktop
2. Create a profile and complete a level — confirm progress saves on refresh
3. Navigate directly to the URL (not just root) — confirm no 404
4. Test on a second browser/device — confirm it loads fresh (separate localStorage)
