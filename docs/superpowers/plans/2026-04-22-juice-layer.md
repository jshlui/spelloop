# Juice Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a CSS-only, event-driven juice layer that makes every correct answer, level completion, and pet interaction feel warm and delightful — without touching any game logic.

**Architecture:** A tiny IIFE in `src/juice.js` exposes `window.Juice.emit(event, data)`. Game files call `Juice.emit()` at key moments; the juice layer responds by animating always-in-DOM overlay divs or elements targeted by stable `id` attributes — never touching React-controlled elements directly. All animation is pure CSS keyframes on transform + opacity only.

**Tech Stack:** Vanilla JS IIFE (no build step, no npm), CSS keyframes, plain CDN React 18 + Babel standalone (existing stack).

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/juice.css` | Create | All keyframe definitions, `.tile.correct` override, reduced-motion media query |
| `src/juice.js` | Create | Event bus, overlay injector, reduced-motion guard, all 8 emit handlers |
| `SpellLoop Kids.html` | Modify | Load juice.css + juice.js before App.jsx |
| `src/screens/Games.jsx` | Modify | Emit `correct`, `wrong`, `wordComplete`, `streak` at game outcome points |
| `src/screens/Reward.jsx` | Modify | Emit `rewardIn` + `coinEarned` on mount; add `id` to star divs |
| `src/web/WebApp.jsx` | Modify | Add stable `id` attrs; emit `petHappy` on feed/treat; emit `chapterBoss` on 3-star boss finish |

---

## Task 1: Create `src/juice.css`

**Files:**
- Create: `src/juice.css`

This file defines all keyframe animations and overrides the existing `pop` animation on `.tile.correct` with the richer `juiceBounce`. It also hides all juice overlays when `prefers-reduced-motion` is set.

**Important:** The existing `design.css` defines `.tile.correct { animation: pop 400ms ease; }`. `juice.css` overrides this with a higher-specificity rule using the same selector but a different keyframe name. Load order matters — `juice.css` must load after `design.css` (handled in Task 3).

- [ ] **Step 1: Create the file**

Write `src/juice.css` with this exact content:

```css
/* ── Juice Layer Animations ─────────────────────────────────── */

/* Override existing pop on .tile.correct — replaces design.css version */
@keyframes juiceBounce {
  0%   { transform: scale(1); }
  25%  { transform: scale(1.22); }
  55%  { transform: scale(0.92); }
  78%  { transform: scale(1.06); }
  100% { transform: scale(1); }
}
.tile.correct {
  animation: juiceBounce 400ms cubic-bezier(0.2, 0, 0, 1) forwards !important;
}

/* Shake with rose glow — used on wrong-answer wrappers */
@keyframes juiceShake {
  0%,100% { transform: translateX(0); box-shadow: none; }
  15%     { transform: translateX(-8px); }
  30%     { transform: translateX(8px); box-shadow: 0 0 0 3px rgba(244,63,94,0.35); }
  50%     { transform: translateX(-6px); }
  70%     { transform: translateX(6px); }
  85%     { transform: translateX(-3px); }
}
.juice-shake {
  animation: juiceShake 320ms cubic-bezier(0.2, 0, 0, 1) forwards;
}

/* Snappy pop — for streak badge and coin pill */
@keyframes juicePop {
  0%   { transform: scale(0.6); }
  65%  { transform: scale(1.18); }
  100% { transform: scale(1); }
}
.juice-pop {
  animation: juicePop 260ms cubic-bezier(0.2, 0, 0, 1) forwards;
}

/* Staggered star entrance on reward screen */
@keyframes juiceStarPop {
  0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
  65%  { transform: scale(1.3) rotate(5deg);  opacity: 1; }
  100% { transform: scale(1)   rotate(0deg);  opacity: 1; }
}
.juice-star-pop {
  animation: juiceStarPop 480ms cubic-bezier(0.2, 0, 0, 1) forwards;
}

