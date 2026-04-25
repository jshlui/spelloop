# Spelloop Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle every Spelloop screen with a "Storybook Landscape" kids-app aesthetic — sky+hills background, Fredoka One headings, coloured tile nav, golden path map, shared yellow/blue top chrome, and Panda+Cat avatar mascots.

**Architecture:** All visual changes are pure JSX/CSS — no logic changes. A shared `LandscapeShell` wrapper component provides the background + top chrome for every screen. The existing sidebar shrinks to an icon-only 72px strip. The Home screen gets a 6-tile nav grid with mascots; the Map screen gets the landscape behind its SVG path.

**Tech Stack:** Plain CDN React 18 + Babel standalone (no build step). Styles are inline JSX + CSS custom properties in `styles/design.css`. Fonts: Grandstander (existing) and Nunito (existing) — plus Fredoka One (already loaded in `SpellLoop Kids.html`).

---

## File Map

| File | What changes |
|------|-------------|
| `styles/design.css` | Add landscape/path/chrome/tile CSS tokens |
| `src/avatars.jsx` | Add optional `bgColor` prop to every avatar (6 components + `AvatarGeo`) |
| `src/web/WebApp.jsx` | Redesign `WebSidebar`; redesign `WebHome`; wrap `WebShop`, `WebCodeLab`, `WebPet` in `LandscapeShell` |
| `src/web/WebScreens.jsx` | Redesign `WebMap` + `WebLevelNode`; wrap `WebMe` in `LandscapeShell` |

No changes to: game logic, `WebParent.jsx`, `App.jsx`, `src/data.jsx`, `src/screens/`, `src/pet.jsx`, `src/ui.jsx`.

---

## Task 1: Add design tokens to `styles/design.css`

**Files:**
- Modify: `styles/design.css` (append after existing tokens, around line 82)

- [ ] **Step 1: Open `styles/design.css` and append the new token block**

Find the end of the `:root { }` block (around line 82, just before the closing `}`) and insert:

```css
  /* ── Storybook Landscape ── */
  --sky-top:         #6EC8E8;
  --sky-bottom:      #A8DFC8;
  --grass-top:       #6DC54A;
  --grass-mid:       #4CAF35;
  --grass-deep:      #3D9A28;
  --path-main:       #D4A04A;
  --path-light:      #F0C86A;
  --path-shadow:     rgba(160,110,30,0.25);
  --sun-yellow:      #FFE84D;

  /* ── Shared top-chrome buttons ── */
  --btn-back-bg:     #FFD700;
  --btn-back-border: #E8B800;
  --btn-back-shadow: #C9A000;
  --btn-back-ink:    #7A5A00;
  --btn-help-bg:     #4A90D9;
  --btn-help-border: #357ABD;
  --btn-help-shadow: #2860A0;

  /* ── Nav tile gradients (used as background values) ── */
  --tile-play:    linear-gradient(145deg, #FF7043, #E64A19);
  --tile-journey: linear-gradient(145deg, #42A5F5, #1976D2);
  --tile-me:      linear-gradient(145deg, #AB47BC, #7B1FA2);
  --tile-code:    linear-gradient(145deg, #26A69A, #00796B);
  --tile-shop:    linear-gradient(145deg, #FFA726, #E65100);
  --tile-pet:     linear-gradient(145deg, #EC407A, #AD1457);
```

- [ ] **Step 2: Verify the CSS file is valid**

Open `SpellLoop Kids.html` in a browser (or `open "SpellLoop Kids.html"`) and check the browser console shows no CSS parse errors. The app should still load normally.

- [ ] **Step 3: Commit**

```bash
git add styles/design.css
git commit -m "feat: add storybook landscape design tokens"
```

---

## Task 2: Add `bgColor` prop to avatar components

**Files:**
- Modify: `src/avatars.jsx` (lines 4–178)

All 6 animal avatars + `AvatarGeo` use this pattern:
```jsx
function AvatarFox({ size, bg }) {
  size = size || 72; bg = bg || '#FFE3D5';
  return <svg ...><circle cx="50" cy="50" r="50" fill={bg}/> ...
```

The `bg` prop already exists and already controls the background circle fill. We need to also accept `bgColor` as an alias so callers can write `bgColor="transparent"` when using avatars as mascots.

- [ ] **Step 1: Update each avatar to accept `bgColor` as an alias for `bg`**

For **every** avatar function (`AvatarFox`, `AvatarPanda`, `AvatarBunny`, `AvatarOwl`, `AvatarCat`, `AvatarFrog`, `AvatarGeo`) find the line like:

```js
function AvatarFox({ size, bg }) {
  size = size || 72; bg = bg || '#FFE3D5';
```

and change it to:

```js
function AvatarFox({ size, bg, bgColor }) {
  size = size || 72; bg = bgColor !== undefined ? bgColor : (bg || '#FFE3D5');
```

Apply the same pattern to all 7 components, substituting the correct component name and default colour:

