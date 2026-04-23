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

  var pts = CHAPTER_PTS.slice(0, chLevels.length);
  var d = pts.length > 1 ? buildPath(pts) : null;
  var current = chLevels.find(function(l) { return l.current; }) || chLevels.find(function(l) { return !l.done && !l.locked; }) || chLevels[0];
  var pct = chLevels.length > 0 ? Math.round(chDone / chLevels.length * 100) : 0;

  return (
    <main className="spelloop-dashboard spelloop-journey-page">
      <header className="journey-top">
        <button className="journey-back" onClick={onBack} aria-label="Back to home">←</button>
        <div className="journey-title">
          <span>{ch.emoji}</span>
          <div>
            <p>Journey</p>
            <h1>{ch.name}</h1>
          </div>
        </div>
        <button className="journey-help" aria-label="Help">?</button>
      </header>

      <div className="journey-chapters" aria-label="Chapters">
        {chapters.map(function(c) {
          var chLvs = levels.filter(function(l) { return l.chapter === c.id; });
          var allDone = chLvs.length > 0 && chLvs.every(function(l) { return l.done; });
          var isLocked = chLvs.every(function(l) { return l.locked && !l.current; });
          var isActive = c.id === activeChapter;
          return (
            <button key={c.id}
              className={'journey-chip' + (isActive ? ' is-active' : '') + (allDone ? ' is-done' : '')}
              disabled={isLocked}
              onClick={function() { if (!isLocked) setActiveChapter(c.id); }}>
              <span>{allDone ? '✓' : c.emoji}</span>{c.name}
            </button>
          );
        })}
      </div>

      <section className="journey-summary">
        <div className="journey-summary-card">
          <span className="journey-summary-card__icon">⭐</span>
          <div><strong>{chDone}</strong><p>Completed</p></div>
        </div>
        <div className="journey-summary-card">
          <span className="journey-summary-card__icon">🎯</span>
          <div><strong>{current ? current.word : 'Ready'}</strong><p>Next lesson</p></div>
        </div>
        <div className="journey-summary-card">
          <span className="journey-summary-card__icon">💎</span>
          <div><strong>{pct}%</strong><p>Chapter progress</p></div>
        </div>
      </section>

      <section className="journey-map-card">
        <div className="journey-map-cloud journey-map-cloud--one"/>
        <div className="journey-map-cloud journey-map-cloud--two"/>
        <div className="journey-map-hill journey-map-hill--one"/>
        <div className="journey-map-hill journey-map-hill--two"/>
        <svg
          className="journey-map-svg"
          width="100%" height="100%"
          viewBox="0 0 1140 460"
          preserveAspectRatio="xMidYMid meet">
          {d && (
            <>
              <path d={d} stroke="rgba(97, 71, 190, 0.11)" strokeWidth="52" fill="none" strokeLinecap="round"/>
              <path d={d} stroke="#FFC44D" strokeWidth="38" fill="none" strokeLinecap="round"/>
              <path d={d} stroke="rgba(255,255,255,0.46)" strokeWidth="14" fill="none" strokeLinecap="round" strokeDasharray="2 22"/>
            </>
          )}
          {/* Constellation overlay */}
          {(function() {
            var litPts = pts.filter(function(_, i) { return chLevels[i] && chLevels[i].done; });
            var allLit = chLevels.length > 0 && chLevels.every(function(l) { return l.done; });
            var CONSTELLATION_NAMES = ['Orion', 'The Dipper', 'Cassiopeia', 'Leo', 'Lyra', 'Scorpius', 'Aquila', 'Cygnus'];
            var constellationName = CONSTELLATION_NAMES[activeChapter - 1] || 'Stars';
            return React.createElement(React.Fragment, null,
              // Connection lines between lit stars
              litPts.length > 1 && litPts.slice(0, -1).map(function(p, i) {
                return React.createElement('line', {
                  key: 'cl' + i,
                  x1: p.x, y1: p.y - 60,
                  x2: litPts[i+1].x, y2: litPts[i+1].y - 60,
                  stroke: '#FCD34D', strokeWidth: 1.5, opacity: 0.45,
                  strokeDasharray: '4 6',
                });
              }),
              // Stars at each level position
              pts.map(function(p, i) {
                var lv = chLevels[i];
                if (!lv) return null;
                var lit = lv.done;
                return React.createElement('g', { key: 'cs' + i, transform: 'translate(' + p.x + ',' + (p.y - 60) + ')' },
                  lit && !prefersReducedMotion && React.createElement('circle', {
                    r: 7, fill: '#FCD34D', opacity: 0,
                    style: { animation: 'juiceStarPulse 2s ease-in-out infinite', animationDelay: (i * 0.3) + 's' },
                  }),
                  React.createElement('polygon', {
                    points: '0,-6 1.4,-2 5,-2 2,0.8 3,5 0,2.5 -3,5 -2,0.8 -5,-2 -1.4,-2',
                    fill: lit ? '#FCD34D' : 'rgba(255,255,255,0.18)',
                    stroke: lit ? '#F59E0B' : 'none',
                    strokeWidth: 0.5,
                    style: lit ? { filter: 'drop-shadow(0 0 4px rgba(252,211,77,0.8))' } : {},
                  })
                );
              }),
              // Chapter complete label
              allLit && React.createElement('text', {
                x: 570, y: 28,
                textAnchor: 'middle',
                fontSize: 13, fontWeight: 800,
                fill: '#FCD34D',
                style: { filter: 'drop-shadow(0 0 6px rgba(252,211,77,0.6))' },
              }, '✦ ' + constellationName + ' complete! ✦')
            );
          })()}
          {chLevels.map(function(lv, i) {
            var pt = pts[i] || pts[pts.length - 1];
            return (
              <g key={lv.id} transform={'translate(' + pt.x + ',' + pt.y + ')'}
                className="journey-node-hit"
                style={{ cursor: lv.locked && !lv.current ? 'default' : 'pointer' }}
                role={(!lv.locked || lv.current) ? 'button' : undefined}
                tabIndex={(!lv.locked || lv.current) ? 0 : -1}
                aria-label={lv.locked && !lv.current ? 'Level ' + lv.id + ' locked' : 'Level ' + lv.id + ': ' + lv.word}
                onKeyDown={function(e) { if ((e.key === 'Enter' || e.key === ' ') && (!lv.locked || lv.current)) { e.preventDefault(); onPlayLevel(lv); } }}
                onClick={function() { if (!lv.locked || lv.current) onPlayLevel(lv); }}>
                <WebLevelNode level={lv}/>
              </g>
            );
          })}
        </svg>
      </section>

      <section className="journey-progress-card">
        <div className="journey-progress-label"><strong>{ch.emoji} {ch.name}</strong><span>{chDone} / {chLevels.length}</span></div>
        <div className="journey-progress-track"><span style={{ width: pct + '%' }}/></div>
      </section>
    </main>
  );
}

