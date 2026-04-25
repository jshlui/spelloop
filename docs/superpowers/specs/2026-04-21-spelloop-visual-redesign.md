# Spelloop Visual Redesign — Design Spec
*2026-04-21*

## Context

Spelloop currently looks like a generic web dashboard — flat white cards, system typography, no strong visual personality. The app serves kids aged 4–10 learning to spell. The redesign brings a "Storybook Landscape" aesthetic that matches the illustrated kids-educational-app genre (think Duolingo for Kids / Khan Academy Kids): warm sky-and-hills landscapes, a golden winding path as the learning journey, chunky Fredoka One headings, avatar mascots, and colourful rounded tile buttons throughout.

Direction chosen: **A — Storybook Landscape.** Approved via visual companion mockups.

---

## Design Principles

1. **Landscape first** — every screen sits inside a sky-blue-to-green gradient world, not a white page
2. **Chunky and touchable** — all interactive elements are large, rounded, with press-shadow depth (4–6px offset)
3. **Fredoka headings, Nunito body** — both fonts already loaded; use `Fredoka One` for all headings, nav labels, and tile text; `Nunito 800/900` for stats and labels
4. **Avatar mascots as characters** — existing Spelloop SVG avatars (Panda, Cat, etc.) render as large mascot illustrations, not profile icons
5. **Golden path as the learning journey metaphor** — the winding amber path appears on the map and is echoed in the home "Keep going" CTA

---

## Palette (new design tokens to add to `styles/design.css`)

```css
/* Storybook Landscape tokens */
--sky-top:    #6EC8E8;
--sky-bottom: #A8DFC8;
--grass-top:  #6DC54A;
--grass-mid:  #4CAF35;
--grass-deep: #3D9A28;
--path-main:  #D4A04A;
--path-light: #F0C86A;
--path-dark:  #A87030;
--sun-yellow: #FFE84D;

/* Top-chrome buttons (shared across all screens) */
--btn-back-bg:     #FFD700;
--btn-back-border: #E8B800;
--btn-back-shadow: #C9A000;
--btn-back-ink:    #7A5A00;
--btn-help-bg:     #4A90D9;
--btn-help-border: #357ABD;
--btn-help-shadow: #2860A0;

/* Nav tile colours */
--tile-play:    linear-gradient(145deg, #FF7043, #E64A19);
--tile-journey: linear-gradient(145deg, #42A5F5, #1976D2);
--tile-me:      linear-gradient(145deg, #AB47BC, #7B1FA2);
--tile-code:    linear-gradient(145deg, #26A69A, #00796B);
--tile-shop:    linear-gradient(145deg, #FFA726, #E65100);
--tile-pet:     linear-gradient(145deg, #EC407A, #AD1457);
```

---

## Shared Top Chrome

Applies to **every screen** (Home, Map, Shop, Pet, Me, Code Lab, Game):

| Element | Spec |
|---------|------|
| Back button | 40×40px circle, `--btn-back-*` colours, `box-shadow: 0 3px 0 --btn-back-shadow`, `←` glyph |
| Help button | 40×40px circle, `--btn-help-*` colours, `?` glyph |
| Page title | Fredoka One 26px, `color: #1A3A1A` |
| Container | `padding: 12px 18px`, `background: rgba(255,255,255,0.75)`, `backdrop-filter: blur(8px)`, `border-bottom: 2px solid rgba(255,255,255,0.8)` |

---

## Shared Landscape Background

Applies to **every screen** behind the content:

```css
background: linear-gradient(180deg,
  var(--sky-top)    0%,
  var(--sky-bottom) 40%,
  var(--grass-top)  40%,
  var(--grass-mid)  65%,
  var(--grass-deep) 100%
);
```

**Decorations** (sun + 3 clouds + 4 rolling hills) rendered as absolutely-positioned divs. Each screen can vary sky/hill percentages to change the horizon line. Inner content (cards, panels) renders over this background with semi-transparent white surfaces.

---

## Sidebar Redesign

Existing `WebSidebar` in `WebApp.jsx`. Current: text labels + icons stacked vertically.

**New spec:**

- Width stays at 72px (already collapsed)
- `background: rgba(255,255,255,0.92)`, `backdrop-filter: blur(8px)`
- Brand icon: 44×44px rounded rect, blue gradient, 📝 emoji
- Nav buttons: 52×52px rounded rect (r=16); active state = light tint matching the tile colour for that screen
- Coin display: 52×40px, warm yellow pill, coin emoji + count
- No text labels (already icon-only on narrow screens)

---

## Home Screen (`WebHome`)

See mockup: `home-v2.html`

**Layout:**
- Landscape background fills the full main area
- Sun top-right, 3 clouds, 4 rolling hills
- Two mascot avatars: `AvatarPanda` (110px, left corner, no circle background) + `AvatarCat` (110px, right corner, `scaleX(-1)` mirror)
- 6 nav tiles in a 3×2 grid, centred in the main area
- "Keep going" pill button below the grid, showing current word

**Tile grid:**

| Tile | Emoji | Colour |
|------|-------|--------|
| Play | 🎮 | `--tile-play` |
| Journey | 🗺️ | `--tile-journey` |
| My Stuff | ⭐ | `--tile-me` |
| Code Lab | 💻 | `--tile-code` |
| Shop | 🛍️ | `--tile-shop` |
| My Pet | 🐾 | `--tile-pet` |

Each tile: 110×100px, `borderRadius: 24`, `boxShadow: '0 6px 0 rgba(0,0,0,0.18), 0 10px 24px rgba(0,0,0,0.12)'`, Fredoka One 14px label.