/* Coin rotateY spin */
@keyframes juiceCoinSpin {
  0%   { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
}
.juice-coin-spin {
  animation: juiceCoinSpin 480ms cubic-bezier(0.2, 0, 0, 1) forwards;
}

/* Screen flash overlay */
@keyframes juiceScreenFlash {
  0%   { opacity: 0; }
  20%  { opacity: 0.14; }
  100% { opacity: 0; }
}

/* Boss corner flash */
@keyframes juiceBossFlash {
  0%,100% { opacity: 0; transform: scale(1); }
  40%     { opacity: 0.6; transform: scale(1.4); }
}

/* Reduced motion — disable all juice visuals */
@media (prefers-reduced-motion: reduce) {
  .juice-shake,
  .juice-pop,
  .juice-star-pop,
  .juice-coin-spin {
    animation: none !important;
  }
  .tile.correct {
    animation: none !important;
  }
  #juice-screen-flash,
  #juice-boss-tl,
  #juice-boss-tr,
  #juice-boss-bl,
  #juice-boss-br {
    display: none !important;
  }
}
```

- [ ] **Step 2: Verify the file exists**

```bash
ls -la /Users/josh/Documents/Spelloop/src/juice.css
```

Expected: file present, ~80 lines.

---

## Task 2: Create `src/juice.js`

**Files:**
- Create: `src/juice.js`

This is the event bus. It:
1. Reads `prefers-reduced-motion` on init and bails out of all handlers if true
2. Injects 5 always-in-DOM overlay divs (screen flash + 4 boss corners) after DOMContentLoaded
3. Exposes `window.Juice.emit(event, data)` — a plain function dispatch table
4. Provides an `animate(el, className, duration)` helper that adds a class and removes it after `duration`ms so the animation can replay next time

**Critical:** `juice.js` is plain JS (no JSX, no Babel). It loads via a regular `<script src>` tag, not `type="text/babel"`.

- [ ] **Step 1: Create the file**

Write `src/juice.js` with this exact content:

```js
(function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Helpers ───────────────────────────────────────────────

  function animate(el, className, duration) {
    if (!el || reducedMotion) return;
    el.classList.remove(className);
    // Force reflow so re-adding the class restarts the animation
    void el.offsetWidth;
    el.classList.add(className);
    setTimeout(function () { el.classList.remove(className); }, duration);
  }

  function injectOverlays() {
    // Screen flash — full viewport, pointer-events none, z-index 9998
    var flash = document.createElement('div');
    flash.id = 'juice-screen-flash';
    flash.style.cssText = [
      'position:fixed', 'inset:0', 'pointer-events:none',
      'z-index:9998', 'opacity:0',
      'background:rgba(245,158,11,0.55)',
      'border-radius:0',
    ].join(';');
    document.body.appendChild(flash);

    // Boss corner flashes — 4 small amber squares at each corner
    var corners = [
      { id: 'juice-boss-tl', top: '16px',  left:  '16px'  },
      { id: 'juice-boss-tr', top: '16px',  right: '16px'  },
      { id: 'juice-boss-bl', bottom: '16px', left: '16px' },
      { id: 'juice-boss-br', bottom: '16px', right: '16px' },
    ];
    corners.forEach(function (c) {
      var el = document.createElement('div');
      el.id = c.id;
      var css = [
        'position:fixed', 'width:20px', 'height:20px',
        'border-radius:6px', 'pointer-events:none',
        'z-index:9999', 'opacity:0',
        'background:rgba(245,158,11,0.85)',
      ];
      if (c.top)    css.push('top:'    + c.top);
      if (c.bottom) css.push('bottom:' + c.bottom);
      if (c.left)   css.push('left:'   + c.left);
      if (c.right)  css.push('right:'  + c.right);
      el.style.cssText = css.join(';');
      document.body.appendChild(el);
    });
  }

  function flashOverlay(id, keyframe, duration) {
    var el = document.getElementById(id);
    if (!el || reducedMotion) return;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = keyframe + ' ' + duration + 'ms cubic-bezier(0.2,0,0,1) forwards';
  }

  // ── Handlers ──────────────────────────────────────────────

  var handlers = {

    // correct — .tile.correct bounce is handled entirely by juice.css override.
    // No JS needed; React sets the class, CSS does the work.
    correct: function () {},

    // wrong — animate a wrapper div with id="juice-wrong-wrap" if present,
    // otherwise no-op (not every game has a stable wrapper).
    wrong: function () {
      var el = document.getElementById('juice-wrong-wrap');
      animate(el, 'juice-shake', 320);
    },

    // streak — animate the streak badge in the home screen sidebar
    streak: function (n) {
      var el = document.getElementById('juice-streak');
      if (!el) return;
      animate(el, 'juice-pop', 260);
      if (n >= 5) {
        el.style.transition = 'box-shadow 200ms';
        el.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.6)';
        setTimeout(function () { el.style.boxShadow = ''; }, 800);
      }
    },

    // wordComplete — warm amber screen flash before Burst fires
    wordComplete: function () {
      flashOverlay('juice-screen-flash', 'juiceScreenFlash', 500);
    },

    // rewardIn — stagger star pop animations + bounce heading
    rewardIn: function () {
      ['juice-star-0', 'juice-star-1', 'juice-star-2'].forEach(function (id, i) {
        var el = document.getElementById(id);
        if (!el) return;
        setTimeout(function () { animate(el, 'juice-star-pop', 480); }, i * 80);
      });
      var heading = document.getElementById('juice-reward-heading');
      if (heading) setTimeout(function () { animate(heading, 'juice-pop', 260); }, 300);
    },

    // coinEarned — pop + spin the sidebar coin pill
    coinEarned: function () {
      var coin = document.getElementById('juice-coin');
      if (!coin) return;
      animate(coin, 'juice-pop', 260);
      var icon = coin.querySelector('.juice-coin-icon');
      if (icon) animate(icon, 'juice-coin-spin', 480);
    },

    // petHappy — bounce the pet sprite wrapper
    petHappy: function () {
      var el = document.getElementById('juice-pet');
      animate(el, 'juice-pop', 260);
    },

    // chapterBoss — amber corner flash on 3-star boss completion
    chapterBoss: function () {
      ['juice-boss-tl', 'juice-boss-tr', 'juice-boss-bl', 'juice-boss-br'].forEach(function (id, i) {
        setTimeout(function () {
          flashOverlay(id, 'juiceBossFlash', 600);
        }, i * 60);
      });
    },
  };

  // ── Public API ────────────────────────────────────────────

  window.Juice = {
    reducedMotion: reducedMotion,
    emit: function (event, data) {
      if (reducedMotion) return;
      var handler = handlers[event];
      if (handler) handler(data);
    },
  };

  // Inject overlays once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectOverlays);
  } else {
    injectOverlays();
  }
})();
```

- [ ] **Step 2: Verify the file exists**

```bash
ls -la /Users/josh/Documents/Spelloop/src/juice.js
```

Expected: file present, ~110 lines.

- [ ] **Step 3: Commit**

```bash
git add src/juice.css src/juice.js
git commit -m "feat: add juice layer CSS and JS event bus"
```

---

## Task 3: Wire juice files into `SpellLoop Kids.html`

**Files:**
- Modify: `SpellLoop Kids.html`

The juice CSS must load after `design.css` (to override `.tile.correct`). The juice JS must load before `App.jsx` (so `window.Juice` exists when game files start). Both load as regular (non-Babel) resources.

- [ ] **Step 1: Add the CSS link after `design.css`**

In `SpellLoop Kids.html`, find:
```html
<link rel="stylesheet" href="styles/design.css"/>
```

Add immediately after it:
```html
<link rel="stylesheet" href="src/juice.css"/>
```

- [ ] **Step 2: Add the JS script before `src/App.jsx`**

Find:
```html
<script type="text/babel" src="src/App.jsx"></script>
```

Add immediately before it:
```html
<script src="src/juice.js"></script>
```

- [ ] **Step 3: Open the app and verify no console errors**

Open `http://localhost:8765/SpellLoop%20Kids.html` in a browser. Open DevTools console. Expected: no errors. `window.Juice` should exist — type `window.Juice` in console and see the object.

