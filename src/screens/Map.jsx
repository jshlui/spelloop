// Progression map — winding path of level dots.

function MapScreen({ onPlayLevel }) {
  const scrollRef = React.useRef(null);
  // positions laid out manually on a winding path
  // We'll draw a wavy SVG background spanning all levels.
  const levels = LEVELS;

  // path points (normalized to a 320x1100 space for this scrollable column)
  const pts = [
    {x: 70,  y: 940},
    {x: 210, y: 860},
    {x: 90,  y: 760},
    {x: 220, y: 650},
    {x: 80,  y: 540},
    {x: 210, y: 430},
    {x: 90,  y: 320},
    {x: 200, y: 180},
  ];

  // build smooth path through points
  function buildPath(points) {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]; const p1 = points[i+1];
      const mx = (p0.x + p1.x)/2;
      d += ` Q ${p0.x} ${(p0.y+p1.y)/2}, ${mx} ${(p0.y+p1.y)/2} T ${p1.x} ${p1.y}`;
    }
    return d;
  }
  const d = buildPath(pts);

  return (
    <div ref={scrollRef} style={{
      height: '100%', overflow: 'auto',
      background: 'linear-gradient(180deg, #E3EAFF 0%, #FFF6EA 50%, #D7F5E8 100%)',
    }} className="noscroll">
      {/* top card */}
      <div style={{ padding: '70px 20px 12px', position: 'sticky', top: 0, zIndex: 5,
        background: 'linear-gradient(180deg, #E3EAFF, rgba(227,234,255,0))',
      }}>
        <div style={{ fontSize: 12, color: 'var(--blue-ink)', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>Chapter 1</div>
        <div style={{ fontSize: 'var(--fs-2xl)', fontWeight: 900, lineHeight: 1 }}>The Word Forest</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
          <div className="progress-track" style={{ flex: 1 }}>
            <div className="progress-fill" style={{ width: '37%' }}/>
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--blue-ink)' }}>3/8</span>
        </div>
      </div>

      {/* path + nodes */}
      <div style={{ position: 'relative', width: 320, margin: '0 auto', height: 1020, paddingBottom: 120 }}>
        <svg width="320" height="1020" viewBox="0 0 320 1020" style={{ position: 'absolute', inset: 0 }}>
          <path d={d} stroke="#FFFFFF" strokeWidth="18" fill="none" strokeLinecap="round" opacity="0.9"/>
          <path d={d} stroke="rgba(31,42,68,0.1)" strokeWidth="18" fill="none" strokeLinecap="round" strokeDasharray="2 14"/>
          {/* decorative trees */}
          <g opacity="0.6">
            <circle cx="30" cy="240" r="18" fill="#8EE3C3"/>
            <rect x="26" y="252" width="8" height="14" fill="#8B5A3C"/>
            <circle cx="280" cy="500" r="22" fill="#6C8EFF" opacity="0.5"/>
            <circle cx="40" cy="620" r="16" fill="#FF9ECD" opacity="0.7"/>
            <circle cx="270" cy="780" r="20" fill="#FFD166" opacity="0.7"/>
            <circle cx="30" cy="440" r="14" fill="#C7B4FF" opacity="0.7"/>
          </g>
        </svg>
        {levels.map((lv, i) => (
          <LevelNode key={lv.id} level={lv} x={pts[i].x} y={pts[i].y} onPlay={() => onPlayLevel(lv)} />
        ))}
      </div>
    </div>
  );
}

function LevelNode({ level, x, y, onPlay }) {
  const m = MODE_META[level.mode];
  const isCurrent = level.current;
  const isDone = level.done;
  const isLocked = level.locked;

  const bg = isLocked ? 'var(--ink-mute)'
    : isDone ? 'var(--success)'
    : `var(--${m.color})`;

  return (
    <div style={{
      position: 'absolute', left: x - 40, top: y - 40,
      width: 80, display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      {isCurrent && (
        <div style={{
          position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
          background: 'white', color: 'var(--ink)', padding: '6px 10px',
          fontWeight: 900, fontSize: 12, borderRadius: 999,
          boxShadow: 'var(--shadow-soft)', whiteSpace: 'nowrap',
          animation: 'floatUp 600ms ease',
        }}>▶ You are here</div>
      )}
      <button onClick={isLocked ? null : onPlay} style={{
        width: 72, height: 72, borderRadius: '50%', border: 'none',
        background: bg, cursor: isLocked ? 'default' : 'pointer',
        boxShadow: '0 4px 0 rgba(31,42,68,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontSize: 28, fontWeight: 900,
        position: 'relative',
        ...(isCurrent ? { outline: '4px solid white', outlineOffset: 2 } : {}),
      }}>
        {isLocked ? '🔒' : isDone ? '✓' : (level.mode === 'boss' ? '★' : m.icon)}
        {isCurrent && <div style={{
          position: 'absolute', inset: -8, borderRadius: '50%',
          border: '3px solid white', opacity: 0.7,
          animation: 'pulsePing 1.6s infinite',
        }}/>}
      </button>
      <div style={{ marginTop: 4, fontWeight: 900, fontSize: 12, color: isLocked ? 'var(--ink-mute)' : 'var(--ink)' }}>
        {isLocked ? `Level ${level.id}` : level.word}
      </div>
      {isDone && <StarRow filled={level.stars} size={12} gap={2} />}
      <style>{`@keyframes pulsePing { 0%{transform:scale(1);opacity:0.7} 80%{transform:scale(1.4);opacity:0} 100%{opacity:0} }`}</style>
    </div>
  );
}

Object.assign(window, { MapScreen });
