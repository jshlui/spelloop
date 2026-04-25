(function () {
  const CURSOR_SIZE = 44;
  const TRAIL_COUNT = 4;
  const TRAIL_SHRINK = 8;
  const TRAIL_ALPHA_STEP = 0.15;

  const positions = Array.from({ length: TRAIL_COUNT + 1 }, () => ({ x: -200, y: -200 }));
  let targetX = -200, targetY = -200;
  let rafId = null;

  const cursorRoot = document.createElement('div');
  cursorRoot.id = 'cursor-root';
  document.body.appendChild(cursorRoot);

  function createDot(size, opacity, zIndex) {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed; pointer-events:none; border-radius:50%; z-index:${zIndex};
      width:${size}px; height:${size}px;
      background:rgba(108,142,255,${opacity});
      transform:translate(-50%,-50%);
      transition:background 0.1s, transform 0.1s;
      will-change:transform;
    `;
    cursorRoot.appendChild(el);
    return el;
  }

  const dots = [createDot(CURSOR_SIZE, 0.6, 9999)];
  for (let i = 1; i <= TRAIL_COUNT; i++) {
    const size = CURSOR_SIZE - i * TRAIL_SHRINK;
    const alpha = 0.6 - i * TRAIL_ALPHA_STEP;
    dots.push(createDot(Math.max(size, 8), Math.max(alpha, 0.05), 9998 - i));
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    positions[0].x = lerp(positions[0].x, targetX, 0.25);
    positions[0].y = lerp(positions[0].y, targetY, 0.25);
    for (let i = 1; i <= TRAIL_COUNT; i++) {
      positions[i].x = lerp(positions[i].x, positions[i - 1].x, 0.35);
      positions[i].y = lerp(positions[i].y, positions[i - 1].y, 0.35);
    }
    for (let i = 0; i <= TRAIL_COUNT; i++) {
      dots[i].style.left = positions[i].x + 'px';
      dots[i].style.top = positions[i].y + 'px';
    }
    rafId = requestAnimationFrame(tick);
  }

  document.addEventListener('mousemove', e => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!rafId) tick();
  });

  // Feedback API
  let flashTimer = null;
  window.cursorFlash = function (type) {
    if (flashTimer) clearTimeout(flashTimer);
    const dot = dots[0];
    const color = type === 'correct' ? 'rgba(48,194,133,0.85)' : 'rgba(240,113,113,0.85)';
    const scale = type === 'correct' ? 'scale(1.4)' : 'scale(1)';
    dot.style.background = color;
    dot.style.transform = `translate(-50%,-50%) ${scale}`;
    if (type === 'wrong') {
      dot.classList.add('cursor-shake');
      setTimeout(() => dot.classList.remove('cursor-shake'), 200);
    }
    flashTimer = setTimeout(() => {
      dot.style.background = 'rgba(108,142,255,0.6)';
      dot.style.transform = 'translate(-50%,-50%) scale(1)';
      flashTimer = null;
    }, 200);
  };

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    dots.forEach(d => (d.style.display = 'none'));
    document.body.style.cursor = '';
  }
})();