function WebLevelNode({ level }) {
  var m = MODE_META[level.mode];
  var isDone = level.done, isCurrent = level.current, isLocked = level.locked && !level.current;
  var nodeFill = isLocked ? '#C8C0D9' : isDone ? '#16C184' : isCurrent ? '#6E43D9' : ('var(--' + m.color + ')');
  var nodeStroke = isCurrent ? '#FFE16B' : isDone ? '#0A9B68' : 'rgba(255,255,255,0.9)';
  return (
    <>
      {isCurrent && !prefersReducedMotion && (
        <circle r="52" fill="none" stroke="#FFE16B" strokeWidth="7" opacity="0.75">
          <animate attributeName="r" from="38" to="56" dur="1.4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.7" to="0" dur="1.4s" repeatCount="indefinite"/>
        </circle>
      )}
      {isCurrent && (
        <rect x="-72" y="-90" width="144" height="34" rx="17" fill="#6E43D9" opacity="0.97"/>
      )}
      {isCurrent && (
        <text x="0" y="-68" textAnchor="middle" fontSize="13" fontWeight="900" fill="white" fontFamily="Fredoka, Nunito, system-ui">▶ YOU ARE HERE</text>
      )}
      <circle r="43" fill="rgba(40,32,87,0.08)"/>
      <circle r="36" fill={nodeFill} stroke={nodeStroke} strokeWidth="6" opacity={isLocked ? 0.88 : 1}/>
      <text x="0" y="9" textAnchor="middle" fontSize={isLocked ? 22 : 26} fontWeight="900" fill="white" fontFamily="Nunito, system-ui">
        {isLocked ? '🔒' : isDone ? '✓' : m.icon}
      </text>
      <text x="0" y="66" textAnchor="middle" fontSize="17" fontWeight="900" fill="#282057" fontFamily="Grandstander, Fredoka, Nunito, system-ui">
        {isLocked ? 'Level ' + level.id : level.word}
      </text>
      {isDone && (
        <g transform="translate(-19, 76)">
          {[0,1,2].map(function(i) {
            return (
              <path key={i} transform={'translate(' + (i*15) + ', 0) scale(0.68)'}
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
    <div className="profile-dashboard" style={{ padding: '32px 40px 48px', background: 'var(--bg)', minHeight: '100%' }}>
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
            <h2 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 700, fontFamily: "'Fredoka', 'Nunito', sans-serif" }}>Choose your avatar</h2>
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
        <div className="card" style={{ textAlign: 'center', padding: '28px 20px', background: 'linear-gradient(160deg, var(--brand-dark) 0%, var(--brand) 100%)', color: 'white' }}>
          <div style={{ display: 'inline-block', position: 'relative' }}>
            <Avatar id={profile.avatar} size={140} style={avatarStyle}/>
            <div style={{
              position: 'absolute', bottom: -2, right: -8,
              background: 'var(--gold)', color: '#451A03', fontWeight: 900,
              fontSize: 14, padding: '4px 12px', borderRadius: 'var(--r-pill)',
              boxShadow: '0 0 0 3px var(--brand-dark), 0 2px 0 var(--gold-dark)',
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
              style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Fredoka', 'Nunito', sans-serif", margin: '14px 0 4px', cursor: 'pointer', color: 'white' }}>
              {profile.name} <span style={{ fontSize: 16 }}>✏️</span>
            </h2>
          )}
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginBottom: 18 }}>Age {profile.age}</div>
          <button className="btn-3d" onClick={function() { setAvatarOpen(true); }} style={{
            background: 'rgba(255,255,255,0.18)', color: 'white',
            border: '1.5px solid rgba(255,255,255,0.35)', padding: '10px 18px', borderRadius: 'var(--r-pill)',
            fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Fredoka', 'Nunito', sans-serif",
          }}>Change avatar</button>
        </div>

        {/* right — XP + badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* XP */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Fredoka', 'Nunito', sans-serif", margin: 0 }}>XP this week</h3>
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
            <h3 style={{ fontSize: 18, fontWeight: 400, fontFamily: "'Bubblegum Sans', cursive", margin: '0 0 14px' }}>Badges</h3>
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

          {/* Word Collection */}
          {(function() {
            var wordCollection = (levels || []).filter(function(l) {
              return l.done && l.stars >= 2 && l.mode !== 'coding' && l.word;
            });
            if (!wordCollection.length) return null;
            var wordThemeMap = {};
            if (window.WORDS_BY_LENGTH) {
              Object.values(window.WORDS_BY_LENGTH).forEach(function(arr) {
                arr.forEach(function(w) { wordThemeMap[w.word] = w.theme; });
              });
            }
            var THEME_EMOJI = {
              animal:'🐾', food:'🍎', object:'🎒', space:'🚀',
              weather:'⛅', nature:'🌿', place:'🏘️', body:'👁️',
            };
            var milestones = [10, 25, 50];
            return React.createElement('div', { className: 'card', style: { marginTop: 0 } },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 } },
                React.createElement('h3', { style: { fontSize: 18, fontWeight: 400, fontFamily: "'Bubblegum Sans', cursive", margin: 0 } }, 'My Word Collection 🫙'),
                React.createElement('div', { style: {
                  background: 'var(--brand)', color: 'white',
                  fontSize: 11, fontWeight: 900, borderRadius: 999, padding: '2px 8px', lineHeight: 1.4,
                }}, wordCollection.length)
              ),
              milestones.includes(wordCollection.length) && React.createElement('div', { style: {
                background: 'var(--gold-soft)', borderRadius: 'var(--r-md)',
                padding: '10px 14px', marginBottom: 12,
                display: 'flex', alignItems: 'center', gap: 8,
                fontWeight: 800, fontSize: 13, color: '#92400E',
              }}, '🎉 ' + wordCollection.length + ' words collected! Amazing!'),
              React.createElement('div', { style: {
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 8,
              }},
                wordCollection.map(function(l) {
                  var theme = wordThemeMap[l.word] || 'object';
                  var emoji = THEME_EMOJI[theme] || '📖';
                  return React.createElement('button', {
                    key: l.id,
                    onClick: function() { window.sfx && window.sfx.speak && window.sfx.speak(l.word, 0.8); },
                    title: 'Tap to hear ' + l.word,
                    style: {
                      background: 'var(--surface)', border: '2px solid var(--brand-light)',
                      borderRadius: 'var(--r-md)', padding: '8px 4px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      cursor: 'pointer', boxShadow: 'var(--shadow-soft)',
                      transition: 'transform 120ms',
                    },
                    onMouseEnter: function(e) { e.currentTarget.style.transform = 'scale(1.08)'; },
                    onMouseLeave: function(e) { e.currentTarget.style.transform = 'scale(1)'; },
                  },
                    React.createElement('div', { style: { fontSize: 18 } }, emoji),
                    React.createElement('div', { style: { fontSize: 10, fontWeight: 900, color: 'var(--ink)', letterSpacing: 0.5 } }, l.word),
                    React.createElement('div', { style: { fontSize: 9, letterSpacing: 1 } },
                      [1,2,3].map(function(s) {
                        return React.createElement('span', { key: s, style: { color: s <= l.stars ? '#F59E0B' : '#CBD5E1' } }, '★');
                      })
                    )
                  );
                })
              )
            );
          })()}

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