| Component | Default bg |
|-----------|-----------|
| `AvatarFox` | `'#FFE3D5'` |
| `AvatarPanda` | `'#EEE9FF'` |
| `AvatarBunny` | `'#FFE0EF'` |
| `AvatarOwl` | `'#E3EAFF'` |
| `AvatarCat` | `'#FFF2CE'` |
| `AvatarFrog` | `'#D7F5E8'` |
| `AvatarGeo` | `'#6C8EFF'` |

- [ ] **Step 2: Verify avatars render correctly**

Open the app, go to My Stuff — the avatar should look identical to before (the `bgColor` prop is not passed anywhere yet, so the default `bg` colour is used).

- [ ] **Step 3: Commit**

```bash
git add src/avatars.jsx
git commit -m "feat: add bgColor prop alias to avatar components"
```

---

## Task 3: Redesign `WebSidebar`

**Files:**
- Modify: `src/web/WebApp.jsx` lines 223–323 (the `<aside>` and its contents)

The sidebar currently spans 240px with text labels, a wide profile section, and a pet widget. New design: 72px wide, icon-only, frosted white background, active state uses tinted pill, no text labels (they're already hidden at <700px via CSS).

- [ ] **Step 1: Replace the `<aside>` style and brand section (lines 223–244)**

Replace:
```jsx
  return (
    <aside aria-label="Main navigation" className="web-sidebar" style={{
      width: 240, flexShrink: 0, background: 'var(--surface)',
      borderRight: '1px solid var(--alpha-md)',
      display: 'flex', flexDirection: 'column', padding: 18,
      minHeight: '100vh', transition: 'width 200ms ease, padding 200ms ease',
    }}>
      {/* brand */}
      <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 18px' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'var(--blue)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-soft)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4v16l4-4h12V4H4z" fill="white"/><circle cx="9" cy="12" r="1.5" fill="rgba(255,255,255,0.5)"/><circle cx="13" cy="12" r="1.5" fill="rgba(255,255,255,0.5)"/></svg>
        </div>
        <div className="sidebar-brand-text">
          <div style={{ fontWeight: 900, fontSize: 16, lineHeight: 1 }}>SpellLoop</div>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 700 }}>Kids</div>
        </div>
      </div>
```

With:
```jsx
  return (
    <aside aria-label="Main navigation" className="web-sidebar" style={{
      width: 72, flexShrink: 0,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(8px)',
      borderRight: '2px solid rgba(0,0,0,0.06)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '16px 0', gap: 4,
      minHeight: '100vh',
      zIndex: 10,
    }}>
      {/* brand icon */}
      <div className="sidebar-brand" style={{ marginBottom: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: 'linear-gradient(135deg, #4A90D9, #357ABD)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
          boxShadow: '0 4px 12px rgba(74,144,217,0.4)',
        }}>📝</div>
      </div>
```

- [ ] **Step 2: Replace the nav button loop (lines 246–266)**

Replace the entire `<nav>` block with:
```jsx
      <nav role="navigation" aria-label="App sections" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map(function(it) {
          var active = tab === it.id;
          var tileColors = { home: '#FF7043', map: '#42A5F5', me: '#AB47BC', code: '#26A69A', shop: '#FFA726', pet: '#EC407A' };
          var activeBg = tileColors[it.id] ? tileColors[it.id] + '22' : 'var(--blue-soft)';
          var activeColor = tileColors[it.id] || 'var(--blue-ink)';
          return (
            <button key={it.id} aria-current={active ? 'page' : undefined}
              className="sidebar-nav-btn"
              onClick={function() { onTab(it.id); window.sfx && window.sfx.tap && window.sfx.tap(); }}
              style={{
                width: 52, height: 52, borderRadius: 16,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 2, border: 'none', cursor: 'pointer',
                background: active ? activeBg : 'transparent',
                fontFamily: 'inherit',
                transition: 'background 120ms ease',
              }}>
              {it.icon(active ? activeColor : 'var(--ink-soft)')}
              <span className="sidebar-label" style={{ fontSize: 9, fontWeight: 800, color: active ? activeColor : 'var(--ink-mute)', fontFamily: "'Fredoka One', cursive" }}>{it.label}</span>
            </button>
          );
        })}
      </nav>
```

- [ ] **Step 3: Replace the spacer + coins widget (lines 268–277)**

Replace:
```jsx
      <div style={{ flex: 1 }}/>

      {/* coins */}
      <div className="sidebar-coins" style={{ background: 'var(--yellow-soft)', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ fontSize: 24 }}>🪙</div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--yellow-ink)' }}>{profile.coins || 0}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--yellow-ink)', opacity: 0.7 }}>coins to spend</div>
        </div>
      </div>
```

With:
```jsx
      <div style={{ flex: 1 }}/>

      {/* coins (icon-only pill) */}
      <div className="sidebar-coins" style={{
        width: 52, height: 44, background: 'var(--yellow-soft)', borderRadius: 14,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 1, marginBottom: 8,
      }}>
        <div style={{ fontSize: 18 }}>🪙</div>
        <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--yellow-ink)' }}>{profile.coins || 0}</div>
      </div>
```

- [ ] **Step 4: Remove the pet widget and profile section (lines 279–321)**

Delete the entire pet widget block and the profile block. The sidebar ends with the coins div and the closing `</aside>`. Remove everything between the coins `</div>` and the `</aside>`:

```jsx
      {/* remove pet widget — lines 279-300 */}
      {/* remove profile section — lines 302-321 */}
    </aside>
  );
```

The final sidebar should be: brand icon → nav buttons → spacer → coins → `</aside>`.

- [ ] **Step 5: Verify the sidebar looks right**

Open the app. The left sidebar should now be narrow (72px), icon-only, frosted white. Active tab should show a coloured tinted background on its icon.

- [ ] **Step 6: Commit**

```bash
git add src/web/WebApp.jsx
git commit -m "feat: redesign sidebar to 72px icon-only strip"
```

---

## Task 4: Create the shared `LandscapeShell` component

**Files:**
- Modify: `src/web/WebApp.jsx` (add new component before `WebHome`, around line 325)

`LandscapeShell` provides: full landscape background (sky gradient + sun + 3 clouds + 4 hills) + the shared top chrome (yellow back button + Fredoka title + blue help button). Every inner screen (`WebHome`, `WebMap`, `WebShop`, `WebPet`, `WebCodeLab`, `WebMe`) will be wrapped in this.

- [ ] **Step 1: Add `LandscapeShell` component before `WebHome`**

Insert this entire component before `function WebHome(`:

```jsx
function LandscapeShell({ title, onBack, onHelp, topExtra, children }) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden',
      background: 'linear-gradient(180deg, var(--sky-top) 0%, var(--sky-bottom) 42%, var(--grass-top) 42%, var(--grass-mid) 65%, var(--grass-deep) 100%)',
      fontFamily: "'Nunito', system-ui, sans-serif",
    }}>
      {/* Sun */}
      <div style={{ position: 'absolute', top: 16, right: 80, width: 60, height: 60, borderRadius: '50%',
        background: 'radial-gradient(circle, var(--sun-yellow) 60%, #FFD600)',
        boxShadow: '0 0 0 10px rgba(255,220,0,0.15), 0 0 0 22px rgba(255,220,0,0.07)',
        zIndex: 0, pointerEvents: 'none',
      }}/>
      {/* Clouds */}
      {[
        { w: 82, h: 28, top: 20, left: 80, bw: 40, bh: 40, bt: -20, bl: 12, aw: 30, ah: 30, at: -14, ar: 10 },
        { w: 64, h: 22, top: 48, left: 240, bw: 30, bh: 30, bt: -14, bl: 9, aw: 24, ah: 24, at: -10, ar: 8, opacity: 0.75 },
        { w: 74, h: 26, top: 18, left: 460, bw: 36, bh: 36, bt: -18, bl: 11, aw: 28, ah: 28, at: -13, ar: 9 },
      ].map(function(c, i) {
        return (
          <div key={i} style={{ position: 'absolute', top: c.top, left: c.left, width: c.w, height: c.h,
            background: 'white', borderRadius: 50, opacity: c.opacity || 0.92, zIndex: 0, pointerEvents: 'none',
          }}>
            <div style={{ position: 'absolute', width: c.bw, height: c.bh, borderRadius: '50%', background: 'white', top: c.bt, left: c.bl }}/>
            <div style={{ position: 'absolute', width: c.aw, height: c.ah, borderRadius: '50%', background: 'white', top: c.at, right: c.ar }}/>
          </div>
        );
      })}
      {/* Rolling hills */}
      {[
        { w: 300, h: 140, left: -20, bg: '#3E9624' },
        { w: 240, h: 110, left: 170, bg: '#348A1C' },
        { w: 310, h: 150, right: -20, bg: '#4CAF2E' },
        { w: 160, h: 80,  right: 170, bg: '#2D7A16' },
      ].map(function(h, i) {
        return (
          <div key={i} style={{
            position: 'absolute', bottom: 0,
            left: h.left !== undefined ? h.left : undefined,
            right: h.right !== undefined ? h.right : undefined,
            width: h.w, height: h.h,
            background: h.bg,
            borderRadius: '50% 50% 0 0',
            zIndex: 0, pointerEvents: 'none',
          }}/>
        );
      })}

      {/* Top chrome */}
      <div style={{ position: 'relative', zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 18px',
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(8px)',
        borderBottom: '2px solid rgba(255,255,255,0.8)',
      }}>
        <button onClick={onBack} aria-label="Go back" style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--btn-back-bg)', border: '3px solid var(--btn-back-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 900, color: 'var(--btn-back-ink)',
          boxShadow: '0 3px 0 var(--btn-back-shadow)',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>←</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 24, color: '#1A3A1A' }}>{title}</div>
          {topExtra}
        </div>

        <button onClick={onHelp || function() {}} aria-label="Help" style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--btn-help-bg)', border: '3px solid var(--btn-help-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 900, color: 'white',
          boxShadow: '0 3px 0 var(--btn-help-shadow)',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>?</button>
      </div>

      {/* Content layer over landscape */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the file still loads**

Open `SpellLoop Kids.html` — the app should load as-is. `LandscapeShell` is defined but not used yet; no visible change.

- [ ] **Step 3: Commit**

```bash
git add src/web/WebApp.jsx
git commit -m "feat: add LandscapeShell shared background + chrome component"
```

---

## Task 5: Redesign `WebHome`

**Files:**
- Modify: `src/web/WebApp.jsx` lines 326–431

Replace the entire `WebHome` function with the new Storybook Landscape home: landscape background (via `LandscapeShell`), greeting + stats strip, 6 nav tile grid, continue button, and Panda + Cat mascots.

- [ ] **Step 1: Replace the entire `WebHome` function**

Delete lines 326–431 (the entire `function WebHome`) and replace with:

```jsx
function WebHome({ profile, levels, onContinue, onPickMode, onTab }) {
  var currentLevel = levels && levels.find(function(l) { return l.current; });
  var currentWord = currentLevel ? currentLevel.word : '...';

  var tiles = [
    { id: 'home', label: 'Play',     icon: '🎮', grad: 'var(--tile-play)' },
    { id: 'map',  label: 'Journey',  icon: '🗺️', grad: 'var(--tile-journey)' },
    { id: 'me',   label: 'My Stuff', icon: '⭐', grad: 'var(--tile-me)' },
    { id: 'code', label: 'Code Lab', icon: '💻', grad: 'var(--tile-code)' },
    { id: 'shop', label: 'Shop',     icon: '🛍️', grad: 'var(--tile-shop)' },
    { id: 'pet',  label: 'My Pet',   icon: '🐾', grad: 'var(--tile-pet)' },
  ];

  return (
    <LandscapeShell title={'Hi, ' + profile.name + '! 👋'} onBack={function() {}}>

      {/* Greeting + stats */}
      <div style={{ textAlign: 'center', padding: '10px 0 0' }}>
        <div style={{
          display: 'inline-flex', gap: 12, alignItems: 'center',
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)',
          borderRadius: 999, padding: '6px 16px',
          border: '2px solid rgba(255,255,255,0.9)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#333' }}>🔥 {profile.streak} streak</span>
          <span style={{ width: 1, height: 16, background: '#ddd', display: 'block' }}/>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#333' }}>⭐ {profile.totalStars} stars</span>
          <span style={{ width: 1, height: 16, background: '#ddd', display: 'block' }}/>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#333' }}>📚 {profile.words} words</span>
        </div>
      </div>

      {/* 6-tile nav grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 110px)',
        gap: 14,
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -52%)',
        zIndex: 20,
      }}>
        {tiles.map(function(t) {
          return (
            <button key={t.id}
              onClick={function() { onTab(t.id); window.sfx && window.sfx.tap && window.sfx.tap(); }}
              style={{
                width: 110, height: 100, borderRadius: 24,
                background: t.grad,
                border: '3px solid rgba(255,255,255,0.6)',
                boxShadow: '0 6px 0 rgba(0,0,0,0.18), 0 10px 24px rgba(0,0,0,0.12)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 6, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'transform 0.12s ease, box-shadow 0.12s ease',
              }}
              onMouseEnter={function(e) { e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={function(e) { e.currentTarget.style.transform = 'translateY(0)'; }}
              onMouseDown={function(e) { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = '0 3px 0 rgba(0,0,0,0.18)'; }}
              onMouseUp={function(e) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 6px 0 rgba(0,0,0,0.18), 0 10px 24px rgba(0,0,0,0.12)'; }}
            >
              <div style={{ fontSize: 36, lineHeight: 1 }}>{t.icon}</div>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 14, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>{t.label}</div>
            </button>
          );
        })}
      </div>

      {/* Continue button */}
      <button onClick={onContinue} style={{
        position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
        background: 'linear-gradient(145deg, #FFD700, #FFA000)',
        border: '3px solid var(--btn-back-border)',
        borderRadius: 999, padding: '12px 32px',
        fontFamily: "'Fredoka One', cursive", fontSize: 18,
        color: 'var(--btn-back-ink)', cursor: 'pointer',
        boxShadow: '0 5px 0 var(--btn-back-shadow), 0 8px 20px rgba(255,160,0,0.4)',
        display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
        zIndex: 20,
      }}>
        ▶ Keep going —
        <span style={{
          background: 'rgba(255,255,255,0.4)', borderRadius: 8, padding: '2px 10px',
          fontFamily: "'Fredoka One', cursive", fontSize: 16,
        }}>{currentWord}</span>
      </button>

      {/* Mascots — Panda left, Cat right */}
      <div style={{ position: 'absolute', bottom: 0, left: 12, zIndex: 15, filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))' }}>
        <AvatarPanda size={110} bgColor="transparent"/>
      </div>
      <div style={{ position: 'absolute', bottom: 0, right: 12, zIndex: 15, filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))', transform: 'scaleX(-1)' }}>
        <AvatarCat size={110} bgColor="transparent"/>
      </div>

    </LandscapeShell>
  );
}
```

- [ ] **Step 2: Update the `WebHome` call site in `WebApp` (line 184–189)**

Find:
```jsx
        {route.name === 'screen' && tab === 'home' && (
          <WebHome profile={profile} levels={levels}
            onContinue={function() { startLevel(currentLevel); }}
            onPickMode={startMode}
            onOpenParent={onOpenParent}/>
        )}
