// Tiny WebAudio-based tap/success chimes (no assets)
(function () {
  let ctx = null;
  function ac() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { ctx = null; }
    }
    return ctx;
  }
  function tone(freq, dur, type = 'sine', vol = 0.12) {
    const a = ac(); if (!a || window.__muted) return;
    const now = a.currentTime;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain).connect(a.destination);
    osc.start(now); osc.stop(now + dur + 0.02);
  }
  window.Sounds = {
    tap: () => tone(520, 0.08, 'triangle', 0.08),
    good: () => { tone(660, 0.1, 'sine', 0.1); setTimeout(() => tone(880, 0.12, 'sine', 0.1), 70); },
    bad: () => tone(180, 0.18, 'square', 0.06),
    win: () => {
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.18, 'triangle', 0.1), i * 90));
    },
    star: () => tone(1200, 0.12, 'sine', 0.08),
    toggleMute: () => { window.__muted = !window.__muted; return !!window.__muted; },
  };
})();
