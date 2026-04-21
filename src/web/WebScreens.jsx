// Web versions of Map, Me, Game shell, Reward — landscape/desktop layouts.

var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── MAP ────────────────────────────────────────────────
var CHAPTER_PTS = [
  { x: 90,  y: 340 }, { x: 220, y: 260 }, { x: 360, y: 360 }, { x: 500, y: 220 },
  { x: 640, y: 340 }, { x: 780, y: 240 }, { x: 920, y: 360 }, { x: 1060, y: 220 },
];

function buildPath(points) {
  var d = 'M ' + points[0].x + ' ' + points[0].y;
  for (var i = 0; i < points.length - 1; i++) {
    var p0 = points[i], p1 = points[i + 1];
    var mx = (p0.x + p1.x) / 2;
    d += ' Q ' + mx + ' ' + p0.y + ', ' + mx + ' ' + ((p0.y + p1.y) / 2) + ' T ' + p1.x + ' ' + p1.y;
  }
  return d;
}

function WebMap({ levels, onPlayLevel, onBack }) {
  levels = levels || LEVELS;
  var chapters = window.CHAPTER_META || [
    { id: 1, name: 'The Word Forest', emoji: '🌳' },
    { id: 2, name: 'The Word Sea',    emoji: '🌊' },
    { id: 3, name: 'The Word Mountain', emoji: '⛰️' },
  ];
  var [activeChapter, setActiveChapter] = React.useState(function() {
    var cur = levels.find(function(l) { return l.current; });
    return cur ? cur.chapter : 1;
  });

  var chLevels = levels.filter(function(l) { return l.chapter === activeChapter; });
  var chDone   = chLevels.filter(function(l) { return l.done; }).length;
  var ch = chapters.find(function(c) { return c.id === activeChapter; }) || chapters[0];

  var chapterPills = (
    <div style={{ display: 'flex', gap: 8 }}>
      {chapters.map(function(c) {
        var chLvs = levels.filter(function(l) { return l.chapter === c.id; });
        var allDone = chLvs.length > 0 && chLvs.every(function(l) { return l.done; });
        var isLocked = chLvs.every(function(l) { return l.locked && !l.current; });
        var isActive = c.id === activeChapter;
        return (
          <button key={c.id}
            onClick={function() { if (!isLocked) setActiveChapter(c.id); }}
            style={{
              padding: '6px 14px', borderRadius: 999, border: 'none', cursor: isLocked ? 'default' : 'pointer',
              fontFamily: "'Fredoka One', cursive", fontSize: 13,
              background: isActive ? '#1976D2' : allDone ? '#4CAF50' : isLocked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)',
              color: isActive ? 'white' : allDone ? 'white' : isLocked ? 'rgba(255,255,255,0.5)' : '#1A3A1A',
              opacity: isLocked ? 0.6 : 1,
            }}>
            {allDone ? '✓ ' : ''}{c.emoji} {c.name}
          </button>
        );
      })}
    </div>
  );

  var pts = CHAPTER_PTS.slice(0, chLevels.length);
  var d = pts.length > 1 ? buildPath(pts) : null;

  var LandscapeShell = window.LandscapeShell;

  return (
    <LandscapeShell title="Journey" onBack={onBack} topExtra={chapterPills}>
      {/* Path + nodes drawn directly over the landscape */}
      <div style={{ position: 'relative', width: '100%', minHeight: 'calc(100vh - 140px)', overflow: 'hidden' }}>
        <svg
          width="100%" height="100%"
          viewBox="0 0 1140 420"
          preserveAspectRatio="xMidYMid meet"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}>
          {d && (
            <>
              <path d={d} stroke="var(--path-main)" strokeWidth="30" fill="none" strokeLinecap="round"/>
              <path d={d} stroke="var(--path-light)" strokeWidth="13" fill="none" strokeLinecap="round" strokeDasharray="3 18" opacity="0.7"/>
            </>
          )}
          {chLevels.map(function(lv, i) {
            var pt = pts[i] || pts[pts.length - 1];
            return (
              <g key={lv.id} transform={'translate(' + pt.x + ',' + pt.y + ')'}
                style={{ cursor: lv.locked && !lv.current ? 'default' : 'pointer' }}
                role={(!lv.locked || lv.current) ? 'button' : undefined}
                tabIndex={(!lv.locked || lv.current) ? 0 : -1}
                aria-label={lv.locked && !lv.current ? 'Level ' + lv.id + ' — locked' : 'Level ' + lv.id + ': ' + lv.word}
                onKeyDown={function(e) { if ((e.key === 'Enter' || e.key === ' ') && (!lv.locked || lv.current)) { e.preventDefault(); onPlayLevel(lv); } }}
                onClick={function() { if (!lv.locked || lv.current) onPlayLevel(lv); }}>
                <WebLevelNode level={lv}/>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Frosted progress bar at bottom */}
      <div style={{
        position: 'fixed', bottom: 0, left: 72, right: 0, zIndex: 30,
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(10px)',
        borderTop: '2px solid rgba(255,255,255,0.8)',
        padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 15, color: '#1A3A1A', whiteSpace: 'nowrap' }}>
          {ch.emoji} {ch.name}
        </span>
        <div style={{ flex: 1, height: 12, background: 'rgba(0,0,0,0.1)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 999,
            background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
            width: chLevels.length > 0 ? Math.round(chDone / chLevels.length * 100) + '%' : '0%',
            transition: 'width 0.4s ease',
          }}/>
        </div>
        <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 14, color: '#1A3A1A', whiteSpace: 'nowrap' }}>
          {chDone} / {chLevels.length}
        </span>
      </div>
    </LandscapeShell>
  );
}

