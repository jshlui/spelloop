// Shared UI bits used across screens.

function Star({ filled = false, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M12 2 L14.9 8.6 L22 9.3 L16.6 14 L18.3 21 L12 17.3 L5.7 21 L7.4 14 L2 9.3 L9.1 8.6 Z"
        fill={filled ? 'var(--yellow)' : 'rgba(31,42,68,0.12)'}
        stroke={filled ? 'var(--yellow-ink)' : 'transparent'}
        strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}

function StarRow({ filled = 0, total = 3, size = 22, gap = 4 }) {
  return (
    <div style={{ display: 'flex', gap }}>
      {Array.from({ length: total }).map((_, i) => <Star key={i} filled={i < filled} size={size} />)}
    </div>
  );
}

// Bottom navigation — 3 tabs
function BottomNav({ tab, onTab, inset = 34 }) {
  const items = [
    { id: 'home', label: 'Play', icon: homeIcon },
    { id: 'map', label: 'Map', icon: mapIcon },
    { id: 'me', label: 'Me', icon: meIcon },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      paddingBottom: inset, background: 'var(--surface)',
      borderTop: '1px solid rgba(31,42,68,0.06)',
      display: 'flex', justifyContent: 'space-around',
      paddingTop: 10, zIndex: 40,
    }}>
      {items.map(it => (
        <button key={it.id} onClick={() => { onTab(it.id); window.sfx?.tap(); }} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          padding: '6px 14px', borderRadius: 16,
          color: tab === it.id ? 'var(--blue-ink)' : 'var(--ink-mute)',
          fontFamily: 'inherit', fontWeight: 800, fontSize: 12,
        }}>
          {it.icon(tab === it.id ? 'var(--blue-ink)' : 'var(--ink-mute)')}
          <span>{it.label}</span>
        </button>
      ))}
    </div>
  );
}

function homeIcon(c) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 12 L12 5 L20 12 V20 H14 V15 H10 V20 H4 Z" stroke={c} strokeWidth="2.2" strokeLinejoin="round"/></svg>;
}
function mapIcon(c) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 6 L9 4 L15 6 L21 4 V18 L15 20 L9 18 L3 20 Z M9 4 V18 M15 6 V20" stroke={c} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/></svg>;
}
function meIcon(c) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={c} strokeWidth="2.2"/><path d="M4 20 C4 15 8 14 12 14 C16 14 20 15 20 20" stroke={c} strokeWidth="2.2" strokeLinecap="round"/></svg>;
}

// Mode badge
function ModeBadge({ mode }) {
  const m = MODE_META[mode] || MODE_META.click;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999,
      background: m.soft, color: m.ink, fontWeight: 800, fontSize: 12,
    }}>
      <span style={{ fontSize: 14 }}>{m.icon}</span>{m.label}
    </div>
  );
}

// Confetti / star burst (pure SVG on success)
function Burst({ show, onDone }) {
  React.useEffect(() => {
    if (show && onDone) { const t = setTimeout(onDone, 1200); return () => clearTimeout(t); }
  }, [show]);
  if (!show) return null;
  const bits = [];
  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * Math.PI * 2;
    const dist = 80 + Math.random() * 40;
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;
    const colors = ['#FFD166', '#FF9ECD', '#8EE3C3', '#6C8EFF', '#FFA07A', '#C7B4FF'];
    bits.push(
      <div key={i} style={{
        position: 'absolute', left: '50%', top: '50%',
        width: 10, height: 10, borderRadius: 2,
        background: colors[i % colors.length],
        transform: `translate(${x}px, ${y}px) rotate(${Math.random() * 360}deg)`,
        opacity: 0,
        animation: `burst${i} 900ms ease-out forwards`,
      }} />
    );
  }
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      zIndex: 100, overflow: 'hidden',
    }}>
      <style>{`
        ${Array.from({length: 18}).map((_, i) => {
          const angle = (i / 18) * Math.PI * 2;
          const dist = 80 + Math.random() * 40;
          const x = Math.cos(angle) * dist;
          const y = Math.sin(angle) * dist;
          return `@keyframes burst${i} { from { transform: translate(0,0) scale(0); opacity: 1; } to { transform: translate(${x}px, ${y}px) scale(1) rotate(${Math.random()*360}deg); opacity: 0; } }`;
        }).join('\n')}
      `}</style>
      {bits}
    </div>
  );
}

// Kid-friendly primary button with depressed feel
function BigButton({ children, onClick, color = 'blue', style = {} }) {
  const bg = color === 'blue' ? 'var(--blue)'
    : color === 'mint' ? 'var(--mint)'
    : color === 'coral' ? 'var(--coral)'
    : color === 'pink' ? 'var(--pink)'
    : color === 'yellow' ? 'var(--yellow)' : 'var(--blue)';
  const text = color === 'mint' ? '#0f5c42' : color === 'yellow' ? 'var(--yellow-ink)' : 'white';
  return (
    <button onClick={() => { window.sfx?.tap(); onClick && onClick(); }} style={{
      background: bg, color: text, border: 'none', cursor: 'pointer',
      padding: '16px 28px', fontWeight: 900, fontSize: 'var(--fs-lg)',
      borderRadius: 999, fontFamily: 'inherit', letterSpacing: '-0.01em',
      boxShadow: '0 4px 0 rgba(31,42,68,0.12)',
      transition: 'transform 80ms',
      ...style,
    }}
    onMouseDown={e => e.currentTarget.style.transform = 'translateY(2px)'}
    onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >{children}</button>
  );
}