- [ ] **Step 4: Commit**

```bash
git add "SpellLoop Kids.html"
git commit -m "feat: load juice CSS and JS in HTML"
```

---

## Task 4: Emit juice events in `src/screens/Games.jsx`

**Files:**
- Modify: `src/screens/Games.jsx`

Add `Juice.emit()` calls at the 3 outcome points that appear in every game mode. The pattern is the same in all 11 modes:
- **Correct letter/answer** → `Juice.emit('correct')`
- **Wrong answer** → `Juice.emit('wrong')`  
- **Word/sequence complete** → `Juice.emit('wordComplete')` immediately before `setBurst(true)`

Also add streak tracking for `ClickGame` — it's the most common mode and has a per-letter correct sequence that maps cleanly to a streak counter. Add a `streakRef` to track consecutive corrects and emit `Juice.emit('streak', n)` after each correct letter.

**Important:** `window.Juice` may not exist if juice.js fails to load. Always call `window.Juice?.emit(...)` (optional chaining) to be safe.

- [ ] **Step 1: Add correct/wrong/wordComplete/streak to ClickGame**

In `ClickGame`, add a `streakRef` right after the existing refs, then update the `pick` function. The correct branch starts at line ~49, wrong branch at ~66.

First add the ref after `taskStartRef`:
```js
  const taskStartRef = React.useRef(Date.now());
  const streakRef = React.useRef(0);
```

