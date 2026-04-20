// Web versions of Map, Me, Game shell, Reward — landscape/desktop layouts.

// ─── MAP ────────────────────────────────────────────────
function WebMap({ levels, onPlayLevel }) {
  levels = levels || LEVELS;
  // horizontal-ish winding path for landscape
  const pts = [
    { x: 90,  y: 360 },
    { x: 220, y: 280 },
    { x: 350, y: 380 },
    { x: 480, y: 240 },
    { x: 620, y: 360 },
    { x: 770, y: 260 },
    { x: 910, y: 380 },
    { x: 1050, y: 240 },
  ];
  function buildPath(points) {
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]; const p1 = points[i+1];
      const mx = (p0.x + p1.x) / 2;
      d += ` Q ${mx} ${p0.y}, ${mx} ${(p0.y + p1.y)/2} T ${p1.x} ${p1.y}`;
    }
    return d;
  }
  const d = buildPath(pts);

  return (
    <div style={{ padding: '32px 40px 48px', background: 'linear-gradient(180deg, #E3EAFF 0%, #FFF6EA 60%, #D7F5E8 100%)', minHeight: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--blue-ink)', fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase' }}>Chapter 1 · The Word Forest</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Your journey</h1>
          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--blue-ink)' }}>{levels.filter(function(l){return l.done;}).length} / {levels.length} levels</span>
        </div>
        <div className="progress-track" style={{ maxWidth: 480, marginTop: 8 }}>
          <div className="progress-fill" style={{ width: `${Math.round(levels.filter(function(l){return l.done;}).length / levels.length * 100)}%` }}/>
        </div>
      </div>

      <div style={{ position: 'relative', background: 'var(--surface)', borderRadius: 24, padding: 20, boxShadow: 'var(--shadow-soft)', overflow: 'hidden' }}>
        <svg width="100%" height="480" viewBox="0 0 1140 480" style={{ display: 'block' }}>
          <defs>
            <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="rgba(31,42,68,0.08)"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)"/>
          {/* decorative */}
          <g opacity="0.5">
            <circle cx="160" cy="140" r="28" fill="#8EE3C3"/>
            <rect x="152" y="164" width="16" height="22" fill="#8B5A3C"/>
            <circle cx="540" cy="130" r="22" fill="#FF9ECD"/>
            <circle cx="860" cy="140" r="26" fill="#FFD166"/>
            <circle cx="300" cy="100" r="14" fill="#C7B4FF"/>
            <circle cx="720" cy="420" r="20" fill="#6C8EFF" opacity="0.5"/>
          </g>
          <path d={d} stroke="#FFFFFF" strokeWidth="18" fill="none" strokeLinecap="round"/>
          <path d={d} stroke="rgba(31,42,68,0.08)" strokeWidth="18" fill="none" strokeLinecap="round" strokeDasharray="2 14"/>
          {levels.map((lv, i) => (
            <g key={lv.id} transform={`translate(${pts[i].x}, ${pts[i].y})`} style={{ cursor: lv.locked ? 'default' : 'pointer' }} onClick={() => !lv.locked && onPlayLevel(lv)}>
              <WebLevelNode level={lv}/>
            </g>
          ))}
        </svg>
      </div>

      {/* level legend */}
      <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {['click', 'drag', 'type', 'missing', 'keyboard', 'boss'].map(m => (
          <div key={m} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface)', padding: '8px 14px', borderRadius: 999,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: `var(--${MODE_META[m].color})`, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 12,
            }}>{MODE_META[m].icon}</div>
            <span style={{ fontSize: 13, fontWeight: 800 }}>{MODE_META[m].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WebLevelNode({ level }) {
  const m = MODE_META[level.mode];
  const isDone = level.done, isCurrent = level.current, isLocked = level.locked;
  const bg = isLocked ? '#A7B1C6' : isDone ? '#30C285' : `var(--${m.color})`;
  const cssBg = isLocked ? '#A7B1C6' : isDone ? '#30C285'
    : m.color === 'blue' ? '#6C8EFF' : m.color === 'pink' ? '#FF9ECD'
    : m.color === 'mint' ? '#8EE3C3' : m.color === 'coral' ? '#FFA07A'
    : m.color === 'lilac' ? '#C7B4FF' : '#FFD166';
  return (
    <>
      {isCurrent && (
        <g>
          <rect x="-50" y="-80" width="100" height="24" rx="12" fill="white"/>
          <text x="0" y="-64" textAnchor="middle" fontSize="11" fontWeight="900" fill="#1F2A44" fontFamily="Nunito, system-ui">▶ YOU ARE HERE</text>
          <circle r="46" fill="none" stroke="white" strokeWidth="3" opacity="0.7">
            <animate attributeName="r" from="36" to="52" dur="1.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.7" to="0" dur="1.5s" repeatCount="indefinite"/>
          </circle>
        </g>
      )}
      <circle r="36" fill={cssBg} stroke={isCurrent ? 'white' : 'transparent'} strokeWidth="4"/>
      <text x="0" y="8" textAnchor="middle" fontSize={isLocked ? 22 : 26} fontWeight="900" fill="white" fontFamily="Nunito, system-ui">
        {isLocked ? '🔒' : isDone ? '✓' : m.icon}
      </text>
      <text x="0" y="58" textAnchor="middle" fontSize="14" fontWeight="900" fill="#1F2A44" fontFamily="Nunito, system-ui">
        {isLocked ? `Level ${level.id}` : level.word}
      </text>
      {isDone && (
        <g transform="translate(-15, 66)">
          {[0,1,2].map(i => (
            <path key={i} transform={`translate(${i*11}, 0) scale(0.5)`}
              d="M 6 0 L 7.5 3.5 L 11 4 L 8.5 6.5 L 9 10 L 6 8 L 3 10 L 3.5 6.5 L 1 4 L 4.5 3.5 Z"
              fill={i < level.stars ? '#FFD166' : 'rgba(31,42,68,0.15)'}
              stroke={i < level.stars ? '#C8942A' : 'none'} strokeWidth="0.5"/>
          ))}
        </g>
      )}
    </>
  );
}

// ─── ME ────────────────────────────────────────────────
function WebMe({ profile, onOpenParent }) {
  const avatarStyle = window.__tweaks?.avatarStyle || 'animal';
  const badges = [
    { id: 'streak3', name: '3-day streak', unlocked: true, icon: '🔥' },
    { id: 'firstword', name: 'First word', unlocked: true, icon: '📝' },
    { id: 'spell5', name: '5 spellings', unlocked: true, icon: '✏️' },
    { id: 'perfect', name: 'Perfect run', unlocked: false, icon: '⭐' },
    { id: 'speed', name: 'Speed champ', unlocked: false, icon: '⚡' },
    { id: 'ch1', name: 'Ch. 1 king', unlocked: false, icon: '👑' },
    { id: 'marathon', name: 'Marathon', unlocked: false, icon: '🏃' },
    { id: 'earlybird', name: 'Early bird', unlocked: false, icon: '🌅' },
  ];
  return (
    <div style={{ padding: '32px 40px 48px', background: 'linear-gradient(180deg, #EDE4FF 0%, var(--bg) 300px)', minHeight: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
        {/* left — avatar panel */}
        <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
          <div style={{ display: 'inline-block', position: 'relative' }}>
            <Avatar id={profile.avatar} size={140} style={avatarStyle}/>
            <div style={{
              position: 'absolute', bottom: 4, right: -6,
              background: 'var(--coral)', color: 'white', fontWeight: 900,
              fontSize: 14, padding: '4px 12px', borderRadius: 999,
              boxShadow: 'var(--shadow-tile)',
            }}>Lv {profile.level}</div>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, margin: '14px 0 4px', letterSpacing: '-0.02em' }}>{profile.name}</h2>
          <div style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 700, marginBottom: 18 }}>Age {profile.age} · Started Apr 12</div>
          <button style={{
            background: 'var(--lilac-soft)', color: 'var(--lilac-ink)',
            border: 'none', padding: '10px 18px', borderRadius: 999,
            fontWeight: 900, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          }}>Change avatar</button>
        </div>

        {/* right — XP + badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* XP */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>XP this week</h3>
              <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--blue-ink)' }}>240 / 500</div>
            </div>
            <div className="progress-track" style={{ height: 14 }}>
              <div className="progress-fill" style={{ width: '48%' }}/>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <WebStat icon="🔥" value={profile.streak} label="day streak" bg="var(--coral-soft)"/>
              <WebStat icon="⭐" value={profile.totalStars} label="stars" bg="var(--yellow-soft)"/>
              <WebStat icon="📚" value={profile.words} label="words" bg="var(--mint-soft)"/>
              <WebStat icon="🎯" value="86%" label="accuracy" bg="var(--blue-soft)"/>
            </div>
          </div>

          {/* badges */}
          <div className="card">
            <h3 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 14px' }}>Badges</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {badges.map(b => (
                <div key={b.id} style={{
                  background: b.unlocked ? 'var(--yellow-soft)' : 'var(--bg)',
                  borderRadius: 14, padding: 14,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  opacity: b.unlocked ? 1 : 0.4, filter: b.unlocked ? 'none' : 'grayscale(1)',
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: b.unlocked ? 'var(--yellow)' : 'rgba(31,42,68,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                    boxShadow: b.unlocked ? 'var(--shadow-soft)' : 'none',
                  }}>{b.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, textAlign: 'center', lineHeight: 1.2 }}>{b.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* parent link */}
          <button onClick={onOpenParent} className="card" style={{
            border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: 'var(--blue-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="var(--blue-ink)" strokeWidth="2.2"/><path d="M4 20c0-5 4-6 8-6s8 1 8 6" stroke="var(--blue-ink)" strokeWidth="2.2" strokeLinecap="round"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 15 }}>Parent area</div>
              <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 700 }}>Reports, settings, screen time</div>
            </div>
            <svg width="10" height="16" viewBox="0 0 10 16"><path d="M1 1l8 7-8 7" stroke="var(--ink-mute)" strokeWidth="2.4" fill="none" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── GAME (desktop framed) ─────────────────────────────