```

Replace with:
```jsx
        {route.name === 'screen' && tab === 'home' && (
          <WebHome profile={profile} levels={levels}
            onContinue={function() { startLevel(currentLevel); }}
            onPickMode={startMode}
            onTab={function(t) { setTab(t); setRoute({ name: 'screen' }); }}/>
        )}
```

- [ ] **Step 3: Verify the home screen**

Open the app. The Home tab should show: landscape background, stat strip, 3×2 colourful tile grid centred, "Keep going — WORD" button at bottom, Panda left + Cat right. Clicking a tile should navigate to that section.

- [ ] **Step 4: Commit**

```bash
git add src/web/WebApp.jsx
git commit -m "feat: redesign home screen with landscape, tile grid and mascots"
```

---

## Task 6: Redesign `WebMap`

**Files:**
- Modify: `src/web/WebScreens.jsx` lines 21–158 (the `WebMap` and `WebLevelNode` functions)

Replace the chapter-cards layout (white cards, dot pattern SVG, scrolling) with a full landscape background, chapter pill tabs in the chrome, SVG path + nodes drawn across the landscape, and a frosted progress bar at the bottom.

- [ ] **Step 1: Replace the `WebMap` function (lines 21–119)**

Delete lines 21–119 and replace with:

```jsx
function WebMap({ levels, onPlayLevel, onBack }) {
  levels = levels || LEVELS;
  var chapters = window.CHAPTER_META || [
    { id: 1, name: 'The Word Forest', emoji: '🌳' },
    { id: 2, name: 'The Word Sea',    emoji: '🌊' },
    { id: 3, name: 'The Word Mountain', emoji: '⛰️' },
  ];

  var [activeChapter, setActiveChapter] = React.useState(function() {
    var cur = (levels || []).find(function(l) { return l.current; });
    return cur ? (cur.chapter || 1) : 1;
  });

  var chLevels = levels.filter(function(l) { return l.chapter === activeChapter; });
  var chDone   = chLevels.filter(function(l) { return l.done; }).length;
  var activeCh  = chapters.find(function(c) { return c.id === activeChapter; }) || chapters[0];

  var doneAll = (levels || []).filter(function(l) { return l.done; }).length;

  // Path points — 8 positions evenly spread across the SVG canvas
  var PATH_PTS = [
    { x: 70,  y: 380 }, { x: 220, y: 290 }, { x: 370, y: 340 }, { x: 520, y: 250 },
    { x: 660, y: 310 }, { x: 790, y: 230 }, { x: 900, y: 300 }, { x: 1020, y: 230 },
  ];

  function buildMapPath(pts) {
    if (!pts.length) return '';
    var d = 'M ' + pts[0].x + ' ' + pts[0].y;
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i], p1 = pts[i + 1];
      var cx = (p0.x + p1.x) / 2;
      var cy = (p0.y + p1.y) / 2;
      d += ' Q ' + ((p0.x + cx) / 2) + ' ' + p0.y + ' ' + cx + ' ' + cy;
    }
    d += ' T ' + pts[pts.length - 1].x + ' ' + pts[pts.length - 1].y;
    return d;
  }

  var pathD = buildMapPath(PATH_PTS.slice(0, Math.max(chLevels.length, 2)));
  var chapterPills = (
    <div style={{ display: 'flex', gap: 8 }}>
      {chapters.map(function(ch) {
        var isActive = ch.id === activeChapter;
        var chL = levels.filter(function(l) { return l.chapter === ch.id; });
        var isDone = chL.length > 0 && chL.every(function(l) { return l.done; });
        var isLocked = ch.id > 1 && levels.filter(function(l) { return l.chapter === ch.id - 1; }).some(function(l) { return !l.done; });
        return (
          <button key={ch.id}
            onClick={function() { if (!isLocked) setActiveChapter(ch.id); }}
            disabled={isLocked}
            style={{
              padding: '5px 14px', borderRadius: 999, border: 'none', cursor: isLocked ? 'default' : 'pointer',
              fontFamily: "'Fredoka One', cursive", fontSize: 13,
              background: isActive ? '#1976D2' : isDone ? '#E8F5E9' : 'rgba(0,0,0,0.06)',
              color: isActive ? 'white' : isDone ? '#2E7D32' : '#999',
              boxShadow: isActive ? '0 3px 0 #1254A0' : 'none',
              opacity: isLocked ? 0.5 : 1,
            }}>
            {ch.emoji} {ch.name.split(' ').slice(-1)[0]}
          </button>
        );
      })}
    </div>
  );

  return (
    <LandscapeShell title={'🗺️ Journey'} onBack={onBack || function() {}} topExtra={chapterPills}>
      {/* The SVG map fills from below the chrome to the bottom */}
      <div style={{ position: 'relative', height: 'calc(100vh - 70px)', overflow: 'hidden' }}>

        {/* SVG: path + level nodes */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
          viewBox="0 0 1100 480" preserveAspectRatio="xMidYMid meet">

          {/* Path shadow */}
          <path d={pathD} stroke="var(--path-shadow)" strokeWidth="34" fill="none" strokeLinecap="round"/>
          {/* Main path */}
          <path d={pathD} stroke="var(--path-main)" strokeWidth="28" fill="none" strokeLinecap="round"/>
          {/* Dash overlay */}
          <path d={pathD} stroke="var(--path-light)" strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray="5 22" opacity="0.55"/>

          {/* Level nodes */}
          {chLevels.map(function(lv, i) {
            var pt = PATH_PTS[i] || PATH_PTS[PATH_PTS.length - 1];
            var clickable = !lv.locked || lv.current;
            return (
              <g key={lv.id} transform={'translate(' + pt.x + ',' + pt.y + ')'}
                style={{ cursor: clickable ? 'pointer' : 'default' }}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : -1}
                aria-label={lv.locked && !lv.current ? 'Level ' + lv.id + ' locked' : 'Level ' + lv.id + ': ' + lv.word}
                onKeyDown={function(e) { if ((e.key === 'Enter' || e.key === ' ') && clickable) { e.preventDefault(); onPlayLevel(lv); } }}
                onClick={function() { if (clickable) onPlayLevel(lv); }}>
                <WebLevelNode level={lv}/>
              </g>
            );
          })}
        </svg>

        {/* Progress bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(8px)',
          padding: '9px 20px', display: 'flex', alignItems: 'center', gap: 12,
          borderTop: '2px solid rgba(255,255,255,0.9)',
          zIndex: 10,
        }}>
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 15, color: '#1A3A1A', whiteSpace: 'nowrap' }}>
            {activeCh.emoji} {activeCh.name}
          </div>
          <div style={{ flex: 1, height: 12, background: 'rgba(0,0,0,0.08)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: chLevels.length ? Math.round(chDone / chLevels.length * 100) + '%' : '0%',
              background: 'linear-gradient(90deg, #42A5F5, #1976D2)', borderRadius: 999 }}/>
          </div>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#1565C0', whiteSpace: 'nowrap' }}>
            {chDone} / {chLevels.length} levels ⭐
          </div>
        </div>
      </div>
    </LandscapeShell>
  );
}
```

- [ ] **Step 2: Replace the `WebLevelNode` function (lines 121–158)**

Delete lines 121–158 and replace with:

```jsx
function WebLevelNode({ level }) {
  var m = MODE_META[level.mode] || MODE_META.click;
  var isDone = level.done, isCurrent = level.current, isLocked = level.locked && !level.current;

  var nodeFill = isLocked ? '#9E9E9E' : isDone ? '#4CAF50' : ('var(--' + m.color + ')');

  return (
    <>
      {/* Pulse ring for current level */}
      {isCurrent && !prefersReducedMotion && (
        <circle r="46" fill="none" stroke="rgba(66,165,245,0.5)" strokeWidth="3">
          <animate attributeName="r" from="40" to="58" dur="1.6s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.7" to="0" dur="1.6s" repeatCount="indefinite"/>
        </circle>
      )}

      {/* Main circle */}
      <circle r="36" fill={nodeFill}
        stroke={isCurrent ? 'white' : 'rgba(255,255,255,0.55)'}
        strokeWidth={isCurrent ? 4 : 3}
        opacity={isLocked ? 0.75 : 1}/>

      {/* Icon */}
      <text x="0" y="10" textAnchor="middle"
        fontSize={isLocked ? 20 : 24}
        fontFamily="Nunito, system-ui">
        {isLocked ? '🔒' : isDone ? '✓' : m.icon}
      </text>

      {/* "YOU ARE HERE" bubble */}
      {isCurrent && (
        <>
          <rect x="-52" y="-76" width="104" height="24" rx="12" fill="white"/>
          <polygon points="-6,-52 6,-52 0,-44" fill="white"/>
          <text x="0" y="-59" textAnchor="middle" fontSize="10" fontWeight="900"
            fontFamily="Nunito, system-ui" fill="#1976D2">▶ YOU ARE HERE</text>
        </>
      )}

      {/* Word / level label */}
      <rect x={isLocked ? -30 : -(level.word ? Math.max(24, level.word.length * 5) : 30)}
        y="44" width={isLocked ? 60 : Math.max(48, (level.word || '').length * 10)} height="22" rx="11"
        fill="white" opacity="0.9"/>
      <text x="0" y="59" textAnchor="middle" fontSize="13" fontWeight="900"
        fontFamily="'Fredoka One', cursive" fill={isCurrent ? '#1565C0' : '#333'}>
        {isLocked ? ('Level ' + level.id) : level.word}
      </text>

      {/* Stars (done levels) */}
      {isDone && (
        <g transform="translate(-16, 70)">
          {[0, 1, 2].map(function(i) {
            return (
              <path key={i} transform={'translate(' + (i * 11) + ', 0) scale(0.5)'}
                d="M 6 0 L 7.5 3.5 L 11 4 L 8.5 6.5 L 9 10 L 6 8 L 3 10 L 3.5 6.5 L 1 4 L 4.5 3.5 Z"
                fill={i < level.stars ? 'var(--yellow)' : 'var(--alpha-md)'}
                stroke={i < level.stars ? 'var(--yellow-ink)' : 'none'} strokeWidth="0.5"/>
            );
          })}
        </g>
      )}
    </>
  );
}
```

- [ ] **Step 3: Pass `onBack` to `WebMap` at the call site in `WebApp.jsx`**

Find in `WebApp.jsx`:
```jsx
        {route.name === 'screen' && tab === 'map'  && <WebMap levels={levels} onPlayLevel={startLevel}/>}