Then change the `pick` function body:
```js
    if (letter === target) {
      recordClick(true, 'click', Date.now() - taskStartRef.current);
      window.sfx?.playCorrect();
      streakRef.current += 1;
      window.Juice?.emit('correct');
      window.Juice?.emit('streak', streakRef.current);
      setFeedback({ letter, correct: true });
      setTimeout(() => {
        if (idx + 1 >= word.length) {
          recordTaskComplete('click', Date.now() - taskStartRef.current);
          taskStartRef.current = Date.now();
          window.Juice?.emit('wordComplete');
          setBurst(true);
          window.sfx?.complete();
          setTimeout(() => onDone(wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1), 1000);
        } else {
          setIdx(idx + 1);
          setFeedback(null);
        }
      }, 500);
    } else {
      recordClick(false, 'click', Date.now() - taskStartRef.current);
      window.sfx?.playWrong();
      window.Juice?.emit('wrong');
      streakRef.current = 0;
      setWrongCount(w => w + 1);
      setFeedback({ letter, correct: false });
      setTimeout(() => setFeedback(null), 400);
    }
```

- [ ] **Step 2: Add events to DragGame**

In `DragGame`, find the `useEffect` that checks `filledCount === word.length`. The correct branch has `setBurst(true)`.

Change:
```js
      if (attempt === word) {
        setBurst(true); window.sfx?.complete();
        setTimeout(() => onDone(wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1), 1000);
      } else {
        window.sfx?.playWrong();
        setWrongCount(w => w + 1);
```

To:
```js
      if (attempt === word) {
        window.Juice?.emit('wordComplete');
        setBurst(true); window.sfx?.complete();
        setTimeout(() => onDone(wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1), 1000);
      } else {
        window.sfx?.playWrong();
        window.Juice?.emit('wrong');
        setWrongCount(w => w + 1);
```

Also in `placeTile`, add correct emit after the sfx call:
```js
    if (t.letter === word[slotIdx]) { window.sfx?.tap(); window.Juice?.emit('correct'); }
```

Replace:
```js
    if (t.letter === word[slotIdx]) window.sfx?.tap();
```

