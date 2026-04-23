# Higgsfield Skill Design

**Date:** 2026-04-23  
**Scope:** A user-level Claude Code skill that wraps the Higgsfield AI API for both live generation and project code scaffolding.

---

## Overview

A single skill (`/higgsfield`) installed at `~/.claude/skills/higgsfield/` that dispatches into three modes based on argument:

- `/higgsfield` — credential check and setup
- `/higgsfield generate` — live image/video generation, returns CDN URL
- `/higgsfield scaffold` — generates a typed utility module and wires it into the current project

The skill is user-scoped (lives in `~/.claude/skills/`) so it is available across all projects.

---

## File Structure

```
~/.claude/skills/higgsfield/
  SKILL.md
  reference/
    api.md
    credentials.md
```

### SKILL.md

Main skill logic and dispatch. Frontmatter:

```yaml
name: higgsfield
description: Generate AI images/videos via Higgsfield API, or scaffold Higgsfield integration into the current project. Use for live generation (returns URL) or code integration (Python/JS/TS). Call with 'generate' for live output, 'scaffold' for code, or no arg for credential setup.
user-invocable: true
argument-hint: "[generate|scaffold]"
```

### reference/api.md

Model catalogue and endpoint reference. Consulted by the skill at runtime. Contains:
- Model IDs as used in API paths, grouped by type (image / video)
- Endpoint patterns: `POST https://platform.higgsfield.ai/{model_id}`, `GET /requests/{id}/status`, `POST /requests/{id}/cancel`
- Auth header format: `Authorization: Key {api_key}:{api_secret}`
- Response shapes for completed image vs video jobs
- Webhook query param format (reference only)

### reference/credentials.md

Setup walkthrough text rendered during credential setup. Contains:
- Dashboard URL for obtaining API keys
- Both env var formats (`HF_KEY="key:secret"` combined, or `HF_API_KEY` + `HF_API_SECRET` separately)
- `.env` file example
- Shell profile export example

---

## Mode 1: Credential Setup (`/higgsfield`)

**Purpose:** Ensure credentials are available before any generation or scaffolding work.

**Flow:**

1. Check for `HF_KEY` env var (combined `key:secret` format)
2. If not found, check for `HF_API_KEY` + `HF_API_SECRET` env vars separately
3. If not found, read `.env` in current project root for the same keys
4. **If credentials found:** Confirm which source they came from. Offer to test auth by calling `GET /requests/test/status` — this returns 404 (no such request) but a 401 would indicate bad credentials.
5. **If credentials not found:** Run the setup walkthrough from `reference/credentials.md`:
   - Direct to Higgsfield dashboard for API key generation
   - Show exact env var format to use
   - Offer to write to `.env` in the current project root, or print the `export` command for shell profile
   - Re-run credential check after setup to confirm

Credentials are never stored in skill files or Claude config — only in user env or project `.env`.

---

## Mode 2: Generate (`/higgsfield generate`)

**Purpose:** Submit a live generation job to Higgsfield and return the result URL.

**Flow:**

1. Run credential check (mode 1 logic); abort with setup instructions if missing
2. Present grouped model menu:
   - **Image:** Soul 2.0, Reve text-to-image, Seedream v4 Edit, GPT Image 2
   - **Video:** Higgsfield DOP, Kling 3.0, Seedance v1 Pro, Sora 2 (model IDs to be confirmed against `reference/api.md` at implementation time)
   - User picks by number or name
3. Ask for generation prompt (open text)
4. Ask for model-specific params with sensible defaults offered (skippable):
   - Image: `aspect_ratio` (default `1:1`), `resolution` (default `720p`)
   - Video: `aspect_ratio` (default `16:9`), `duration` in seconds (default `5`)
5. POST to `https://platform.higgsfield.ai/{model_id}` with auth header and JSON body; receive `request_id`
6. Poll `GET /requests/{request_id}/status` every 5 seconds with a progress indicator
7. On `completed`: print CDN URL(s) for the generated asset
8. On `failed` or `nsfw`: print error message, note that credits were refunded

**HTTP implementation:** Uses `curl` (universally available, no install required). No webhook support in interactive mode — polling is sufficient.

---

## Mode 3: Scaffold (`/higgsfield scaffold`)

**Purpose:** Generate a typed Higgsfield utility module and wire it into the current project.

**Flow:**

1. Run credential check; abort if missing
2. Detect project language by inspecting current directory:
   - Python signals: `pyproject.toml`, `requirements.txt`, `setup.py`, `*.py` files
   - JS/TS signals: `package.json`, `tsconfig.json`, `*.ts`/`*.tsx`/`*.js` files
   - If ambiguous: ask user to choose Python or JavaScript/TypeScript
3. Generate utility module:
   - **Python** → `higgsfield.py` at project root (or `lib/higgsfield.py` if `lib/` exists)
     - Uses `higgsfield-client` SDK (`pip install higgsfield-client`)
     - Typed wrappers: `generate_image(prompt, model, **params)`, `generate_video(image_url, prompt, model, **params)`
     - Credentials loaded from env vars or `.env` via `python-dotenv` if available
   - **JavaScript/TypeScript** → `lib/higgsfield.ts` (or `utils/higgsfield.ts` if `utils/` exists, plain `higgsfield.js` if no TS)
     - Uses native `fetch` (no extra deps — official JS SDK is not yet released)
     - Typed wrappers: `generateImage(prompt, model, params)`, `generateVideo(imageUrl, prompt, model, params)`
     - Credentials loaded from `process.env`
4. Wire into existing files:
   - **Python:** Scan for `routes/`, `api/`, Flask/FastAPI route files; ask user which file to inject into; add import + usage example function
   - **JS/TS:** Scan for Next.js API routes (`app/api/`, `pages/api/`), Express route files; ask user which file to inject into; add import + usage example handler
5. Dependency reminder:
   - Python: print `pip install higgsfield-client` (and `pip install python-dotenv` if `.env` approach used)
   - JS/TS: no additional dependencies required
6. Print a summary of every file created or modified with a one-line description of each change

---

## Error Handling

- **Missing credentials:** All modes abort early with clear setup instructions rather than failing mid-operation
- **API errors (4xx/5xx):** Print the raw error body from Higgsfield plus a human-readable hint (e.g., 401 → "Check your API key format")
- **Polling timeout:** After 5 minutes of polling with no `completed` status, print the `request_id` and status URL so the user can check manually
- **Ambiguous project type:** Always ask rather than guess

---

## Out of Scope

- Webhook-based result delivery (polling is sufficient for interactive use)
- Batch generation (multiple jobs in one invocation)
- Official JS SDK integration (not yet released by Higgsfield)
- Model fine-tuning or Soul ID character creation
- Downloading/saving generated assets locally (URL-only output by design)