# Spelloop Juice Layer — Design Spec

**Date:** 2026-04-22  
**Goal:** Add Bluey-style warm delight to every game mode via a CSS-only, event-driven juice layer — zero changes to game logic.

---

## Context

Spelloop already has 11 game modes, pets, a shop, and a full coin economy. The missing ingredient is *feel* — each correct answer and level completion is functionally complete but emotionally flat. The juice layer fixes this without touching any game logic, scoring, or state management.

**Approach chosen:** CSS-only juice layer (Option A from brainstorming). No canvas particles, no physics engine. Pure CSS keyframes on transform + opacity = guaranteed 60fps on low-end tablets.

**Tone:** Bluey-style warm delight — expressive, cozy, satisfying. Not arcade chaos.

---

## Architecture

A tiny global event bus (`window.Juice`) lives in `src/juice.js`. Game screens call `Juice.emit('correct')`, `Juice.emit('wordComplete')`, etc. The juice layer listens and responds with CSS animations.

**React safety:** Juice never calls `classList.add` on React-controlled elements. It targets:
1. **Stable-ID wrappers** — sidebar coin pill, streak badge, pet sprite wrapper each get a permanent `id` attribute in `WebApp.jsx`. Juice finds them with `document.getElementById`.
2. **Always-in-DOM overlay divs** — screen flash and boss flash are fixed, pointer-events-none divs injected by `juice.js` on load. React never touches them.
3. **CSS class override** — `juiceBounce` replaces the existing `pop` keyframe by overriding the `.tile-correct` selector in `juice.css`. React sets the class name; juice.css controls the animation definition.

**Reduced motion:** `juice.js` reads `window.matchMedia('(prefers-reduced-motion: reduce)').matches` on init and stores it as `Juice.reducedMotion`. All emit handlers no-op immediately when true.

**SFX:** Juice does not call `sfx` methods. Games already call `sfx.playCorrect()`, `sfx.playWrong()`, `sfx.complete()` at the right moments. Juice is visual-only to avoid double-play.

---

## Event Catalogue

| Event | Emitted from | Visual response |
|-------|-------------|-----------------|
| `correct` | Games.jsx — on correct letter/word | `.tile-correct` gets `juiceBounce` (replaces `pop` keyframe) |
| `wrong` | Games.jsx — on wrong answer | Shake wrapper gets amber→rose glow via `juiceShake` extended |
| `streak(n)` | Games.jsx — after consecutive corrects | `#juice-streak` gets `juicePop` at n=3; amber glow at n=5+ |
| `wordComplete` | Games.jsx — before `setBurst(true)` | Screen flash overlay: opacity 0→0.14→0, warm amber, 500ms |
| `rewardIn` | Reward.jsx — useEffect on mount | Star divs get `juiceStarPop` with 80ms stagger per star; heading gets `juiceBounce` |
| `coinEarned` | Reward.jsx — useEffect on mount | `#juice-coin` gets `juicePop` + `juiceCoinSpin` (rotateY 360°) |
| `petHappy` | WebApp.jsx — feed/play success handler | `#juice-pet` gets `juiceBounce` |
| `chapterBoss` | WebApp.jsx — on 3-star complete of a boss-flagged level | 4 corner flash divs pulse amber, 600ms |

**Not included (scoped out):**
- `bossHit` / `bossDefeated` — no per-hit event source in game logic
- Voice reactions — future phase
- Canvas particles — future phase if CSS feel isn't enough

---

## CSS Keyframes (`src/juice.css`)