With:
```js
    if (t.letter === word[slotIdx]) { window.sfx?.tap(); window.Juice?.emit('correct'); }
```

- [ ] **Step 3: Add events to TypeGame**

In `TypeGame`, find the `press` function. Change:
```js
    if (letter === expected) {
      const nt = typed + letter;
      setTyped(nt);
      if (nt === word) {
        window.sfx?.complete(); setBurst(true);
        setTimeout(() => onDone(wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1), 1000);
      } else {
        window.sfx?.playCorrect();
      }
    } else {
      window.sfx?.playWrong();
      setWrongCount(w => w + 1);
```

To:
```js
    if (letter === expected) {
      const nt = typed + letter;
      setTyped(nt);
      window.Juice?.emit('correct');
      if (nt === word) {
        window.Juice?.emit('wordComplete');
        window.sfx?.complete(); setBurst(true);
        setTimeout(() => onDone(wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1), 1000);
      } else {
        window.sfx?.playCorrect();
      }
    } else {
      window.sfx?.playWrong();
      window.Juice?.emit('wrong');
      setWrongCount(w => w + 1);
```

- [ ] **Step 4: Add events to MissingGame**

In `MissingGame`, find the `pick` function. Change:
```js
    if (c === target) {
      recordClick(true, 'missing', Date.now() - taskStartRef.current);
      window.sfx?.playCorrect();
      setBurst(true); window.sfx?.complete();
      recordTaskComplete('missing', Date.now() - taskStartRef.current);
      setTimeout(() => onDone(wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1), 1000);
    } else {
      recordClick(false, 'missing', Date.now() - taskStartRef.current);
      window.sfx?.playWrong();
      setWrongCount(w => w + 1);
```

To:
```js
    if (c === target) {
      recordClick(true, 'missing', Date.now() - taskStartRef.current);
      window.sfx?.playCorrect();
      window.Juice?.emit('correct');
      window.Juice?.emit('wordComplete');
      setBurst(true); window.sfx?.complete();
      recordTaskComplete('missing', Date.now() - taskStartRef.current);
      setTimeout(() => onDone(wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1), 1000);
    } else {
      recordClick(false, 'missing', Date.now() - taskStartRef.current);
      window.sfx?.playWrong();
      window.Juice?.emit('wrong');
      setWrongCount(w => w + 1);
```

- [ ] **Step 5: Add events to KeyboardGame**

In `KeyboardGame`, find the `press` function. Change:
```js
    if (l === target) {
      setFlash({ l, ok: true });
      window.sfx?.playCorrect();
      setTimeout(() => {
        setFlash(null);
        if (idx + 1 >= word.length) {
          setBurst(true); window.sfx?.complete();
          setTimeout(() => onDone(wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1), 1000);
        } else {
          setIdx(idx + 1);
        }
      }, 150);
    } else {
      setFlash({ l, ok: false });
      window.sfx?.playWrong();
      setWrongCount(w => w + 1);
```

To:
```js
    if (l === target) {
      window.Juice?.emit('correct');
      setFlash({ l, ok: true });
      window.sfx?.playCorrect();
      setTimeout(() => {
        setFlash(null);
        if (idx + 1 >= word.length) {
          window.Juice?.emit('wordComplete');
          setBurst(true); window.sfx?.complete();
          setTimeout(() => onDone(wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1), 1000);
        } else {
          setIdx(idx + 1);
        }
      }, 150);
    } else {
      setFlash({ l, ok: false });
      window.sfx?.playWrong();
      window.Juice?.emit('wrong');
      setWrongCount(w => w + 1);
```

- [ ] **Step 6: Add events to remaining game modes (PrecisionGame, ScrambleGame, SpeedGame, EchoGame, FlashGame)**

Apply the same pattern — `Juice.emit('correct')` on correct, `Juice.emit('wrong')` on wrong, `Juice.emit('wordComplete')` immediately before `setBurst(true)`.