function WebGame({ mode, word, onClose, onDone }) {
  // Wrap the existing mobile games in a centered "play card"
  const GameComp = mode === 'click' ? ClickGame
    : mode === 'drag' ? DragGame
    : mode === 'type' ? TypeGame
    : mode === 'missing' ? MissingGame
    : mode === 'keyboard' ? KeyboardGame
    : mode === 'precision' ? PrecisionGame : ClickGame;
  const m = MODE_META[mode];
  const cssSoft = m.color === 'blue' ? '#E3EAFF' : m.color === 'pink' ? '#FFE0EF'
    : m.color === 'mint' ? '#D7F5E8' : m.color === 'coral' ? '#FFE3D5'
    : m.color === 'lilac' ? '#EDE4FF' : '#FFF2CE';
  return (
    <div style={{
      minHeight: '100%', background: `linear-gradient(180deg, ${cssSoft} 0%, var(--bg) 100%)`,
      padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 560, background: 'var(--surface)', borderRadius: 28,
        boxShadow: 'var(--shadow-pop)', overflow: 'hidden',
        position: 'relative', height: 640,
      }}>
        <GameComp word={word} onClose={onClose} onDone={onDone}/>
      </div>
    </div>
  );
}

// ─── REWARD ────────────────────────────────────────────
function WebReward({ word, stars, onNext, onHome }) {
  return (
    <div style={{
      minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg, #FFF2CE 0%, #FFE0EF 100%)', padding: 32,
      position: 'relative', overflow: 'hidden',
    }}>
      <RewardScreen word={word} stars={stars} onNext={onNext} onHome={onHome}/>
    </div>
  );
}

Object.assign(window, { WebMap, WebMe, WebGame, WebReward });