function WebLevelNode({ level }) {
  var m = MODE_META[level.mode];
  var isDone = level.done, isCurrent = level.current, isLocked = level.locked && !level.current;
  var nodeFill = isLocked ? '#9E9E9E' : isDone ? '#4CAF50' : isCurrent ? '#1976D2' : ('var(--' + m.color + ')');
  var nodeStroke = isCurrent ? 'white' : 'rgba(0,0,0,0.15)';
  return (
    <>
      {isCurrent && !prefersReducedMotion && (
        <circle r="46" fill="none" stroke="white" strokeWidth="4" opacity="0.6">
          <animate attributeName="r" from="38" to="54" dur="1.4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.6" to="0" dur="1.4s" repeatCount="indefinite"/>
        </circle>
      )}
      {isCurrent && (
        <rect x="-52" y="-82" width="104" height="26" rx="13" fill="white" opacity="0.9"/>
      )}
      {isCurrent && (
        <text x="0" y="-64" textAnchor="middle" fontSize="12" fontWeight="900" fill="#1976D2" fontFamily="Fredoka One, Nunito, system-ui">▶ YOU ARE HERE</text>
      )}
      <circle r="36" fill={nodeFill} stroke={nodeStroke} strokeWidth="4" opacity={isLocked ? 0.75 : 1}/>
      <text x="0" y="9" textAnchor="middle" fontSize={isLocked ? 22 : 24} fontWeight="900" fill="white" fontFamily="Nunito, system-ui">
        {isLocked ? '🔒' : isDone ? '✓' : m.icon}
      </text>
      <text x="0" y="58" textAnchor="middle" fontSize="13" fontWeight="900" fill="white" fontFamily="Nunito, system-ui"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
        {isLocked ? 'Level ' + level.id : level.word}
      </text>
      {isDone && (
        <g transform="translate(-16, 66)">
          {[0,1,2].map(function(i) {
            return (
              <path key={i} transform={'translate(' + (i*12) + ', 0) scale(0.55)'}
                d="M 6 0 L 7.5 3.5 L 11 4 L 8.5 6.5 L 9 10 L 6 8 L 3 10 L 3.5 6.5 L 1 4 L 4.5 3.5 Z"
                fill={i < level.stars ? '#FFD700' : 'rgba(255,255,255,0.3)'}
                stroke={i < level.stars ? '#C9A000' : 'none'} strokeWidth="0.5"/>
            );
          })}
        </g>
      )}
    </>
  );
}

