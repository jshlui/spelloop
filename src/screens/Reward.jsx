// Reward screen after level completion.

function RewardScreen({ word, stars, onNext, onHome }) {
  const [animIn, setAnimIn] = React.useState(false);
  const [showConfetti, setShowConfetti] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setAnimIn(true), 100);
    // cascade star sounds
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
      background: 'linear-gradient(180deg, #FFF2CE 0%, #FFE0EF 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '60px 24px 40px', zIndex: 200, overflow: 'hidden',
    }}>
      {showConfetti && <Confetti />}
      {/* confetti bg */}
      <svg width="100%" height="100%" viewBox="0 0 400 800" style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.3 }}>
        {Array.from({length: 24}).map((_, i) => {
          const cs = ['#FFD166', '#FF9ECD', '#8EE3C3', '#6C8EFF', '#FFA07A', '#C7B4FF'];
          return <rect key={i} x={Math.random()*400} y={Math.random()*800} width="8" height="14" rx="2" fill={cs[i % cs.length]} transform={`rotate(${Math.random()*360} ${Math.random()*400} ${Math.random()*800})`}/>;
        })}
      </svg>

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{
          fontSize: 14, color: 'var(--coral-ink)', fontWeight: 900,
          letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8,
          opacity: animIn ? 1 : 0, transition: 'opacity 400ms',
        }}>Level complete</div>
        <div style={{
          fontSize: 48, fontWeight: 900, lineHeight: 1, marginBottom: 8,
          transform: animIn ? 'scale(1)' : 'scale(0.5)',
          transition: 'transform 500ms cubic-bezier(.34,1.56,.64,1)',
        }}>You did it!</div>
        <div style={{ fontSize: 20, color: 'var(--ink-soft)', fontWeight: 700, marginBottom: 28 }}>
          You spelled <span style={{ color: 'var(--blue-ink)', fontWeight: 900 }}>{word}</span>
        </div>

        {/* stars */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              transform: animIn && i < stars ? 'scale(1) rotate(0)' : 'scale(0) rotate(-180deg)',
              transition: `transform 500ms cubic-bezier(.34,1.56,.64,1) ${i * 180 + 200}ms`,
            }}>
              <Star filled={i < stars} size={60}/>
            </div>
          ))}
        </div>

        {/* reward: coin / badge */}
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: '16px 20px',
          display: 'inline-flex', alignItems: 'center', gap: 12,
          boxShadow: 'var(--shadow-pop)', marginBottom: 32,
          opacity: animIn ? 1 : 0, transform: animIn ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 500ms 800ms, transform 500ms 800ms',
        }}>
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="#FFD166" stroke="#C8942A" strokeWidth="2"/>
            <text x="20" y="26" textAnchor="middle" fontSize="18" fontWeight="900" fill="#7A5B0A" fontFamily="system-ui">+5</text>
          </svg>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 16, fontWeight: 900 }}>+5 coins</div>
            <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 700 }}>Save them for sticker packs</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <BigButton onClick={onHome} color="yellow" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>Map</BigButton>
          <BigButton onClick={onNext} color="coral">Next level ▶</BigButton>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RewardScreen });