For **PrecisionGame** (`handleClick` function):
```js
    // Before: window.sfx && window.sfx.playCorrect && window.sfx.playCorrect();
    // After:
    window.sfx && window.sfx.playCorrect && window.sfx.playCorrect();
    window.Juice?.emit('correct');
    if (letterIdx + 1 >= word.length) {
      // ...
      window.Juice?.emit('wordComplete');
      setBurst(true);
```

For **ScrambleGame** (`pick` function):
```js
    if (tile.letter === expected) {
      window.sfx?.playCorrect();
      window.Juice?.emit('correct');
      // ...
      if (nt === word) {
        window.Juice?.emit('wordComplete');
        setBurst(true); window.sfx?.complete();
```
Wrong path:
```js
      window.sfx?.playWrong();
      window.Juice?.emit('wrong');
```

For **SpeedGame** (`press` function):
```js
    if (letter === expected) {
      window.sfx?.playCorrect();
      // ...
      window.Juice?.emit('correct');
      if (nt === word) {
        window.Juice?.emit('wordComplete');
        setDone(true); setBurst(true); window.sfx?.complete();
```
Wrong path:
```js
      window.sfx?.playWrong();
      window.Juice?.emit('wrong');
```

For **EchoGame** and **FlashGame** — same pattern as TypeGame (correct/wrong in `press`, wordComplete before setBurst).

- [ ] **Step 7: Verify in browser**

Open the app, navigate to any level, play a word. Open DevTools console, type:
```js
window.Juice.emit('correct')
window.Juice.emit('wordComplete')
```
Expected: no errors. Correct tile should bounce; brief amber flash should appear.

- [ ] **Step 8: Commit**

```bash
git add src/screens/Games.jsx
git commit -m "feat: emit juice events from all game modes"
```

---

## Task 5: Wire juice events into `src/screens/Reward.jsx`

**Files:**
- Modify: `src/screens/Reward.jsx`

Two things to do:
1. Add `id` attrs to the 3 star wrapper divs so `juice.js` can find them
2. Emit `rewardIn` and `coinEarned` in the mount `useEffect`

- [ ] **Step 1: Add IDs to star wrapper divs**

In `RewardScreen`, find the stars section:
```jsx
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              transform: animIn && i < stars ? 'scale(1) rotate(0)' : 'scale(0) rotate(-180deg)',
              transition: `transform 500ms cubic-bezier(.34,1.1,.64,1) ${i * 180 + 200}ms`,
            }}>
              <Star filled={i < stars} size={60}/>
            </div>
          ))}
        </div>
```

Change to:
```jsx
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
          {[0, 1, 2].map(i => (
            <div key={i} id={'juice-star-' + i} style={{
              transform: animIn && i < stars ? 'scale(1) rotate(0)' : 'scale(0) rotate(-180deg)',
              transition: `transform 500ms cubic-bezier(.34,1.1,.64,1) ${i * 180 + 200}ms`,
            }}>
              <Star filled={i < stars} size={60}/>
            </div>
          ))}
        </div>
```

- [ ] **Step 2: Add ID to the heading and emit juice events on mount**

Find the "You did it!" heading:
```jsx
        <div style={{
          fontSize: 48, fontWeight: 900, lineHeight: 1, marginBottom: 8,
          transform: animIn ? 'scale(1)' : 'scale(0.5)',
          transition: 'transform 500ms cubic-bezier(.34,1.1,.64,1)',
        }}>You did it!</div>
```

Add `id="juice-reward-heading"`:
```jsx
        <div id="juice-reward-heading" style={{
          fontSize: 48, fontWeight: 900, lineHeight: 1, marginBottom: 8,
          transform: animIn ? 'scale(1)' : 'scale(0.5)',
          transition: 'transform 500ms cubic-bezier(.34,1.1,.64,1)',
        }}>You did it!</div>
```

- [ ] **Step 3: Emit events in the mount useEffect**