```css
/* Override existing pop on correct tiles — replaces, doesn't stack */
@keyframes juiceBounce {
  0%   { transform: scale(1); }
  25%  { transform: scale(1.22); }
  55%  { transform: scale(0.92); }
  78%  { transform: scale(1.06); }
  100% { transform: scale(1); }
}
.tile-correct { animation: juiceBounce 400ms cubic-bezier(0.2, 0, 0, 1) forwards; }

/* Extended shake — compatible with React wrapper targeting */
@keyframes juiceShake {
  0%,100% { transform: translateX(0); box-shadow: none; }
  15%     { transform: translateX(-8px); }
  30%     { transform: translateX(8px); box-shadow: 0 0 0 3px rgba(244,63,94,0.35); }
  50%     { transform: translateX(-6px); }
  70%     { transform: translateX(6px); }
  85%     { transform: translateX(-3px); }
}

/* Snappy pop for badges */
@keyframes juicePop {
  0%   { transform: scale(0.6); }
  65%  { transform: scale(1.18); }
  100% { transform: scale(1); }
}

/* Staggered star entrance — applied per-star with animation-delay */
@keyframes juiceStarPop {
  0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
  65%  { transform: scale(1.3) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

/* Coin spin — rotateY on icon only */
@keyframes juiceCoinSpin {
  0%   { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
}

/* Screen flash overlay */
@keyframes juiceScreenFlash {
  0%   { opacity: 0; }
  20%  { opacity: 0.14; }
  100% { opacity: 0; }
}

/* Boss corner flash — 4 small fixed corner divs */
@keyframes juiceBossFlash {
  0%,100% { opacity: 0; transform: scale(1); }
  40%     { opacity: 0.6; transform: scale(1.4); }
}

/* Reduce motion — disable all juice animations */
@media (prefers-reduced-motion: reduce) {
  .juice-bounce, .juice-pop, .juice-star-pop, .juice-coin-spin { animation: none !important; }
  #juice-screen-flash, #juice-boss-tl, #juice-boss-tr, #juice-boss-bl, #juice-boss-br { display: none !important; }
}
```

---

## `src/juice.js` Structure

```js
(function() {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Inject always-in-DOM overlay elements
  function injectOverlays() { /* screen flash div + 4 boss corner divs */ }

  // Apply a CSS animation class to an element, auto-removing after duration
  function animate(el, className, duration) { /* classList.add, setTimeout remove */ }

  // Emit handlers
  var handlers = {
    correct:      function()  { /* animate .tile-correct — already handled by CSS override */ },
    wrong:        function()  { /* animate shake wrapper */ },
    streak:       function(n) { /* animate #juice-streak */ },
    wordComplete: function()  { /* animate #juice-screen-flash */ },
    rewardIn:     function()  { /* animate star divs with stagger, heading bounce */ },
    coinEarned:   function()  { /* animate #juice-coin */ },
    petHappy:     function()  { /* animate #juice-pet */ },
    chapterBoss:  function()  { /* animate boss corner divs */ },
  };

  window.Juice = {
    reducedMotion: reducedMotion,
    emit: function(event, data) {
      if (reducedMotion) return;
      var handler = handlers[event];
      if (handler) handler(data);
    },
  };

  // Inject overlays after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectOverlays);
  } else {
    injectOverlays();
  }
})();
```

---

## Files Changed

| File | Change |
|------|--------|
| `src/juice.js` | **New** — event bus, overlay injector, all handlers |
| `src/juice.css` | **New** — 7 keyframe sets, `.tile-correct` override, reduced-motion media query |
| `SpellLoop Kids.html` | Add `<link>` for juice.css and `<script>` for juice.js, both before App.jsx |
| `src/screens/Games.jsx` | Add `Juice.emit('correct')`, `Juice.emit('wrong')`, `Juice.emit('wordComplete')`, `Juice.emit('streak', n)` at the 3 outcome points in each game mode |
| `src/screens/Reward.jsx` | Add `Juice.emit('rewardIn')` + `Juice.emit('coinEarned')` in mount useEffect. Add `id` attrs to star wrapper divs. |
| `src/web/WebApp.jsx` | Add `id="juice-coin"` to sidebar coin pill, `id="juice-streak"` to streak badge, `id="juice-pet"` to pet sprite wrapper. Add `Juice.emit('petHappy')` in feed/play handler. Add `Juice.emit('chapterBoss')` on 3-star boss level complete. |

**Total:** 2 new files, 4 existing files touched. No game logic changes.

---

## What Does NOT Change

- All game logic, scoring, star calculation
- All sfx calls (juice does not call sfx)
- The existing `Burst` component (juice adds a screen flash behind it, not instead of it)
- The existing `Confetti` SVG background in RewardScreen
- All localStorage / state management
- Mobile app screens (Home.jsx, Map.jsx, Me.jsx — juice is web-app-only)

---

## Verification Checklist

1. Correct answer: tile bounces with juiceBounce (not double-animating)
2. Wrong answer: tile shakes with rose glow (does not conflict with React shake state)
3. Streak ≥3: streak badge pops; ≥5 it glows amber
4. Word complete: warm amber screen flash appears briefly behind Burst
5. Reward screen: stars pop in staggered, coin pill spins
6. Pet feed: pet bounces once
7. 3-star boss level: corner amber flashes fire
8. `prefers-reduced-motion: reduce`: all juice animations disabled, game still fully playable
9. No console errors
10. No double sfx (sounds play exactly once per event)
