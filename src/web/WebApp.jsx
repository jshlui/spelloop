// Desktop web app — sidebar + main content. Fills full viewport.

function WebApp({ profile, setProfile, levels, setLevels, settings, setSettings, onOpenParent }) {
  var [tab, setTab] = React.useState(function() { return localStorage.getItem('sl_web_tab') || 'home'; });
  var [route, setRoute] = React.useState({ name: 'screen' });

  React.useEffect(function() { localStorage.setItem('sl_web_tab', tab); }, [tab]);

  function startLevel(level) {
    setRoute({ name: 'game', mode: level.mode === 'boss' ? 'type' : level.mode, word: level.word, levelId: level.id });
  }

  function startMode(mode) {
    var pool = getWordsForDifficulty(settings.difficulty || 'med');
    var w = pool[Math.floor(Math.random() * pool.length)].word;
    setRoute({ name: 'game', mode: mode, word: w });
  }

  function finishGame(stars) {
    var completedId = route.levelId;

    if (completedId) {
      setLevels(function(prev) {
        var next = prev.map(function(l) {
          if (l.id === completedId) return Object.assign({}, l, { done: true, stars: stars, current: false });
          return l;
        });
        // Unlock the next locked level
        var doneIdx = next.findIndex(function(l) { return l.id === completedId; });
        if (doneIdx !== -1 && doneIdx + 1 < next.length && next[doneIdx + 1].locked) {
          next[doneIdx + 1] = Object.assign({}, next[doneIdx + 1], { locked: false, current: true });
        }
        return next;
      });
      setProfile(function(prev) {
        return Object.assign({}, prev, {
          totalStars: prev.totalStars + stars,
          words: prev.words + 1,
          streak: prev.streak + 1,
        });
      });
    }

    setRoute({ name: 'reward', word: route.word, stars: stars, mode: route.mode });
  }

  function closeGame() { setRoute({ name: 'screen' }); }

  var currentLevel = levels.find(function(l) { return l.current; }) || levels[0];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Nunito', system-ui, sans-serif" }}>
      <WebSidebar tab={tab} onTab={function(t) { setTab(t); setRoute({ name: 'screen' }); }}
        profile={profile} settings={settings} onOpenParent={onOpenParent}/>
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {route.name === 'screen' && tab === 'home' && (
          <WebHome profile={profile} levels={levels}
            onContinue={function() { startLevel(currentLevel); }}
            onPickMode={startMode}
            onOpenParent={onOpenParent}/>
        )}
        {route.name === 'screen' && tab === 'map'  && <WebMap levels={levels} onPlayLevel={startLevel}/>}
        {route.name === 'screen' && tab === 'me'   && <WebMe profile={profile} onOpenParent={onOpenParent}/>}
        {route.name === 'game'   && <WebGame mode={route.mode} word={route.word} onClose={closeGame} onDone={finishGame}/>}
        {route.name === 'reward' && (
          <WebReward word={route.word} stars={route.stars}
            onNext={function() { setRoute({ name: 'screen' }); setTab('map'); }}
            onHome={function() { setRoute({ name: 'screen' }); setTab('home'); }}/>
        )}
      </div>
    </div>
  );
}