Find the existing mount `useEffect`:
```js
  React.useEffect(() => {
    const t = setTimeout(() => setAnimIn(true), 100);
    [0, 300, 600].forEach((d, i) => { if (i < stars) setTimeout(() => window.sfx?.star(), d + 200); });
    return () => clearTimeout(t);
  }, []);
```

Change to:
```js
  React.useEffect(() => {
    const t = setTimeout(() => setAnimIn(true), 100);
    [0, 300, 600].forEach((d, i) => { if (i < stars) setTimeout(() => window.sfx?.star(), d + 200); });
    setTimeout(() => window.Juice?.emit('rewardIn'), 200);
    setTimeout(() => window.Juice?.emit('coinEarned'), 800);
    return () => clearTimeout(t);
  }, []);
```

- [ ] **Step 4: Verify in browser**

Complete any level. The reward screen should appear with stars popping in with a staggered bounce and the coin pill in the sidebar briefly spinning.

- [ ] **Step 5: Commit**

```bash
git add src/screens/Reward.jsx
git commit -m "feat: emit rewardIn and coinEarned from reward screen"
```

---

## Task 6: Add stable IDs and emit events in `src/web/WebApp.jsx`

**Files:**
- Modify: `src/web/WebApp.jsx`

Three changes:
1. Add `id="juice-coin"` to the sidebar coin pill div + `juice-coin-icon` class to the 🪙 emoji div
2. Add `id="juice-streak"` to the home screen streak badge
3. Add `id="juice-pet"` to the pet sprite drop-shadow wrapper
4. Emit `Juice.emit('petHappy')` after a successful `feed()` or `useTreat()`
5. Emit `Juice.emit('chapterBoss')` in `finishGame` when it's a 3-star boss level

- [ ] **Step 1: Add IDs to sidebar coin pill**

Find the coin pill (around line 320):
```jsx
      <div className="sidebar-coins" style={{
        width: 52, height: 42, background: 'var(--gold)', borderRadius: 999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 1, marginBottom: 8,
        boxShadow: '0 3px 0 var(--gold-dark)',
      }}>
        <div style={{ fontSize: 16 }}>🪙</div>
        <div style={{ fontSize: 10, fontWeight: 900, color: '#451A03' }}>{profile.coins || 0}</div>
      </div>
```

Change to:
```jsx
      <div id="juice-coin" className="sidebar-coins" style={{
        width: 52, height: 42, background: 'var(--gold)', borderRadius: 999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 1, marginBottom: 8,
        boxShadow: '0 3px 0 var(--gold-dark)',
      }}>
        <div className="juice-coin-icon" style={{ fontSize: 16 }}>🪙</div>
        <div style={{ fontSize: 10, fontWeight: 900, color: '#451A03' }}>{profile.coins || 0}</div>
      </div>
```

- [ ] **Step 2: Add ID to streak badge**

Find the streak badge (around line 562):
```jsx
            <div className="home-stat-badge home-stat-streak" aria-label={profile.streak + ' day streak'}>
```

Change to:
```jsx
            <div id="juice-streak" className="home-stat-badge home-stat-streak" aria-label={profile.streak + ' day streak'}>
```

- [ ] **Step 3: Add ID to pet sprite wrapper**

Find the pet sprite drop-shadow div (around line 1416):
```jsx
              <div style={{ filter: 'drop-shadow(0 0 24px rgba(37,99,235,0.5))' }}>
                <PetSprite speciesId={activePetId} completedChapters={completedChapters}
                  mood={petMood} size={160} equipped={petEquipped} animate={true}/>
              </div>
```

Change to:
```jsx
              <div id="juice-pet" style={{ filter: 'drop-shadow(0 0 24px rgba(37,99,235,0.5))' }}>
                <PetSprite speciesId={activePetId} completedChapters={completedChapters}
                  mood={petMood} size={160} equipped={petEquipped} animate={true}/>
              </div>
```

