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
