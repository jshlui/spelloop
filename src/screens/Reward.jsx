// Reward screen after level completion.

function SessionReport({ onClose }) {
  var ctx = React.useContext(window.GameContext);
  var correctClicks = ctx ? ctx.correctClicks : 0;
  var totalClicks = ctx ? ctx.totalClicks : 0;
  var taskHistory = ctx ? ctx.taskHistory : [];
  var accuracy = ctx ? ctx.accuracy : 1;

  var withMs = taskHistory.filter(function(t) { return t.ms > 0; });
  var correctWithMs = taskHistory.filter(function(t) { return t.correct && t.ms > 0; });
  var avgMs = withMs.length > 0 ? withMs.reduce(function(s, t) { return s + t.ms; }, 0) / withMs.length : 0;
  var fastestMs = correctWithMs.length > 0 ? Math.min.apply(null, correctWithMs.map(function(t) { return t.ms; })) : 0;
  var totalComplete = taskHistory.filter(function(t) { return t.type === 'complete'; }).length;

  var modes = ['click', 'drag', 'type', 'missing', 'keyboard', 'precision'];
  var modeStats = modes.map(function(m) {
    var mTasks = taskHistory.filter(function(t) { return t.mode === m; });
    var mCorrect = mTasks.filter(function(t) { return t.correct; }).length;
    return { mode: m, total: mTasks.length, correct: mCorrect, pct: mTasks.length ? Math.round(mCorrect / mTasks.length * 100) : null };
  }).filter(function(m) { return m.total > 0; });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(31,42,68,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={function(e) { e.stopPropagation(); }} style={{
        background: '#fff', borderRadius: 32, padding: 36,
        maxWidth: 520, width: '90vw', maxHeight: '85vh', overflowY: 'auto',
        position: 'relative', boxShadow: '0 16px 48px rgba(0,0,0,0.20)',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 20, right: 20,
          background: 'none', border: 'none', fontSize: 24, cursor: 'pointer',
          color: 'var(--ink-soft, #4B587A)', lineHeight: 1,
        }}>✕</button>

        <h2 style={{ margin: '0 0 24px', fontSize: 26, fontWeight: 900, color: 'var(--ink, #1F2A44)', fontFamily: 'inherit' }}>
          📊 Session Report
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Tasks done', value: String(totalComplete) },
            { label: 'Accuracy', value: Math.round(accuracy * 100) + '%' },
            { label: 'Avg time/click', value: avgMs > 0 ? (avgMs / 1000).toFixed(1) + 's' : '—' },
            { label: 'Fastest click', value: fastestMs > 0 ? fastestMs + 'ms' : '—' },
          ].map(function(item) {
            return React.createElement('div', {
              key: item.label,
              style: { background: 'var(--bg)', borderRadius: 18, padding: '16px 20px' },
            },
              React.createElement('div', { style: { fontSize: 13, color: 'var(--ink-mute, #7C89A8)', marginBottom: 4, fontWeight: 700, fontFamily: 'inherit' } }, item.label),
              React.createElement('div', { style: { fontSize: 28, fontWeight: 900, color: 'var(--ink, #1F2A44)', fontFamily: 'inherit' } }, item.value)
            );
          })}
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 14px', color: 'var(--ink, #1F2A44)', fontFamily: 'inherit' }}>Mode Accuracy</h3>
        {modeStats.length === 0 && (
          <p style={{ color: 'var(--ink-mute, #7C89A8)', fontSize: 14, fontFamily: 'inherit' }}>No data yet — play some rounds first!</p>
        )}
        {modeStats.map(function(s) {
          var barColor = s.pct >= 80 ? 'var(--mint, #8EE3C3)' : s.pct >= 50 ? 'var(--blue, #6C8EFF)' : 'var(--coral, #FFA07A)';
          return (
            <div key={s.mode} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: 'var(--ink, #1F2A44)', marginBottom: 4, fontFamily: 'inherit' }}>
                <span style={{ textTransform: 'capitalize' }}>{s.mode}</span>
                <span>{s.pct}%</span>
              </div>
              <div style={{ height: 12, background: 'var(--alpha-sm)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: s.pct + '%', background: barColor, borderRadius: 6, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

var CONFETTI_BG = React.createElement('svg', {
  width: '100%', height: '100%', viewBox: '0 0 400 800',
  style: { position: 'absolute', inset: 0, zIndex: 0, opacity: 0.3 },
}, Array.from({ length: 24 }).map(function(_, i) {
  var cs = ['var(--yellow)', 'var(--pink)', 'var(--mint)', 'var(--blue)', 'var(--coral)', 'var(--lilac)'];
  var x = ((i * 173) % 400).toFixed(0);
  var y = ((i * 97 + 37) % 800).toFixed(0);
  var rot = ((i * 47) % 360).toFixed(0);
  return React.createElement('rect', { key: i, x: x, y: y, width: 8, height: 14, rx: 2, fill: cs[i % cs.length], transform: 'rotate(' + rot + ' ' + x + ' ' + y + ')' });
}));

function RewardScreen({ word, stars, coins, onNext, onHome }) {
  coins = coins != null ? coins : (stars === 3 ? 15 : stars === 2 ? 10 : 5);
  const [animIn, setAnimIn] = React.useState(false);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [showReport, setShowReport] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setAnimIn(true), 100);
    [0, 300, 600].forEach((d, i) => { if (i < stars) setTimeout(() => window.sfx?.star(), d + 200); });
    return () => clearTimeout(t);
  }, []);
  React.useEffect(function() {
    var t = setTimeout(function() { setShowConfetti(true); }, 200);
    return function() { clearTimeout(t); };
  }, []);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, var(--yellow-soft) 0%, var(--pink-soft) 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '60px 24px 40px', zIndex: 200, overflow: 'hidden',
    }}>
      {showConfetti && <Confetti />}
      {CONFETTI_BG}

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{
          fontSize: 14, color: 'var(--coral-ink)', fontWeight: 900,
          letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8,
          opacity: animIn ? 1 : 0, transition: 'opacity 400ms',
        }}>Level complete</div>
        <div style={{
          fontSize: 48, fontWeight: 900, lineHeight: 1, marginBottom: 8,
          transform: animIn ? 'scale(1)' : 'scale(0.5)',
          transition: 'transform 500ms cubic-bezier(.34,1.1,.64,1)',
        }}>You did it!</div>
        <div style={{ fontSize: 20, color: 'var(--ink-soft)', fontWeight: 700, marginBottom: 28 }}>
          You spelled <span style={{ color: 'var(--blue-ink)', fontWeight: 900 }}>{word}</span>
        </div>

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

        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: '16px 20px',
          display: 'inline-flex', alignItems: 'center', gap: 12,
          boxShadow: 'var(--shadow-pop)', marginBottom: 32,
          opacity: animIn ? 1 : 0, transform: animIn ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 500ms 800ms, transform 500ms 800ms',
        }}>
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="var(--yellow)" stroke="var(--yellow-ink)" strokeWidth="2"/>
            <text x="20" y="26" textAnchor="middle" fontSize="18" fontWeight="900" fill="var(--yellow-ink)" fontFamily="system-ui">+{coins}</text>
          </svg>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 16, fontWeight: 900 }}>+{coins} coins</div>
            <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 700 }}>Save them for sticker packs</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          <BigButton onClick={onHome} color="yellow" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>Map</BigButton>
          <BigButton onClick={onNext} color="coral">Next level ▶</BigButton>
          <button onClick={() => setShowReport(true)} style={{
            background: 'transparent', color: 'var(--ink-soft)', border: '2px solid var(--ink-soft)',
            borderRadius: 999, padding: '14px 20px', fontWeight: 800, fontSize: 'var(--fs-md)',
            cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
          }}>📊 Report</button>
        </div>
      </div>

      {showReport && <SessionReport onClose={() => setShowReport(false)} />}
    </div>
  );
}

Object.assign(window, { RewardScreen });