// ─── ME ────────────────────────────────────────────────
function WebMe({ profile, setProfile, levels, onOpenParent }) {
  var avatarStyle = (window.__tweaks && window.__tweaks.avatarStyle) || 'animal';
  var [avatarOpen, setAvatarOpen] = React.useState(false);
  var [editingName, setEditingName] = React.useState(false);
  var [nameInput, setNameInput] = React.useState(profile.name);
  var [nameError, setNameError] = React.useState('');

  var ctx = React.useContext(window.GameContext) || {};
  var accuracy = ctx.totalClicks > 0 ? Math.round(ctx.accuracy * 100) + '%' : '—';

  var xp = profile.totalStars * 10;
  var xpInLevel = xp % 500;
  var xpPct = xpInLevel / 500 * 100;

  var ch1Done = levels && levels.filter(function(l) { return l.chapter === 1; }).every(function(l) { return l.done; });
  var hasPerfect = levels && levels.some(function(l) { return l.stars === 3; });
  var history = (ctx.taskHistory || []).filter(function(t) { return t.correct && t.ms > 0; });
  var fastestMs = history.length ? Math.min.apply(null, history.map(function(t) { return t.ms; })) : Infinity;

  var badges = [
    { id: 'firstword', name: 'First word',   icon: '📝', unlocked: profile.words >= 1 },
    { id: 'spell5',    name: '5 spellings',   icon: '✏️', unlocked: profile.words >= 5 },
    { id: 'streak3',   name: '3-day streak',  icon: '🔥', unlocked: profile.streak >= 3 },
    { id: 'ch1',       name: 'Ch. 1 king',    icon: '👑', unlocked: !!ch1Done },
    { id: 'perfect',   name: 'Perfect run',   icon: '⭐', unlocked: !!hasPerfect },
    { id: 'speed',     name: 'Speed champ',   icon: '⚡', unlocked: isFinite(fastestMs) && fastestMs < 800 },
    { id: 'marathon',  name: 'Marathon',      icon: '🏃', unlocked: profile.words >= 20 },
    { id: 'earlybird', name: 'Early bird',    icon: '🌅', unlocked: false },
  ];

  function saveName() {
    var n = nameInput.trim();
    if (!n) { setNameError("Name can't be empty"); return; }
    setNameError('');
    setProfile(function(p) { return Object.assign({}, p, { name: n }); });
    setEditingName(false);
  }

  return (
    <div style={{ padding: '32px 40px 48px', background: 'linear-gradient(180deg, #EDE4FF 0%, var(--bg) 300px)', minHeight: '100%' }}>
      {/* Avatar picker modal */}
      {avatarOpen && (
        <div onClick={function() { setAvatarOpen(false); }} style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'var(--alpha-mask)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div onClick={function(e) { e.stopPropagation(); }} style={{
            background: 'var(--surface)', borderRadius: 28, padding: 28,
            maxWidth: 480, width: '90vw', boxShadow: 'var(--shadow-pop)',
          }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 400, fontFamily: "'Fredoka One', cursive" }}>Choose your avatar</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {AVATARS.map(function(av) {
                var selected = profile.avatar === av.id;
                return (
                  <button key={av.id} onClick={function() {
                    setProfile(function(p) { return Object.assign({}, p, { avatar: av.id }); });
                    setAvatarOpen(false);
                  }} style={{
                    background: selected ? 'var(--blue-soft)' : 'var(--bg)',
                    border: 'none', borderRadius: 18, padding: '16px 10px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    outline: selected ? '3px solid var(--blue)' : 'none',
                    outlineOffset: 2, fontFamily: 'inherit',
                  }}>
                    <Avatar id={av.id} size={80} style={avatarStyle}/>
                    <div style={{ fontWeight: 900, fontSize: 13 }}>{av.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'min(280px,30vw) 1fr', gap: 24 }}>
        {/* left — avatar panel */}
        <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
          <div style={{ display: 'inline-block', position: 'relative' }}>
            <Avatar id={profile.avatar} size={140} style={avatarStyle}/>
            <div style={{
              position: 'absolute', bottom: -2, right: -8,
              background: 'var(--coral)', color: 'white', fontWeight: 900,
              fontSize: 14, padding: '4px 12px', borderRadius: 'var(--r-pill)',
              boxShadow: '0 0 0 3px var(--bg), var(--shadow-toy)',
            }}>Lv {profile.level}</div>
          </div>
          {(function() {
            var equipped = profile.equipped || {};
            var avItems = window.AVATAR_ITEMS || [];
            var headItem = avItems.find(function(i) { return i.id === equipped.head; });
            var badgeItem = avItems.find(function(i) { return i.id === equipped.badge; });
            if (!headItem && !badgeItem) return null;
            return (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
                {headItem && <span style={{ fontSize: 24 }} title={headItem.name}>{headItem.emoji}</span>}
                {badgeItem && <span style={{ fontSize: 24 }} title={badgeItem.name}>{badgeItem.emoji}</span>}
              </div>
            );
          })()}
          {editingName ? (
            <div style={{ margin: '14px 0 4px' }}>
              <input autoFocus value={nameInput}
                onChange={function(e) { setNameInput(e.target.value); setNameError(''); }}
                onKeyDown={function(e) { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setEditingName(false); setNameError(''); } }}
                onBlur={saveName}
                aria-label="Your name"
                aria-describedby={nameError ? 'name-error' : undefined}
                style={{
                  fontSize: 24, fontWeight: 900, fontFamily: 'inherit',
                  border: 'none', borderBottom: nameError ? '2px solid var(--danger)' : '2px solid var(--blue)',
                  background: 'transparent', textAlign: 'center',
                  width: '100%', outline: 'none', color: 'var(--ink)',
                }}
              />
              {nameError && <div id="name-error" role="alert" style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 700, marginTop: 4 }}>{nameError}</div>}
            </div>
          ) : (
            <h2 onClick={function() { setNameInput(profile.name); setEditingName(true); }}
              style={{ fontSize: 26, fontWeight: 400, fontFamily: "'Fredoka One', cursive", margin: '14px 0 4px', cursor: 'pointer' }}>
              {profile.name} <span style={{ fontSize: 16 }}>✏️</span>
            </h2>
          )}
          <div style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 700, marginBottom: 18 }}>Age {profile.age}</div>
          <button className="btn-3d" onClick={function() { setAvatarOpen(true); }} style={{
            background: 'var(--lilac-soft)', color: 'var(--lilac-ink)',
            border: 'none', padding: '10px 18px', borderRadius: 'var(--r-pill)',
            fontWeight: 900, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          }}>Change avatar</button>
        </div>

        {/* right — XP + badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* XP */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <h3 style={{ fontSize: 18, fontWeight: 400, fontFamily: "'Fredoka One', cursive", margin: 0 }}>XP this week</h3>
              <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--blue-ink)' }}>{xpInLevel} / 500</div>
            </div>
            <div className="progress-track" style={{ height: 14 }}>
              <div className="progress-fill" style={{ width: xpPct + '%' }}/>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              {[
                { icon: '🔥', value: profile.streak,     label: 'day streak', bg: 'var(--coral-soft)' },
                { icon: '⭐', value: profile.totalStars,  label: 'stars',      bg: 'var(--yellow-soft)' },
                { icon: '📚', value: profile.words,       label: 'words',      bg: 'var(--mint-soft)' },
                { icon: '🎯', value: accuracy,            label: 'accuracy',   bg: 'var(--blue-soft)' },
              ].map(function(s) {
                return (
                  <div key={s.label} style={{ flex: 1, background: s.bg, borderRadius: 12, padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div style={{ fontSize: 20 }}>{s.icon}</div>
                    <div style={{ fontWeight: 900, fontSize: 18, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-mute)', textAlign: 'center' }}>{s.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* badges */}
          <div className="card">
            <h3 style={{ fontSize: 18, fontWeight: 400, fontFamily: "'Fredoka One', cursive", margin: '0 0 14px' }}>Badges</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {badges.map(function(b) {
                return (
                  <div key={b.id} style={{
                    background: b.unlocked ? 'var(--yellow-soft)' : 'var(--bg)',
                    borderRadius: 14, padding: 14,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    opacity: b.unlocked ? 1 : 0.3,
                  }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: b.unlocked ? 'var(--yellow)' : 'var(--alpha-md)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                      boxShadow: b.unlocked ? 'var(--shadow-soft)' : 'none',
                    }}>{b.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, textAlign: 'center', lineHeight: 1.2 }}>{b.name}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* parent link */}
          <button onClick={onOpenParent} className="card btn-3d" style={{
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
    : mode === 'precision' ? PrecisionGame
    : mode === 'scramble' ? ScrambleGame
    : mode === 'speed' ? SpeedGame
    : mode === 'echo' ? EchoGame
    : mode === 'flash' ? FlashGame
    : mode === 'coding' ? CodingGame : ClickGame;
  const m = MODE_META[mode];
  const cssSoft = m.color === 'blue' ? '#E3EAFF' : m.color === 'pink' ? '#FFE0EF'
    : m.color === 'mint' ? '#D7F5E8' : m.color === 'coral' ? '#FFE3D5'
    : m.color === 'lilac' ? '#EDE4FF' : '#FFF2CE';

  var gameCtx = window.GameContext ? React.useContext(window.GameContext) : null;
  function handleDone(stars) {
    var accuracy = (gameCtx && gameCtx.totalClicks > 0) ? gameCtx.accuracy : 1;
    onDone(stars, accuracy);
  }

  return (
    <div style={{
      minHeight: '100%', background: `linear-gradient(180deg, ${cssSoft} 0%, var(--bg) 100%)`,
      padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 'min(560px, 92vw)', background: 'var(--surface)', borderRadius: 28,
        boxShadow: 'var(--shadow-toy)', overflow: 'hidden',
        position: 'relative', height: 'min(640px, 82vh)',
      }}>
        <GameComp word={word} onClose={onClose} onDone={handleDone}/>
      </div>
    </div>
  );
}

// ─── REWARD ────────────────────────────────────────────
function WebReward({ word, stars, coins, onNext, onHome }) {
  return (
    <div style={{
      minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg, var(--yellow-soft) 0%, var(--pink-soft) 100%)', padding: 32,
      position: 'relative', overflow: 'hidden',
    }}>
      <RewardScreen word={word} stars={stars} coins={coins} onNext={onNext} onHome={onHome}/>
    </div>
  );
}

Object.assign(window, { WebMap, WebMe, WebGame, WebReward });