function WebSidebar({ tab, onTab, profile, settings, onOpenParent }) {
  var avatarStyle = (settings && settings.avatarStyle) || 'animal';
  var items = [
    { id: 'home', label: 'Play', icon: function(c) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 12 L12 5 L20 12 V20 H14 V15 H10 V20 H4 Z" stroke={c} strokeWidth="2.2" strokeLinejoin="round"/></svg>; } },
    { id: 'map',  label: 'Journey', icon: function(c) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 6 L9 4 L15 6 L21 4 V18 L15 20 L9 18 L3 20 Z M9 4 V18 M15 6 V20" stroke={c} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/></svg>; } },
    { id: 'me',   label: 'My stuff', icon: function(c) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={c} strokeWidth="2.2"/><path d="M4 20 C4 15 8 14 12 14 C16 14 20 15 20 20" stroke={c} strokeWidth="2.2" strokeLinecap="round"/></svg>; } },
  ];
  return (
    <aside style={{
      width: 240, flexShrink: 0, background: 'var(--surface)',
      borderRight: '1px solid rgba(31,42,68,0.08)',
      display: 'flex', flexDirection: 'column', padding: 18,
      minHeight: '100vh',
    }}>
      {/* brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 18px' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #6C8EFF, #C7B4FF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-soft)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M4 4v16l4-4h12V4H4z" fill="white"/><circle cx="9" cy="12" r="1.5" fill="#6C8EFF"/><circle cx="13" cy="12" r="1.5" fill="#6C8EFF"/></svg>
        </div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 16, lineHeight: 1 }}>SpellLoop</div>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 700 }}>Kids</div>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map(function(it) {
          var active = tab === it.id;
          return (
            <button key={it.id} onClick={function() { onTab(it.id); window.sfx && window.sfx.tap && window.sfx.tap(); }} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', border: 'none', cursor: 'pointer',
              background: active ? 'var(--blue-soft)' : 'transparent',
              color: active ? 'var(--blue-ink)' : 'var(--ink-soft)',
              borderRadius: 12, fontFamily: 'inherit', fontWeight: 800, fontSize: 15, textAlign: 'left',
            }}>
              {it.icon(active ? 'var(--blue-ink)' : 'var(--ink-soft)')}
              <span>{it.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ flex: 1 }}/>

      {/* streak */}
      <div style={{ background: 'var(--coral-soft)', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 28 }}>🔥</div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--coral-ink)' }}>{profile.streak} days</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--coral-ink)', opacity: 0.7 }}>streak · keep it up</div>
        </div>
      </div>

      {/* mini profile */}
      <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar id={profile.avatar} size={40} style={avatarStyle}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 14 }}>{profile.name}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 700 }}>Level {profile.level} · Age {profile.age}</div>
        </div>
        <button onClick={onOpenParent} aria-label="Parent area" style={{
          width: 32, height: 32, border: 'none', borderRadius: 8,
          background: 'var(--surface)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="var(--ink-soft)" strokeWidth="2"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke="var(--ink-soft)" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      </div>
    </aside>
  );
}