- [ ] **Step 4: Emit `petHappy` from `feed()`**

Find the `feed` function (around line 1255):
```js
  function feed() {
    if (coins < 5 || petMood >= 100 || !activePetId) return;
    window.sfx?.complete();
    setProfile(function(prev) {
```

Add the emit after the guard:
```js
  function feed() {
    if (coins < 5 || petMood >= 100 || !activePetId) return;
    window.sfx?.complete();
    window.Juice?.emit('petHappy');
    setProfile(function(prev) {
```

- [ ] **Step 5: Emit `petHappy` from `useTreat()`**

Find the `useTreat` function (around line 1316):
```js
  function useTreat(item) {
    var count = (profile.treats || {})[item.id] || 0;
    if (count < 1 || !activePetId) return;
    window.sfx?.complete();
    setProfile(function(prev) {
```

Add the emit:
```js
  function useTreat(item) {
    var count = (profile.treats || {})[item.id] || 0;
    if (count < 1 || !activePetId) return;
    window.sfx?.complete();
    window.Juice?.emit('petHappy');
    setProfile(function(prev) {
```

- [ ] **Step 6: Emit `chapterBoss` in `finishGame` for 3-star boss levels**

Find `finishGame` (around line 86). Find where `setRoute` is called at the end:
```js
    setRoute({ name: 'reward', word: capturedRoute.word, stars: stars, mode: capturedRoute.mode, coins: coinsEarned });
```

Add the boss check immediately before it:
```js
    if (stars === 3 && capturedRoute.mode === 'boss') {
      window.Juice?.emit('chapterBoss');
    }
    setRoute({ name: 'reward', word: capturedRoute.word, stars: stars, mode: capturedRoute.mode, coins: coinsEarned });
```

- [ ] **Step 7: Verify in browser**

1. Go to Pet screen → feed the pet → pet sprite should bounce once
2. Open browser console → type `window.Juice.emit('chapterBoss')` → 4 amber corner squares should flash
3. Inspect element `#juice-coin` — should exist in DOM
4. No console errors

- [ ] **Step 8: Commit**

```bash
git add src/web/WebApp.jsx
git commit -m "feat: add juice IDs and petHappy/chapterBoss emits to WebApp"
```

---

## Task 7: Full verification pass

**Files:** None — verification only.

Open `http://localhost:8765/SpellLoop%20Kids.html`. Use browser DevTools.

- [ ] **Check 1: Correct tile bounce**

Play any level (Click mode is easiest). Click the right letter. Expected: tile bounces with `juiceBounce` (larger than the old subtle `pop` scale). No double animation.

- [ ] **Check 2: Wrong answer shake**

Click a wrong letter. Expected: brief shake on the choice tile row. No console error.

- [ ] **Check 3: Word complete flash**

Complete a full word. Expected: brief warm amber flash on screen just before the Burst confetti appears.

- [ ] **Check 4: Reward screen**

Complete a level and reach the reward screen. Expected: stars pop in with slight stagger (each ~80ms apart). "You did it!" heading pops. Coin pill in sidebar briefly pops + spins.

- [ ] **Check 5: Pet bounce**

Go to Pet screen. Feed the pet. Expected: pet sprite bounces once.

- [ ] **Check 6: Boss flash (manual test)**

In browser console run: `window.Juice.emit('chapterBoss')`. Expected: 4 amber corner squares appear briefly and fade.

- [ ] **Check 7: Reduced motion**

In Chrome DevTools → Rendering tab → check "Emulate CSS media feature prefers-reduced-motion". Reload. Play a level. Expected: no animations fire, game still fully playable.

- [ ] **Check 8: No double sfx**

Play a correct answer with DevTools audio tab open. Expected: `playCorrect` fires once only (not twice).

- [ ] **Check 9: No console errors**

DevTools console should be clean (no JS errors, no undefined reference to Juice).

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat: juice layer complete — warm delight on all game events"
```
