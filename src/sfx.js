// Tiny WebAudio sound engine. No assets.
// Exposes window.sfx.{tap, success, wrong, star, complete, type}
(function() {
  let ctx = null;
  function c() { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx; }
  let enabled = true;

  function tone(freq, dur = 0.12, type = 'sine', gain = 0.12, when = 0, slideTo = null) {
    if (!enabled) return;
    try {
      const a = c();
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, a.currentTime + when);
      if (slideTo) o.frequency.linearRampToValueAtTime(slideTo, a.currentTime + when + dur);
      g.gain.setValueAtTime(0, a.currentTime + when);
      g.gain.linearRampToValueAtTime(gain, a.currentTime + when + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + when + dur);
      o.connect(g); g.connect(a.destination);
      o.start(a.currentTime + when);
      o.stop(a.currentTime + when + dur + 0.02);
    } catch (e) {}
  }

  window.sfx = {
    setEnabled(v) { enabled = v; },
    isEnabled() { return enabled; },
    tap() { tone(660, 0.06, 'sine', 0.08); },
    type() { tone(880, 0.04, 'square', 0.04); },
    success() {
      tone(660, 0.1, 'sine', 0.14, 0);
      tone(880, 0.12, 'sine', 0.14, 0.08);
      tone(1320, 0.18, 'sine', 0.12, 0.18);
    },
    wrong() { tone(220, 0.18, 'square', 0.08, 0, 140); },
    star() { tone(1600, 0.08, 'triangle', 0.10, 0, 2200); },
    complete() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, 'sine', 0.12, i * 0.09));
    },
    playCorrect() {
      if (!window.sfx.isEnabled()) return;
      try {
        const a = c();
        [660, 880].forEach((freq, i) => {
          const o = a.createOscillator();
          const g = a.createGain();
          o.connect(g); g.connect(a.destination);
          o.type = 'sine'; o.frequency.value = freq;
          const t = a.currentTime + i * 0.08;
          g.gain.setValueAtTime(0.12, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          o.start(t); o.stop(t + 0.13);
        });
        window.cursorFlash && window.cursorFlash('correct');
      } catch(e) {}
    },
    playWrong() {
      if (!window.sfx.isEnabled()) return;
      try {
        const a = c();
        const o = a.createOscillator();
        const g = a.createGain();
        o.connect(g); g.connect(a.destination);
        o.type = 'square';
        o.frequency.setValueAtTime(220, a.currentTime);
        o.frequency.exponentialRampToValueAtTime(140, a.currentTime + 0.15);
        g.gain.setValueAtTime(0.10, a.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.15);
        o.start(); o.stop(a.currentTime + 0.15);
        window.cursorFlash && window.cursorFlash('wrong');
      } catch(e) {}
    },
    playLevelUp() {
      if (!window.sfx.isEnabled()) return;
      try {
        const a = c();
        [523, 659, 784].forEach((freq, i) => {
          const o = a.createOscillator();
          const g = a.createGain();
          o.connect(g); g.connect(a.destination);
          o.type = 'sine'; o.frequency.value = freq;
          const t = a.currentTime + i * 0.12;
          g.gain.setValueAtTime(0.12, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
          o.start(t); o.stop(t + 0.19);
        });
      } catch(e) {}
    },
    playComplete() {
      if (!window.sfx.isEnabled()) return;
      try {
        const a = c();
        [523, 659, 784, 880, 1047].forEach((freq, i) => {
          const o = a.createOscillator();
          const g = a.createGain();
          o.connect(g); g.connect(a.destination);
          o.type = 'sine'; o.frequency.value = freq;
          const t = a.currentTime + i * 0.10;
          g.gain.setValueAtTime(0.12, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.20);
          o.start(t); o.stop(t + 0.21);
        });
      } catch(e) {}
    },
    playDwell(progress) {
      if (!window.sfx.isEnabled()) return;
      try {
        const a = c();
        const freq = 220 + (progress || 0) * 220;
        const o = a.createOscillator();
        const g = a.createGain();
        o.connect(g); g.connect(a.destination);
        o.type = 'sine'; o.frequency.value = freq;
        g.gain.setValueAtTime(0.04, a.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.06);
        o.start(); o.stop(a.currentTime + 0.07);
      } catch(e) {}
    },
  };
})();