// Speak button — Australian accent, clear and slow
function SpeakButton({ word, size = 56, big = false }) {
  const [playing, setPlaying] = React.useState(false);
  function speak() {
    setPlaying(true);
    window.sfx?.tap();
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(word.toLowerCase());
        u.lang = 'en-AU';
        u.rate = 0.72;
        u.pitch = 1.05;
        u.volume = 1;
        const voices = window.speechSynthesis.getVoices();
        const auVoice = voices.find(function(v) { return v.lang === 'en-AU'; })
          || voices.find(function(v) { return v.lang.startsWith('en-AU'); })
          || voices.find(function(v) { return v.lang.startsWith('en-GB'); })
          || null;
        if (auVoice) u.voice = auVoice;
        window.speechSynthesis.speak(u);
      }
    } catch (e) {}
    setTimeout(() => setPlaying(false), 1400);
  }
  const s = big ? 88 : size;
  return (
    <button onClick={speak} style={{
      width: s, height: s, borderRadius: '50%',
      background: 'var(--blue)', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: 'var(--shadow-pop)',
      position: 'relative',
    }}>
      <svg width={s * 0.45} height={s * 0.45} viewBox="0 0 24 24" fill="white">
        <path d="M3 9v6h4l5 5V4L7 9H3z"/>
        <path d="M15 8 Q18 12 15 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M18 5 Q23 12 18 19" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity={playing ? 1 : 0.5}/>
      </svg>
      {playing && <div style={{
        position: 'absolute', inset: -8, borderRadius: '50%',
        border: '3px solid var(--blue)', opacity: 0.6,
        animation: 'ping 900ms ease-out',
      }}/>}
      <style>{`@keyframes ping { from { transform: scale(1); opacity: 0.6 } to { transform: scale(1.4); opacity: 0 } }`}</style>
    </button>
  );
}

function LevelTransition({ level, color, onDone }) {
  React.useEffect(function() {
    var t = setTimeout(onDone, 600);
    return function() { clearTimeout(t); };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: color || 'var(--blue, #6C8EFF)',
      zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'levelFlash 600ms ease both',
      pointerEvents: 'none',
    }}>
      <span style={{
        fontSize: 'clamp(40px, 8vw, 64px)',
        fontWeight: 900, color: '#fff', fontFamily: 'inherit',
        animation: 'pop 400ms 100ms cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        Level {level}!
      </span>
    </div>
  );
}

function StreakBadge() {
  const ctx = React.useContext(window.GameContext);
  const streak = ctx ? ctx.streak : 0;
  const [visible, setVisible] = React.useState(false);
  const prevStreakRef = React.useRef(0);

  React.useEffect(function() {
    if (streak >= 3 && streak !== prevStreakRef.current) {
      setVisible(true);
      var t = setTimeout(function() { setVisible(false); }, 1800);
      prevStreakRef.current = streak;
      return function() { clearTimeout(t); };
    }
    prevStreakRef.current = streak;
  }, [streak]);

  if (!visible || streak < 3) return null;

  var label = streak >= 5 ? ('⚡ ' + streak + ' streak!') : ('🔥 ' + streak + ' in a row!');
  var bg = streak >= 5 ? 'var(--yellow, #FFD166)' : 'var(--coral, #FFA07A)';

  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 300,
      background: bg, color: '#fff',
      borderRadius: '999px',
      padding: '10px 20px',
      fontWeight: 800, fontSize: 18, fontFamily: 'inherit',
      boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
      animation: 'streakIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
      pointerEvents: 'none',
    }}>
      {label}
    </div>
  );
}

function Confetti() {
  var PALETTE = ['#6C8EFF','#FFD166','#FF9ECD','#8EE3C3','#FFA07A','#C7B4FF'];
  var count = 20;

  React.useEffect(function() {
    var container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:500;overflow:hidden;';
    document.body.appendChild(container);

    for (var i = 0; i < count; i++) {
      var el = document.createElement('div');
      var size = 8 + Math.random() * 6;
      var angle = Math.random() * 360;
      var tx = (Math.random() - 0.5) * window.innerWidth * 0.9;
      var ty = (Math.random() - 0.5) * window.innerHeight * 0.9;
      var color = PALETTE[i % PALETTE.length];
      el.style.cssText = [
        'position:absolute', 'left:50%', 'top:50%',
        'width:' + size + 'px', 'height:' + size + 'px',
        'background:' + color, 'border-radius:2px',
        'animation:confettiFly' + (i % 5) + ' 1.4s ease-out both',
        '--tx:' + tx + 'px', '--ty:' + ty + 'px', '--rot:' + angle + 'deg',
      ].join(';');
      container.appendChild(el);
    }

    var t = setTimeout(function() {
      if (container.parentNode) document.body.removeChild(container);
    }, 1500);

    return function() {
      clearTimeout(t);
      if (container.parentNode) document.body.removeChild(container);
    };
  }, []);

  return null;
}

Object.assign(window, { Star, StarRow, BottomNav, ModeBadge, Burst, BigButton, SpeakButton, LevelTransition, StreakBadge, Confetti });