```

Replace with:
```jsx
        {route.name === 'screen' && tab === 'map'  && <WebMap levels={levels} onPlayLevel={startLevel} onBack={function() { setTab('home'); }}/>}
```

- [ ] **Step 4: Verify the map screen**

Open the app → Journey tab. The map should show: landscape background, golden winding path, chapter pill tabs in the top chrome, level nodes sitting on the path, progress bar at bottom. Clicking a node should start the level.

- [ ] **Step 5: Commit**

```bash
git add src/web/WebScreens.jsx src/web/WebApp.jsx
git commit -m "feat: redesign map screen with landscape background and path nodes"
```

---

## Task 7: Wrap inner screens (Shop, Pet, Code Lab, Me) in `LandscapeShell`

**Files:**
- Modify: `src/web/WebApp.jsx` (the render block, lines 183–201)
- Modify: `src/web/WebScreens.jsx` (`WebMe` component)

The inner screens keep all their existing content but float it over the landscape background. We wrap each at the call site, not inside each screen component, to avoid large rewrites.

- [ ] **Step 1: Create a `ScreenPanel` helper component in `WebApp.jsx` (add right after `LandscapeShell`)**

```jsx
function ScreenPanel({ children }) {
  return (
    <div style={{
      margin: '16px 16px 16px',
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(10px)',
      borderRadius: 20,
      padding: 24,
      boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
      minHeight: 'calc(100vh - 120px)',
      overflow: 'auto',
    }}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Wrap Shop, Pet, Code Lab in the `WebApp` render block**

Find the three lines (around line 192–194):
```jsx
        {route.name === 'screen' && tab === 'me'   && <WebMe profile={profile} setProfile={setProfile} levels={levels} onOpenParent={onOpenParent}/>}
        {route.name === 'screen' && tab === 'code' && <WebCodeLab levels={levels} onPlayLevel={startLevel}/>}
        {route.name === 'screen' && tab === 'shop' && <WebShop profile={profile} setProfile={setProfile} levels={levels}/>}
        {route.name === 'screen' && tab === 'pet'  && profile.starterPicked && <WebPet profile={profile} setProfile={setProfile} levels={levels}/>}
```

Replace with:
```jsx
        {route.name === 'screen' && tab === 'me' && (
          <LandscapeShell title="⭐ My Stuff" onBack={function() { setTab('home'); }}>
            <ScreenPanel><WebMe profile={profile} setProfile={setProfile} levels={levels} onOpenParent={onOpenParent}/></ScreenPanel>
          </LandscapeShell>
        )}
        {route.name === 'screen' && tab === 'code' && (
          <LandscapeShell title="💻 Code Lab" onBack={function() { setTab('home'); }}>
            <ScreenPanel><WebCodeLab levels={levels} onPlayLevel={startLevel}/></ScreenPanel>
          </LandscapeShell>
        )}
        {route.name === 'screen' && tab === 'shop' && (
          <LandscapeShell title="🛍️ Shop" onBack={function() { setTab('home'); }}>
            <ScreenPanel><WebShop profile={profile} setProfile={setProfile} levels={levels}/></ScreenPanel>
          </LandscapeShell>
        )}
        {route.name === 'screen' && tab === 'pet' && profile.starterPicked && (
          <LandscapeShell title="🐾 My Pet" onBack={function() { setTab('home'); }}>
            <ScreenPanel><WebPet profile={profile} setProfile={setProfile} levels={levels}/></ScreenPanel>
          </LandscapeShell>
        )}
```

- [ ] **Step 3: Verify all four screens**

Open app, click each tab: Shop, My Pet, Code Lab, My Stuff. Each should show the landscape background + top chrome with yellow back button and Fredoka title, and the existing screen content inside a frosted white panel.

- [ ] **Step 4: Commit**

```bash
git add src/web/WebApp.jsx
git commit -m "feat: wrap inner screens in LandscapeShell with frosted content panel"
```

---

## Task 8: Apply Fredoka One headings to inner screen content

**Files:**
- Modify: `src/web/WebApp.jsx` (headings inside `WebShop`, `WebCodeLab`, `WebPet`)
- Modify: `src/web/WebScreens.jsx` (heading inside `WebMe`)

The inner screen titles like "🛍 The Pet Shop" and "🤖 The Code Lab" should use Fredoka One to stay consistent with the new aesthetic.

- [ ] **Step 1: Find and update heading font in `WebShop`**

In `WebApp.jsx`, find the `WebShop` render (around line 497–500). Find any `<h2>` or top heading element. Add `fontFamily: "'Fredoka One', cursive"` to its style.

Search for the text `The Pet Shop` or the shop heading — it will be something like:
```jsx
<h2 style={{ fontSize: 28, fontWeight: 900, ... }}>🛍 The Pet Shop</h2>
```

Add `fontFamily: "'Fredoka One', cursive"` to that style object.

- [ ] **Step 2: Update heading in `WebCodeLab`**

In `WebApp.jsx`, find `WebCodeLab` (around line 967). Find the heading `🤖 The Code Lab` and add `fontFamily: "'Fredoka One', cursive"`.

- [ ] **Step 3: Update heading in `WebPet`**

In `WebApp.jsx`, find `WebPet` (around line 1041). Find the pet screen heading element and add `fontFamily: "'Fredoka One', cursive"`.

- [ ] **Step 4: Update heading in `WebMe`**

In `src/web/WebScreens.jsx`, find the `WebMe` function. Find its top heading (e.g. "My Stuff" or profile name heading) and add `fontFamily: "'Fredoka One', cursive"`.

- [ ] **Step 5: Verify headings**

Open each inner screen — titles should render in the rounded Fredoka One style.

- [ ] **Step 6: Commit**

```bash
git add src/web/WebApp.jsx src/web/WebScreens.jsx
git commit -m "feat: apply Fredoka One headings to inner screen titles"
```

---

## Task 9: Final verification

- [ ] **Step 1: End-to-end walkthrough**

Open `SpellLoop Kids.html`. Walk through every tab in order:

| Screen | What to check |
|--------|--------------|
| Home | Landscape bg, sun+clouds+hills, Panda mascot left, Cat mascot right, 3×2 tile grid, "Keep going — WORD" button, stat strip, top chrome |
| Journey | Landscape bg, golden winding path, chapter pills (Forest/Sea/Mountain), level nodes sitting on path, "YOU ARE HERE" bubble + pulse on current, progress bar at bottom |
| My Stuff | Landscape bg + top chrome, frosted panel with existing profile content, Fredoka heading |
| Code Lab | Landscape bg + top chrome, frosted panel with level grid |
| Shop | Landscape bg + top chrome, frosted panel with shop tabs |
| My Pet | Landscape bg + top chrome, frosted panel with pet view |

- [ ] **Step 2: Check existing features still work**

1. Click a level node on the map → game starts
2. Complete a word → reward screen shows
3. Coins update in sidebar after earning
4. Parent PIN gate still works (separate `WebParent` — should be unchanged)
5. No console errors

- [ ] **Step 3: Check sidebar**

- 72px wide, frosted white, icon + tiny label per tab
- Active tab shows tinted background matching tile colour
- Coin pill shows current coin count

- [ ] **Step 4: Commit if any cleanup needed, then tag**

```bash
git add -p
git commit -m "fix: visual redesign polish"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered by task |
|-----------------|----------------|
| Landscape background (sky+hills) on every screen | Tasks 4, 5, 6, 7 (`LandscapeShell`) |
| Shared top chrome (yellow ← + blue ?) | Task 4 (`LandscapeShell`) |
| Sidebar redesign (72px icon-only) | Task 3 |
| Home: 6 tile grid | Task 5 |
| Home: Panda + Cat mascots | Task 5 (uses `bgColor="transparent"`) |
| Home: "Keep going" continue button | Task 5 |
| Home: greeting + stats strip | Task 5 |
| Map: landscape background | Task 6 |
| Map: golden winding path | Task 6 |
| Map: nodes sitting on path | Task 6 |
| Map: chapter pills in chrome | Task 6 |
| Map: progress bar at bottom | Task 6 |
| Inner screens: landscape + frosted panel | Task 7 |
| Fredoka One headings | Tasks 5, 8 |
| `bgColor` prop on avatars | Task 2 |
| Design tokens | Task 1 |
| Parent portal unchanged | (not touched) |
| No logic changes | (only visual) |

All requirements covered. No placeholders found.