function WebHome({ profile, levels, onContinue, onPickMode, onOpenParent }) {
  var modes = ['click', 'drag', 'type', 'missing', 'keyboard'];
  var currentLevel = levels && levels.find(function(l) { return l.current; });
  var doneCount = levels ? levels.filter(function(l) { return l.done; }).length : 0;
  var modeName = currentLevel ? (MODE_META[currentLevel.mode] || MODE_META.click).label : 'Spell it';
  var currentWord = currentLevel ? currentLevel.word : '...';
  var levelNum = currentLevel ? currentLevel.id : 1;

  return (
    <div style={{ padding: '32px 40px 48px', background: 'linear-gradient(180deg, #FFF6EA 0%, var(--bg) 400px)', minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            {new Date().toLocaleDateString('en', { weekday: 'long' })} · {new Date().toLocaleDateString('en', { month: 'long', day: 'numeric' })}
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Hi, {profile.name}! 👋</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <WebStat icon="🔥" value={profile.streak} label="day streak" bg="var(--coral-soft)"/>
          <WebStat icon="⭐" value={profile.totalStars} label="stars" bg="var(--yellow-soft)"/>
          <WebStat icon="📚" value={profile.words} label="words" bg="var(--mint-soft)"/>
        </div>
      </div>

      {/* hero continue card */}
      <div style={{
        background: 'var(--blue)', color: 'white',
        borderRadius: 24, padding: '28px 32px',
        boxShadow: 'var(--shadow-pop)', position: 'relative',
        overflow: 'hidden', marginBottom: 28,
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center',
      }}>
        <svg width="280" height="280" viewBox="0 0 280 280" style={{ position: 'absolute', right: -20, top: -80, opacity: 0.22 }}>
          <circle cx="190" cy="100" r="60" fill="#FFD166"/>
          <circle cx="90" cy="200" r="40" fill="#FF9ECD"/>
          <rect x="170" y="180" width="50" height="50" rx="12" fill="#8EE3C3"/>
        </svg>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.9 }}>
            Continue · Chapter 1 · Level {levelNum}
          </div>
          <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.05, margin: '6px 0', letterSpacing: '-0.02em' }}>{modeName}</div>
          <div style={{ fontSize: 18, opacity: 0.95, fontWeight: 700, marginBottom: 18 }}>
            Today's word is <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: 8, fontWeight: 900 }}>{currentWord}</span>
          </div>
          <button onClick={onContinue} style={{
            background: 'white', color: 'var(--blue-ink)', border: 'none',
            padding: '16px 28px', borderRadius: 999, fontSize: 17, fontWeight: 900,
            cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 0 rgba(0,0,0,0.15)',
          }}>▶ Continue learning</button>
        </div>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: 20 }}>
          <div style={{
            width: 160, height: 160, borderRadius: 40,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: currentWord.length > 4 ? 52 : 72, fontWeight: 900, letterSpacing: '0.05em',
            backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.3)',
          }}>{currentWord}</div>
        </div>
      </div>

      {/* practice modes */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Practice a mode</h2>
        <span style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 700 }}>Quick play · one word</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 28 }}>
        {modes.map(function(m) { return <WebModeCard key={m} mode={m} onClick={function() { onPickMode(m); }}/>; })}
      </div>

      {/* recent words + daily goal */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>Recent words</h3>
          </div>
          <div style={{ display: 'flex', gap: 10, overflow: 'auto' }}>
            {(levels || []).filter(function(l) { return l.done; }).slice(-7).reverse().map(function(l) {
              return (
                <div key={l.id} style={{ background: 'var(--mint-soft)', borderRadius: 12, padding: '12px 14px', minWidth: 90, textAlign: 'center', border: '2px solid var(--mint)' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '0.05em' }}>{l.word}</div>
                  <div style={{ marginTop: 4 }}><StarRow filled={l.stars} size={10} gap={1}/></div>
                </div>
              );
            })}
            {doneCount === 0 && <div style={{ fontSize: 14, color: 'var(--ink-mute)', fontWeight: 700, padding: '12px 0' }}>Complete levels to see your words here!</div>}
          </div>
        </div>
        <div className="card" style={{ background: 'var(--yellow-soft)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 900, margin: '0 0 10px' }}>Progress</h3>
          <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.02em' }}>
            {doneCount}<span style={{ fontSize: 16, color: 'var(--ink-soft)' }}>/{(levels || []).length} levels</span>
          </div>
          <div className="progress-track" style={{ marginTop: 8 }}>
            <div className="progress-fill" style={{ width: `${levels && levels.length ? (doneCount / levels.length * 100) : 0}%`, background: 'var(--yellow-ink)' }}/>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700, marginTop: 8 }}>
            {doneCount === levels.length ? 'Chapter 1 complete! 🎉' : `${(levels || []).length - doneCount} levels remaining`}
          </div>
        </div>
      </div>
    </div>
  );
}

function WebStat({ icon, value, label, bg }) {
  return (
    <div style={{ background: bg, borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'var(--shadow-soft)' }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      </div>
    </div>
  );
}

function WebModeCard({ mode, onClick }) {
  var m = MODE_META[mode];
  var descs = { click: 'Pick each letter', drag: 'Drag into order', type: 'Use the keyboard', missing: 'Find the gap', keyboard: 'Find keys fast' };
  return (
    <button onClick={onClick} style={{
      background: 'var(--surface)', border: 'none', cursor: 'pointer',
      borderRadius: 16, padding: 18, textAlign: 'left',
      boxShadow: 'var(--shadow-soft)', fontFamily: 'inherit',
      display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'transform 120ms, box-shadow 120ms',
    }}
    onMouseEnter={function(e) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-pop)'; }}
    onMouseLeave={function(e) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-soft)'; }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 14, background: m.soft, color: m.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900 }}>{m.icon}</div>
      <div>
        <div style={{ fontWeight: 900, fontSize: 17, color: 'var(--ink)' }}>{m.label}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 700, marginTop: 2 }}>{descs[mode] || ''}</div>
      </div>
    </button>
  );
}

Object.assign(window, { WebApp, WebHome, WebStat });