**Continue button:** `background: linear-gradient(145deg, #FFD700, #FFA000)`, `border: 3px solid #E8B800`, `borderRadius: 999px`, `boxShadow: '0 5px 0 #C9A000'`. Shows current word in a semi-transparent chip.

**Greeting strip:** Fredoka One "Hi, [Name]! 👋" + frosted pill with streak / stars / words.

**Mascots:** Render existing `AvatarPanda` and `AvatarCat` at `size={110}`, overriding the circle `fill` to `'transparent'` so only the face/features show. Position absolute, bottom of main area, z-index 15.

---

## Map / Journey Screen (`WebMap`)

See mockup: `map-mockup.html`

**Layout:**
- Same landscape background fills the full area
- Golden winding SVG path drawn across the landscape (same `buildPath` function, styled with `--path-main` stroke)
- Chapter pills in the top chrome (replace chapter cards)
- Level nodes are SVG circles sitting directly on the path points
- Bottom progress bar: frosted white strip, chapter name + progress track + count

**Node states:**

| State | Fill | Content |
|-------|------|---------|
| Done | `#4CAF50` | ✓ checkmark + word label + star row |
| Current | `#1976D2` + white stroke | Mode icon + word label + "YOU ARE HERE" bubble above + pulse ring animation |
| Locked | `#9E9E9E` opacity 0.75 | 🔒 + "Level N" label |
| Open (not yet played) | tile colour for mode | Mode icon + word label |

**Path style:** `stroke: var(--path-main)` width 30, with a lighter dashed overlay `var(--path-light)` width 13.

**Chapter selection:** Three pill tabs in top chrome. Active = blue filled pill. Done = green with tick. Locked = grey muted. Clicking a pill scrolls/swaps to that chapter's path.

---

## Inner Screens (Shop, Pet, Me, Code Lab)

All four screens follow the same structure:

1. **Landscape background** fills the screen (horizon at ~45%)
2. **Top chrome** with yellow ← back, Fredoka title, blue ? help
3. **Content panel** — a semi-transparent white card (`background: rgba(255,255,255,0.88)`, `backdrop-filter: blur(10px)`, `borderRadius: 20px`) that floats over the landscape and holds the existing screen content
4. **No change to functionality** — only the wrapper and chrome change; internal cards/tabs/grids remain as-is

The content panel sits `margin: 0 16px 16px`, taking up most of the vertical space below the chrome.

---

## Game Screen (`WebGame` / `WebScreens`)

The spelling game itself already has a word-focused layout. Changes:

- Add landscape background behind the game container
- Top chrome matches the shared spec (back + help)
- The existing frosted game card sits over the landscape (already has a surface background)

---

## Typography

| Use | Font | Weight | Size |
|-----|------|--------|------|
| Screen titles | Fredoka One | — | 24–28px |
| Tile labels | Fredoka One | — | 14px |
| Nav labels | Fredoka One | — | 9–11px |
| Stats / counts | Nunito | 900 | 16–20px |
| Body / descriptions | Nunito | 700–800 | 13–14px |

Both fonts are already loaded in the HTML via Google Fonts. No new font imports needed.

---

## Avatar Mascot Implementation

`src/avatars.jsx` contains: `AvatarFox`, `AvatarPanda`, `AvatarBunny`, `AvatarOwl`, `AvatarCat`, `AvatarFrog`.

All take a `size` prop and render `<svg width={size} height={size} viewBox="0 0 100 100">`. They have an internal background circle with a fill colour.

To use as mascots without the coloured circle:
```jsx
// Wrapper that overrides the circle fill to transparent
// Pass bgColor="transparent" if the avatar supports it,
// or wrap in a div and use CSS to hide the first <circle>
```

If the avatars don't support `bgColor`, add an optional `bgColor` prop to each avatar that sets the circle's `fill`. Default value keeps existing behaviour.

**Home screen mascots:**
- Left: `<AvatarPanda size={110} bgColor="transparent"/>` — absolute bottom-left
- Right: `<AvatarCat size={110} bgColor="transparent"/>` wrapped in `<div style={{transform:'scaleX(-1)'}}>` — absolute bottom-right

---

## Files to Modify

| File | Changes |
|------|---------|
| `styles/design.css` | Add landscape/path/chrome design tokens |
| `src/avatars.jsx` | Add optional `bgColor` prop to each avatar |
| `src/web/WebApp.jsx` | Redesign `WebSidebar`; redesign `WebHome` (landscape bg, tile grid, mascots, continue btn) |
| `src/web/WebScreens.jsx` | Redesign `WebMap` (landscape bg, path style, chapter pills, node style); add landscape+chrome wrapper to `WebMe` |
| `src/web/WebParent.jsx` | No changes (parent portal keeps its own design) |

*Inner screens (Shop, Pet, Code Lab) are rendered inside `WebApp.jsx` — add the landscape wrapper there, not in each screen component.*

---

## What Does NOT Change

- All game logic, word lists, levels, scoring
- Parent portal (`WebParent.jsx`) — different audience, different design
- Functionality of Shop, Pet, Code Lab tabs
- Existing design token names (only adding new ones)
- Mobile sidebar collapse behaviour (already handled)

---

## Verification

1. Open app → Home screen shows landscape + mascots + 6 tile grid + continue button
2. Click Journey → map shows sky/hills/path background; nodes sit on golden path; chapter pills work
3. Click Shop → landscape behind content panel; top chrome has yellow ← and blue ?
4. Click My Pet → same landscape + chrome wrapper
5. Click My Stuff → same
6. Click Code Lab → same
7. Sidebar icons visible, active state highlights correctly
8. Avatars render without coloured circle on Home screen mascots
9. No regressions in game play, rewards, or parent portal
10. All existing functionality intact — only visuals changed
