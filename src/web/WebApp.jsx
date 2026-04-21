// Desktop web app — sidebar + main content. Fills full viewport.

function WebApp({ profile, setProfile, levels, setLevels, settings, setSettings, onOpenParent }) {
  var [tab, setTab] = React.useState(function() { return localStorage.getItem('sl_web_tab') || 'home'; });
  var [route, setRoute] = React.useState({ name: 'screen' });

  React.useEffect(function() { localStorage.setItem('sl_web_tab', tab); }, [tab]);

  // On mount: mood decay per pet + Pebble happyDays check
  React.useEffect(function() {
    var today = new Date().toISOString().slice(0, 10);
    var yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    setProfile(function(prev) {
      var pd = Object.assign({}, prev.petData || {});
      var owned = prev.ownedSpecies || [];
      var changed = false;

      // Mood decay for each owned pet
      owned.forEach(function(sid) {
        var entry = pd[sid];
        if (!entry) return;
        var lastPlayed = entry.lastPlayed;
        if (!lastPlayed) return;
        var diffDays = Math.floor((Date.now() - new Date(lastPlayed).getTime()) / 86400000);
        if (diffDays <= 0) return;
        var decay = Math.min(diffDays * 15, entry.mood || 80);
        if (decay <= 0) return;
        pd[sid] = Object.assign({}, entry, { mood: Math.max(0, (entry.mood || 80) - decay) });
        changed = true;
      });

      // Pebble happyDays streak check (once per day)
      if (pd.pebble) {
        var pb = pd.pebble;
        if (pb.lastMoodDate !== today) {
          var streakContinues = pb.lastMoodDate === yesterday && (pb.mood || 0) >= 80;
          var newDays = streakContinues ? (pb.happyDays || 0) + 1 : 0;
          var isShiny = newDays >= 7;
          pd.pebble = Object.assign({}, pb, {
            happyDays: newDays,
            lastMoodDate: today,
            shiny: pb.shiny || isShiny,
          });
          changed = true;
        }
      }

      if (!changed) return prev;
      return Object.assign({}, prev, { petData: pd });
    });

    // Streak shield: if a day was missed and shield is owned, consume 1 shield to preserve streak
    setProfile(function(prev) {
      var pu = prev.powerups || {};
      if ((pu['pu-shield'] || 0) < 1) return prev;
      // Find last played date across all owned pets
      var lastPlayed = null;
      (prev.ownedSpecies || []).forEach(function(sid) {
        var lp = ((prev.petData || {})[sid] || {}).lastPlayed;
        if (lp && (!lastPlayed || lp > lastPlayed)) lastPlayed = lp;
      });
      if (!lastPlayed) return prev;
      var today = new Date().toISOString().slice(0, 10);
      var yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      // Only activate shield if last activity was exactly yesterday (1-day gap)
      if (lastPlayed >= yesterday) return prev; // played yesterday or today — no gap
      if (lastPlayed < new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10)) return prev; // >1 day gap — shield can't help
      var newPu = Object.assign({}, pu);
      newPu['pu-shield'] = Math.max(0, (newPu['pu-shield'] || 0) - 1);
      return Object.assign({}, prev, { powerups: newPu });
    });
  }, []);

  function startLevel(level) {
    setRoute({ name: 'game', mode: level.mode === 'boss' ? 'type' : level.mode, word: level.word, levelId: level.id });
  }

  function startMode(mode) {
    if (mode === 'coding') { setRoute({ name: 'game', mode: 'coding', word: 'L1' }); return; }
    var pool = getWordsForDifficulty(settings.difficulty || 'med');
    var w = pool[Math.floor(Math.random() * pool.length)].word;
    setRoute({ name: 'game', mode: mode, word: w });
  }

  function finishGame(stars, accuracy) {
    var completedId = route.levelId;
    var baseCoins = stars === 3 ? 15 : stars === 2 ? 10 : 5;
    var speciesId = profile.activePetId;
    var capturedRoute = route;

    // Power-up: Coin Booster doubles coins; Star Booster guarantees min 2 stars
    var powerups = profile.powerups || {};
    var usedX2 = (powerups['pu-x2'] || 0) > 0;
    var usedStar = (powerups['pu-star'] || 0) > 0 && stars < 2;
    if (usedStar) stars = 2;
    var coinsEarned = usedX2 ? baseCoins * 2 : baseCoins;

    var nextLevels = levels;
    if (completedId) {
      setLevels(function(prev) {
        var next = prev.map(function(l) {
          if (l.id === completedId) return Object.assign({}, l, { done: true, stars: stars, current: false });
          return l;
        });
        var doneIdx = next.findIndex(function(l) { return l.id === completedId; });
        if (doneIdx !== -1 && doneIdx + 1 < next.length && next[doneIdx + 1].locked) {
          next[doneIdx + 1] = Object.assign({}, next[doneIdx + 1], { locked: false, current: true });
        }
        nextLevels = next;
        return next;
      });
    }

    var uniqueSpellingDone = nextLevels.filter(function(l) { return l.done && l.mode !== 'coding'; }).length;
    var codingDone = nextLevels.filter(function(l) { return l.mode === 'coding' && l.done; }).length;

    setProfile(function(prev) {
      var moodBoost = stars === 3 ? 20 : stars === 2 ? 15 : 10;
      var pd = Object.assign({}, prev.petData || {});

      if (speciesId && pd[speciesId]) {
        var entry = Object.assign({}, pd[speciesId]);
        entry.mood = Math.min(100, (entry.mood || 80) + moodBoost);
        entry.lastPlayed = new Date().toISOString().slice(0, 10);

        if (speciesId === 'ember' && capturedRoute.mode === 'speed') {
          entry.speedPlays = (entry.speedPlays || 0) + 1;
          if (entry.speedPlays >= 20) entry.shiny = true;
        }
        if (speciesId === 'aqua' && accuracy != null && accuracy >= 0.9) {
          entry.precisionLevels = (entry.precisionLevels || 0) + 1;
          if (entry.precisionLevels >= 30) entry.shiny = true;
        }
        if (speciesId === 'sprout') {
          if (uniqueSpellingDone >= 30) entry.shiny = true;
        }
        if (speciesId === 'cosmo') {
          if (codingDone >= 3) entry.shiny = true;
        }
        pd[speciesId] = entry;
      }

      if (pd.petal && (prev.feedCount || 0) >= 15) {
        pd.petal = Object.assign({}, pd.petal, { shiny: true });
      }

      // Consume used power-ups
      var pu = Object.assign({}, prev.powerups || {});
      if (usedX2) pu['pu-x2'] = Math.max(0, (pu['pu-x2'] || 0) - 1);
      if (usedStar) pu['pu-star'] = Math.max(0, (pu['pu-star'] || 0) - 1);

      var today = new Date().toISOString().slice(0, 10);
      var newStreak = completedId
        ? (prev.lastStreakDate === today ? prev.streak : prev.streak + 1)
        : prev.streak;
      var newStreakDate = completedId ? today : prev.lastStreakDate;
      return Object.assign({}, prev, {
        totalStars: prev.totalStars + (completedId ? stars : 0),
        words: (prev.words || 0) + (completedId && capturedRoute.mode !== 'coding' ? 1 : 0),
        streak: newStreak,
        lastStreakDate: newStreakDate,
        coins: (prev.coins || 0) + coinsEarned,
        petData: pd,
        powerups: pu,
      });
    });

    setRoute({ name: 'reward', word: capturedRoute.word, stars: stars, mode: capturedRoute.mode, coins: coinsEarned });
  }

  function closeGame() { setRoute({ name: 'screen' }); }

  var currentLevel = levels.find(function(l) { return l.current; }) || levels[0];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Nunito', system-ui, sans-serif" }}>
      {!profile.starterPicked && (
        <StarterSelect profile={profile} setProfile={setProfile}/>
      )}
      <WebSidebar tab={tab} onTab={function(t) { setTab(t); setRoute({ name: 'screen' }); }}
        profile={profile} settings={settings} levels={levels} onOpenParent={onOpenParent}/>
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {route.name === 'screen' && tab === 'home' && (
          <WebHome profile={profile} levels={levels}
            onContinue={function() { startLevel(currentLevel); }}
            onPickMode={startMode}
            onOpenParent={onOpenParent}/>
        )}
        {route.name === 'screen' && tab === 'map'  && <WebMap levels={levels} onPlayLevel={startLevel}/>}
        {route.name === 'screen' && tab === 'me'   && <WebMe profile={profile} setProfile={setProfile} levels={levels} onOpenParent={onOpenParent}/>}
        {route.name === 'screen' && tab === 'code' && <WebCodeLab levels={levels} onPlayLevel={startLevel}/>}
        {route.name === 'screen' && tab === 'shop' && <WebShop profile={profile} setProfile={setProfile} levels={levels}/>}
        {route.name === 'screen' && tab === 'pet'  && profile.starterPicked && <WebPet profile={profile} setProfile={setProfile} levels={levels}/>}
        {route.name === 'game'   && <WebGame mode={route.mode} word={route.word} onClose={closeGame} onDone={finishGame}/>}
        {route.name === 'reward' && (
          <WebReward word={route.word} stars={route.stars} coins={route.coins}
            onNext={function() { setRoute({ name: 'screen' }); setTab('map'); }}
            onHome={function() { setRoute({ name: 'screen' }); setTab('home'); }}/>
        )}
      </div>
    </div>
  );
}

function WebSidebar({ tab, onTab, profile, settings, levels, onOpenParent }) {
  var avatarStyle = (settings && settings.avatarStyle) || 'animal';
  var activePetData = profile.starterPicked && profile.activePetId
    ? (profile.petData || {})[profile.activePetId] : null;
  var activePetSpec = profile.activePetId
    ? (window.PET_SPECIES || []).find(function(s) { return s.id === profile.activePetId; }) : null;
  var activePetName = activePetData ? (activePetData.name || (activePetSpec && activePetSpec.name) || 'Pet') : 'Pet';

  var items = [
    { id: 'home', label: 'Play', icon: function(c) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 12 L12 5 L20 12 V20 H14 V15 H10 V20 H4 Z" stroke={c} strokeWidth="2.2" strokeLinejoin="round"/></svg>; } },
    { id: 'map',  label: 'Journey', icon: function(c) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 6 L9 4 L15 6 L21 4 V18 L15 20 L9 18 L3 20 Z M9 4 V18 M15 6 V20" stroke={c} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/></svg>; } },
    { id: 'me',   label: 'My stuff', icon: function(c) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={c} strokeWidth="2.2"/><path d="M4 20 C4 15 8 14 12 14 C16 14 20 15 20 20" stroke={c} strokeWidth="2.2" strokeLinecap="round"/></svg>; } },
    { id: 'code', label: 'Code Lab', icon: function(c) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><polyline points="16 18 22 12 16 6" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="8 6 2 12 8 18" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>; } },
    { id: 'shop', label: 'Shop', icon: function(c) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={c} strokeWidth="2" strokeLinejoin="round"/><line x1="3" y1="6" x2="21" y2="6" stroke={c} strokeWidth="2"/><path d="M16 10a4 4 0 01-8 0" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>; } },
  ].concat(profile.starterPicked ? [
    { id: 'pet', label: activePetName, icon: function(c) { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4.5 9.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM19.5 9.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM9 13.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM15 13.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM5 20c0-2.5 3-4 7-4s7 1.5 7 4" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>; } },
  ] : []);
  return (
    <aside aria-label="Main navigation" style={{
      width: 240, flexShrink: 0, background: 'var(--surface)',
      borderRight: '1px solid var(--alpha-md)',
      display: 'flex', flexDirection: 'column', padding: 18,
      minHeight: '100vh',
    }}>
      {/* brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 18px' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--blue)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-soft)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4v16l4-4h12V4H4z" fill="white"/><circle cx="9" cy="12" r="1.5" fill="rgba(255,255,255,0.5)"/><circle cx="13" cy="12" r="1.5" fill="rgba(255,255,255,0.5)"/></svg>
        </div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 16, lineHeight: 1 }}>SpellLoop</div>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 700 }}>Kids</div>
        </div>
      </div>

      <nav role="navigation" aria-label="App sections" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map(function(it) {
          var active = tab === it.id;
          return (
            <button key={it.id} aria-current={active ? 'page' : undefined} onClick={function() { onTab(it.id); window.sfx && window.sfx.tap && window.sfx.tap(); }} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', border: 'none', cursor: 'pointer',
              background: active ? 'var(--blue-soft)' : 'transparent',
              color: active ? 'var(--blue-ink)' : 'var(--ink-soft)',
              borderRadius: 12, fontFamily: 'inherit', fontWeight: 800, fontSize: 15, textAlign: 'left',
              transition: 'background 120ms ease, color 120ms ease',
            }}
            onMouseEnter={function(e) { if (!active) e.currentTarget.style.background = 'var(--alpha-sm)'; }}
            onMouseLeave={function(e) { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              {it.icon(active ? 'var(--blue-ink)' : 'var(--ink-soft)')}
              <span>{it.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ flex: 1 }}/>

      {/* coins */}
      <div style={{ background: 'var(--yellow-soft)', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ fontSize: 24 }}>🪙</div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--yellow-ink)' }}>{profile.coins || 0}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--yellow-ink)', opacity: 0.7 }}>coins to spend</div>
        </div>
      </div>

      {/* mini pet widget */}
      {profile.starterPicked && typeof PetSprite !== 'undefined' && activePetData && (function() {
        var pm = activePetData.mood != null ? activePetData.mood : 80;
        var mc = PET_MOOD_COLORS ? PET_MOOD_COLORS[getPetMoodLabel(pm)] : { bar: 'var(--mint)', text: 'var(--mint-ink)', label: '😄 Happy' };
        var completedChapters = typeof getCompletedChapters !== 'undefined' ? getCompletedChapters(levels) : [];
        var specBg = activePetSpec ? activePetSpec.bg : 'var(--lilac-soft, #F3EEFF)';
        return (
          <button onClick={function() { onTab('pet'); window.sfx && window.sfx.tap && window.sfx.tap(); }}
            aria-label={'Go to ' + activePetName + ' pet tab'}
            style={{ background: specBg, borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, border: 'none', cursor: 'pointer', width: '100%', fontFamily: 'inherit', textAlign: 'left' }}>
            <PetSprite speciesId={profile.activePetId} completedChapters={completedChapters} mood={pm} size={42} equipped={activePetData.equipped || {}} animate={true}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: 13, color: 'var(--ink)' }}>{activePetName}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: mc.text, marginBottom: 3 }}>{mc.label}</div>
              <div style={{ height: 5, background: 'var(--alpha-sm)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: pm + '%', background: mc.bar, borderRadius: 3, transition: 'width 0.5s ease' }}/>
              </div>
            </div>
          </button>
        );
      })()}

      {/* mini profile */}
      <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 10, display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--alpha-sm)' }}>
        <DressedAvatar id={profile.avatar} size={40} style={avatarStyle} equipped={profile.equipped || {}}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 14 }}>{profile.name}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 700 }}>Level {profile.level} · Age {profile.age}</div>
        </div>
        <button onClick={onOpenParent} aria-label="Open parent area" style={{
          width: 44, height: 44, border: 'none', borderRadius: 10,
          background: 'var(--surface)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-soft)',
          transition: 'transform var(--dur-fast) var(--ease-toy), box-shadow var(--dur-fast) var(--ease-toy)',
        }}
        onMouseEnter={function(e) { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = 'var(--shadow-pop)'; }}
        onMouseLeave={function(e) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'var(--shadow-soft)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="var(--ink-soft)" strokeWidth="2"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke="var(--ink-soft)" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      </div>
    </aside>
  );
}

function WebHome({ profile, levels, onContinue, onPickMode, onOpenParent }) {
  var modes = ['click', 'drag', 'type', 'missing', 'keyboard', 'scramble', 'speed'];
  var currentLevel = levels && levels.find(function(l) { return l.current; });
  var doneCount = levels ? levels.filter(function(l) { return l.done; }).length : 0;
  var modeName = currentLevel ? (MODE_META[currentLevel.mode] || MODE_META.click).label : 'Spell it';
  var currentWord = currentLevel ? currentLevel.word : '...';
  var levelNum = currentLevel ? currentLevel.id : 1;

  return (
    <div style={{ padding: '32px 40px 48px', background: 'linear-gradient(180deg, #FFF6EA 0%, var(--bg) 400px)', minHeight: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>
          {new Date().toLocaleDateString('en', { weekday: 'long' })} · {new Date().toLocaleDateString('en', { month: 'long', day: 'numeric' })}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontSize: 40, fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Hi, {profile.name}! 👋</h1>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', background: 'var(--surface)', borderRadius: 14, padding: '10px 18px', boxShadow: 'var(--shadow-soft)' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--coral-ink)' }}>🔥 {profile.streak} <span style={{ color: 'var(--ink-mute)', fontWeight: 700 }}>streak</span></span>
            <span style={{ width: 1, height: 20, background: 'var(--alpha-md)', display: 'block' }}/>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--yellow-ink)' }}>⭐ {profile.totalStars} <span style={{ color: 'var(--ink-mute)', fontWeight: 700 }}>stars</span></span>
            <span style={{ width: 1, height: 20, background: 'var(--alpha-md)', display: 'block' }}/>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--mint-ink)' }}>📚 {profile.words} <span style={{ color: 'var(--ink-mute)', fontWeight: 700 }}>words</span></span>
          </div>
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
        <svg width="280" height="280" viewBox="0 0 280 280" aria-hidden="true" style={{ position: 'absolute', right: -20, top: -80, opacity: 0.22 }}>
          <circle cx="190" cy="100" r="60" fill="var(--yellow)"/>
          <circle cx="90" cy="200" r="40" fill="var(--pink)"/>
          <rect x="170" y="180" width="50" height="50" rx="12" fill="var(--mint)"/>
        </svg>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', opacity: 0.9 }}>
            Continue · Chapter 1 · Level {levelNum}
          </div>
          <div className="game-mode-label" style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.05, margin: '6px 0' }}>{modeName}</div>
          <div style={{ fontSize: 18, opacity: 0.95, fontWeight: 700, marginBottom: 18 }}>
            Today's word is <span style={{ background: 'rgba(255,255,255,0.18)', padding: '2px 10px', borderRadius: 8, fontWeight: 900 }}>{currentWord}</span>
          </div>
          <button className="btn-3d" onClick={onContinue} style={{
            background: 'white', color: 'var(--blue-ink)', border: 'none',
            padding: '16px 28px', borderRadius: 999, fontSize: 17, fontWeight: 900,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>▶ Continue learning</button>
        </div>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: 20 }}>
          <div className="word-display" aria-label={'Word: ' + currentWord} style={{
            width: 160, height: 160, borderRadius: 40,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: currentWord.length > 4 ? 'var(--fs-2xl)' : 'var(--fs-hero)', fontWeight: 900,
            letterSpacing: '0.04em',
          }}>{currentWord}</div>
        </div>
      </div>

      {/* practice modes */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Practice a mode</h2>
        <span style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 700 }}>Quick play · one word</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginBottom: 28 }}>
        {modes.map(function(m) { return <WebModeCard key={m} mode={m} onClick={function() { onPickMode(m); }}/>; })}
      </div>

      {/* recent words + daily goal */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>Recent words</h3>
          </div>
          <div style={{ display: 'flex', gap: 10, overflow: 'auto' }}>
            {(levels || []).filter(function(l) { return l.done && l.mode !== 'coding'; }).slice(-7).reverse().map(function(l) {
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
            <div className="progress-fill" style={{ width: `${levels && levels.length ? (doneCount / levels.length * 100) : 0}%`, background: 'var(--yellow)' }}/>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700, marginTop: 8 }}>
            {doneCount === levels.length ? 'Chapter 1 complete! 🎉' : `${(levels || []).length - doneCount} levels remaining`}
          </div>
        </div>
      </div>
    </div>
  );
}

function WebModeCard({ mode, onClick }) {
  var m = MODE_META[mode];
  var descs = { click: 'Pick each letter', drag: 'Drag into order', type: 'Use the keyboard', missing: 'Find the gap', keyboard: 'Find keys fast', scramble: 'Tap in order', speed: 'Race the clock', coding: 'Build the path' };
  return (
    <button onClick={onClick} style={{
      background: 'var(--surface)', border: 'none', cursor: 'pointer',
      borderRadius: 16, padding: 18, textAlign: 'left',
      boxShadow: 'var(--shadow-toy)', fontFamily: 'inherit',
      display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'transform var(--dur-fast) var(--ease-toy), box-shadow var(--dur-fast) var(--ease-toy)',
      willChange: 'transform',
    }}
    onMouseEnter={function(e) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; }}
    onMouseLeave={function(e) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-toy)'; }}
    onMouseDown={function(e) { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-press)'; }}
    onMouseUp={function(e) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 14, background: m.soft, color: m.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900 }}>{m.icon}</div>
      <div>
        <div style={{ fontWeight: 900, fontSize: 17, color: 'var(--ink)' }}>{m.label}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 700, marginTop: 2 }}>{descs[mode] || ''}</div>
      </div>
    </button>
  );
}

function isSpeciesUnlocked(species, ownedSpecies, levels) {
  if ((ownedSpecies || []).includes(species.id)) return true;
  if (species.unlockCodeLab) {
    return (levels || []).filter(function(l) { return l.mode === 'coding' && l.done; }).length >= 3;
  }
  if (species.unlockLevelId) {
    return (levels || []).some(function(l) { return l.id === species.unlockLevelId && l.done; });
  }
  return false;
}

function getSpeciesDisplayPrice(species, ownedSpecies) {
  if ((ownedSpecies || []).includes(species.id)) return null;
  if (species.isStarter && species.starterCost != null) return species.starterCost;
  return species.cost;
}

function WebShop({ profile, setProfile, levels }) {
  var [shopTab, setShopTab] = React.useState('species');
  var coins = profile.coins || 0;
  var inventory = profile.inventory || [];
  var ownedSpecies = profile.ownedSpecies || [];
  var activePetId = profile.activePetId;

  var allSpecies = window.PET_SPECIES || [];
  var outfitItems = window.PET_OUTFIT_ITEMS || [];
  var roomItems = window.PET_ROOMS || [];
  var toyItems = window.PET_TOYS || [];
  var treatItems = window.PET_TREATS || [];
  var avatarItems = window.AVATAR_ITEMS || [];
  var powerUpItems = window.POWER_UPS || [];

  var activePetData = activePetId ? ((profile.petData || {})[activePetId] || {}) : {};
  var activePetEquipped = activePetData.equipped || {};
  var activePetRoom = activePetData.room || null;
  var activePetToys = activePetData.toys || [];
  var activePetName = activePetData.name || activePetId || 'pet';
  var completedChapters = typeof getCompletedChapters !== 'undefined' ? getCompletedChapters(levels) : [];

  function buySpecies(species) {
    var price = getSpeciesDisplayPrice(species, ownedSpecies);
    if (price == null || coins < price) return;
    window.sfx?.complete();
    setProfile(function(prev) {
      var pd = Object.assign({}, prev.petData || {});
      if (!pd[species.id]) {
        var entry = { name: species.name, mood: 80, lastPlayed: null, equipped: {}, shiny: false, room: null, toys: [] };
        if (species.shinyKey) entry[species.shinyKey] = 0;
        if (species.id === 'pebble') { entry.happyDays = 0; entry.lastMoodDate = null; }
        pd[species.id] = entry;
      }
      return Object.assign({}, prev, {
        coins: (prev.coins || 0) - price,
        ownedSpecies: (prev.ownedSpecies || []).concat(species.id),
        petData: pd,
      });
    });
  }

  function setActive(speciesId) {
    window.sfx?.tap();
    setProfile(function(prev) {
      return Object.assign({}, prev, { activePetId: speciesId });
    });
  }

  function buyOutfit(item) {
    if (coins < item.price || inventory.includes(item.id)) return;
    window.sfx?.complete();
    setProfile(function(prev) {
      return Object.assign({}, prev, {
        coins: (prev.coins || 0) - item.price,
        inventory: (prev.inventory || []).concat(item.id),
      });
    });
  }

  function equipOutfit(item) {
    if (!activePetId) return;
    window.sfx?.tap();
    setProfile(function(prev) {
      var pd = Object.assign({}, prev.petData || {});
      var entry = Object.assign({}, pd[prev.activePetId] || {});
      var prevEq = Object.assign({}, entry.equipped || {});
      prevEq[item.slot] = prevEq[item.slot] === item.id ? null : item.id;
      entry.equipped = prevEq;
      pd[prev.activePetId] = entry;
      return Object.assign({}, prev, { petData: pd });
    });
  }

  function buyRoom(item) {
    if (coins < item.price || inventory.includes(item.id)) return;
    window.sfx?.complete();
    setProfile(function(prev) {
      return Object.assign({}, prev, {
        coins: (prev.coins || 0) - item.price,
        inventory: (prev.inventory || []).concat(item.id),
      });
    });
  }

  function equipRoom(item) {
    if (!activePetId || !inventory.includes(item.id)) return;
    window.sfx?.tap();
    setProfile(function(prev) {
      var pd = Object.assign({}, prev.petData || {});
      var entry = Object.assign({}, pd[prev.activePetId] || {});
      entry.room = entry.room === item.id ? null : item.id;
      pd[prev.activePetId] = entry;
      return Object.assign({}, prev, { petData: pd });
    });
  }

  function buyToy(item) {
    if (coins < item.price || inventory.includes(item.id)) return;
    window.sfx?.complete();
    setProfile(function(prev) {
      return Object.assign({}, prev, {
        coins: (prev.coins || 0) - item.price,
        inventory: (prev.inventory || []).concat(item.id),
      });
    });
  }

  function equipToy(item) {
    if (!activePetId || !inventory.includes(item.id)) return;
    window.sfx?.tap();
    setProfile(function(prev) {
      var pd = Object.assign({}, prev.petData || {});
      var entry = Object.assign({}, pd[prev.activePetId] || {});
      var toys = (entry.toys || []).slice();
      var idx = toys.indexOf(item.id);
      if (idx !== -1) { toys.splice(idx, 1); }
      else if (toys.length < 3) { toys.push(item.id); }
      entry.toys = toys;
      pd[prev.activePetId] = entry;
      return Object.assign({}, prev, { petData: pd });
    });
  }

  function buyTreat(item) {
    if (coins < item.price) return;
    window.sfx?.complete();
    setProfile(function(prev) {
      var t = Object.assign({}, prev.treats || {});
      t[item.id] = (t[item.id] || 0) + 1;
      return Object.assign({}, prev, { coins: (prev.coins || 0) - item.price, treats: t });
    });
  }

  function buyAvatarItem(item) {
    if (coins < item.price || inventory.includes(item.id)) return;
    window.sfx?.complete();
    setProfile(function(prev) {
      return Object.assign({}, prev, {
        coins: (prev.coins || 0) - item.price,
        inventory: (prev.inventory || []).concat(item.id),
      });
    });
  }

  function equipAvatarItem(item) {
    if (!inventory.includes(item.id)) return;
    window.sfx?.tap();
    setProfile(function(prev) {
      var eq = Object.assign({}, prev.equipped || {});
      eq[item.slot] = eq[item.slot] === item.id ? null : item.id;
      return Object.assign({}, prev, { equipped: eq });
    });
  }

  function buyPowerUp(item) {
    if (coins < item.price) return;
    window.sfx?.complete();
    setProfile(function(prev) {
      var pu = Object.assign({}, prev.powerups || {});
      pu[item.id] = (pu[item.id] || 0) + 1;
      return Object.assign({}, prev, { coins: (prev.coins || 0) - item.price, powerups: pu });
    });
  }

  var shopTabs = [
    { id: 'species', label: '🥚 Species' },
    { id: 'outfits', label: '🎩 Outfits' },
    { id: 'rooms',   label: '🏠 Rooms' },
    { id: 'toys',    label: '🎮 Toys' },
    { id: 'treats',  label: '🍎 Treats' },
    { id: 'avatar',  label: '🎨 Avatar' },
    { id: 'powerups',label: '⚡ Boosts' },
  ];

  // Shared compact grid card renderer for non-species tabs
  function ItemCard({ item, owned, isActive, canAfford, countOwned, onBuy, onAction, actionLabel, actionDisabled, actionColor }) {
    return (
      <div style={{
        background: isActive ? 'var(--blue-soft)' : 'var(--surface)',
        borderRadius: 16, padding: '16px 12px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 6, boxShadow: 'var(--shadow-soft)', textAlign: 'center',
        border: isActive ? '2px solid var(--blue)' : '2px solid var(--alpha-sm)',
        transition: 'border-color 150ms, background 150ms', position: 'relative',
      }}>
        {countOwned > 0 && (
          <div aria-label={'You own ' + countOwned} style={{ position: 'absolute', top: 8, right: 8, background: 'var(--blue)', color: 'white', borderRadius: 999, fontSize: 11, fontWeight: 900, padding: '2px 7px' }}>×{countOwned}</div>
        )}
        <div style={{ fontSize: 36, lineHeight: 1 }} aria-hidden="true">{item.emoji}</div>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.2 }}>{item.name}</div>
        {item.desc && <div style={{ fontSize: 10, color: 'var(--ink-mute)', fontWeight: 700, lineHeight: 1.3 }}>{item.desc}</div>}
        {!owned ? (
          <>
            <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--yellow-ink)' }} aria-label={item.price + ' coins'}>🪙 {item.price}</div>
            <button onClick={onBuy} disabled={!canAfford}
              aria-label={(canAfford ? 'Buy ' : 'Cannot afford ') + item.name + ' for ' + item.price + ' coins'}
              style={{
                width: '100%', padding: '7px 0', borderRadius: 10, border: 'none',
                background: canAfford ? 'var(--yellow)' : 'var(--alpha-sm)',
                color: canAfford ? 'var(--yellow-ink)' : 'var(--ink-mute)',
                fontFamily: 'inherit', fontWeight: 800, fontSize: 12,
                cursor: canAfford ? 'pointer' : 'default',
              }}>{canAfford ? '🛒 Buy' : 'Need ' + (item.price - coins) + ' more'}</button>
          </>
        ) : onAction ? (
          <button onClick={onAction} disabled={actionDisabled}
            aria-label={actionLabel + ' ' + item.name}
            aria-pressed={isActive || undefined}
            style={{
              width: '100%', padding: '7px 0', borderRadius: 10, border: 'none',
              background: actionDisabled ? 'var(--alpha-sm)' : (actionColor || 'var(--mint-soft)'),
              color: actionDisabled ? 'var(--ink-mute)' : (actionColor ? 'white' : 'var(--mint-ink)'),
              fontFamily: 'inherit', fontWeight: 800, fontSize: 12,
              cursor: actionDisabled ? 'default' : 'pointer',
              transition: 'background 150ms',
            }}>{actionLabel}</button>
        ) : (
          <div role="status" style={{ fontSize: 11, fontWeight: 800, color: 'var(--mint-ink)', background: 'var(--mint-soft)', borderRadius: 8, padding: '4px 10px' }}>✓ Owned</div>
        )}
      </div>
    );
  }

  function CompactGrid({ children }) {
    return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>{children}</div>;
  }

  return (
    <div style={{ padding: '32px 40px 48px', minHeight: '100%', background: 'linear-gradient(180deg, var(--yellow-soft) 0%, var(--bg) 320px)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 40, fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.02em' }}>🛍 Pet Shop</h1>
          <p style={{ fontSize: 15, color: 'var(--ink-soft)', fontWeight: 700, margin: 0 }}>Collect pets, gear, and goodies!</p>
        </div>
        <div style={{ background: 'white', borderRadius: 18, padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow-toy)' }}>
          <span style={{ fontSize: 32 }}>🪙</span>
          <div>
            <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--yellow-ink)', lineHeight: 1 }}>{coins}</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: 0.5 }}>coins</div>
          </div>
        </div>
      </div>

      {/* Scrollable pill tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, overflowX: 'auto', paddingBottom: 4 }}>
        {shopTabs.map(function(t) {
          var active = shopTab === t.id;
          return (
            <button key={t.id} onClick={function() { setShopTab(t.id); window.sfx?.tap(); }} style={{
              flexShrink: 0, padding: '10px 20px', borderRadius: 999, border: 'none',
              background: active ? 'var(--blue)' : 'var(--surface)',
              color: active ? 'white' : 'var(--ink-soft)',
              fontFamily: 'inherit', fontWeight: 800, fontSize: 14, cursor: 'pointer',
              boxShadow: active ? 'var(--shadow-toy)' : 'var(--shadow-soft)',
              transition: 'background 150ms, color 150ms',
            }}>{t.label}</button>
          );
        })}
      </div>

      {/* Species */}
      {shopTab === 'species' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {allSpecies.map(function(species) {
            var owned = ownedSpecies.includes(species.id);
            var unlocked = isSpeciesUnlocked(species, ownedSpecies, levels);
            var isActive = activePetId === species.id;
            var price = getSpeciesDisplayPrice(species, ownedSpecies);
            var canAfford = price != null && coins >= price;

            if (!unlocked && !owned) {
              var hint = species.unlockCodeLab ? 'Complete all Code Lab levels'
                : species.unlockLevelId === 24 ? 'Beat Ch.3 boss (Level 24)'
                : species.unlockLevelId === 40 ? 'Beat Ch.5 boss (Level 40)'
                : species.unlockLevelId === 48 ? 'Beat Ch.6 boss (Level 48)'
                : 'Keep playing to unlock';
              return (
                <div key={species.id} style={{
                  background: 'var(--surface)', borderRadius: 20, padding: 20, textAlign: 'center',
                  border: '2px solid var(--alpha-sm)', opacity: 0.6,
                }}>
                  <div style={{ fontSize: 64, marginBottom: 8, filter: 'grayscale(1)' }}>🥚</div>
                  <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 4, color: 'var(--ink-mute)' }}>???</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 700, marginBottom: 8 }}>{species.typeIcon} {species.type}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 700, background: 'var(--alpha-sm)', borderRadius: 8, padding: '6px 10px' }}>🔒 {hint}</div>
                </div>
              );
            }

            var petEntry = (profile.petData || {})[species.id];
            var petMood = petEntry ? (petEntry.mood != null ? petEntry.mood : 80) : 80;
            return (
              <div key={species.id} style={{
                background: isActive ? species.bg : 'var(--surface)',
                borderRadius: 20, padding: 20, textAlign: 'center',
                border: isActive ? '2px solid ' + species.color : '2px solid var(--alpha-sm)',
                boxShadow: isActive ? 'var(--shadow-toy)' : 'var(--shadow-soft)',
                transition: 'border-color 150ms, background 150ms',
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                  {typeof PetSprite !== 'undefined' && owned ? (
                    <PetSprite speciesId={species.id} completedChapters={completedChapters}
                      mood={petMood} size={80} equipped={petEntry ? (petEntry.equipped || {}) : {}} animate={false}/>
                  ) : (
                    <div style={{ fontSize: 64 }}>🥚</div>
                  )}
                </div>
                <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 2 }}>{species.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 700, marginBottom: 4 }}>{species.typeIcon} {species.type}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700, marginBottom: 12, lineHeight: 1.4 }}>{species.tagline}</div>
                {owned ? (
                  isActive ? (
                    <div style={{ padding: '9px 0', borderRadius: 10, background: species.color, color: 'white', fontWeight: 900, fontSize: 13 }}>✓ Active</div>
                  ) : (
                    <button onClick={function() { setActive(species.id); }} style={{
                      width: '100%', padding: '9px 0', borderRadius: 10, border: 'none',
                      background: 'var(--mint-soft)', color: 'var(--mint-ink)',
                      fontFamily: 'inherit', fontWeight: 800, fontSize: 13, cursor: 'pointer',
                    }}>Switch to {species.name}</button>
                  )
                ) : (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--yellow-ink)', marginBottom: 8 }}>🪙 {price}</div>
                    <button onClick={function() { buySpecies(species); }} disabled={!canAfford} style={{
                      width: '100%', padding: '9px 0', borderRadius: 10, border: 'none',
                      background: canAfford ? 'var(--yellow)' : 'var(--alpha-sm)',
                      color: canAfford ? 'var(--yellow-ink)' : 'var(--ink-mute)',
                      fontFamily: 'inherit', fontWeight: 800, fontSize: 13,
                      cursor: canAfford ? 'pointer' : 'default',
                    }}>{canAfford ? '🛒 Adopt' : 'Need ' + (price - coins) + ' more 🪙'}</button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Outfits — keep sticky preview layout */}
      {shopTab === 'outfits' && (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32, alignItems: 'start' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 20, padding: 20, textAlign: 'center', position: 'sticky', top: 32, boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Active pet</div>
            {typeof PetSprite !== 'undefined' && activePetId && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <PetSprite speciesId={activePetId} completedChapters={completedChapters}
                  mood={activePetData.mood || 80} size={100} equipped={activePetEquipped} animate={true}/>
              </div>
            )}
            {!activePetId && <div style={{ fontSize: 40, marginBottom: 10 }}>🥚</div>}
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 4 }}>{activePetName}</div>
            {Object.values(activePetEquipped).some(Boolean) && (
              <button onClick={function() {
                if (!activePetId) return;
                setProfile(function(prev) {
                  var pd = Object.assign({}, prev.petData || {});
                  var entry = Object.assign({}, pd[prev.activePetId] || {});
                  entry.equipped = {};
                  pd[prev.activePetId] = entry;
                  return Object.assign({}, prev, { petData: pd });
                });
              }} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--alpha-md)', background: 'transparent', color: 'var(--ink-mute)', fontFamily: 'inherit', fontWeight: 700, fontSize: 12, cursor: 'pointer', marginTop: 8 }}>
                Remove all
              </button>
            )}
          </div>
          <CompactGrid>
            {outfitItems.map(function(item) {
              var owned = inventory.includes(item.id);
              var isEquipped = activePetEquipped[item.slot] === item.id;
              return (
                <ItemCard key={item.id} item={item} owned={owned} isActive={isEquipped} canAfford={coins >= item.price}
                  onBuy={function() { buyOutfit(item); }}
                  onAction={function() { equipOutfit(item); }}
                  actionLabel={isEquipped ? '✓ Equipped' : '+ Equip'}
                  actionColor={isEquipped ? 'var(--blue)' : null}/>
              );
            })}
          </CompactGrid>
        </div>
      )}

      {/* Rooms */}
      {shopTab === 'rooms' && (
        <div>
          {activePetId && <div style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 700, marginBottom: 16 }}>Equipping for: <strong>{activePetName}</strong></div>}
          <CompactGrid>
            {roomItems.map(function(item) {
              var owned = inventory.includes(item.id);
              var isEquipped = activePetRoom === item.id;
              return (
                <ItemCard key={item.id} item={item} owned={owned} isActive={isEquipped} canAfford={coins >= item.price}
                  onBuy={function() { buyRoom(item); }}
                  onAction={activePetId ? function() { equipRoom(item); } : null}
                  actionLabel={isEquipped ? '✓ Active' : 'Set Room'}
                  actionColor={isEquipped ? 'var(--blue)' : null}
                  actionDisabled={!activePetId}/>
              );
            })}
          </CompactGrid>
        </div>
      )}

      {/* Toys */}
      {shopTab === 'toys' && (
        <div>
          {activePetId && (
            <div style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 700, marginBottom: 16 }}>
              Equipping for: <strong>{activePetName}</strong> · {activePetToys.length}/3 toys equipped
            </div>
          )}
          <CompactGrid>
            {toyItems.map(function(item) {
              var owned = inventory.includes(item.id);
              var isEquipped = activePetToys.includes(item.id);
              var toysFull = activePetToys.length >= 3 && !isEquipped;
              return (
                <ItemCard key={item.id} item={item} owned={owned} isActive={isEquipped} canAfford={coins >= item.price}
                  onBuy={function() { buyToy(item); }}
                  onAction={activePetId ? function() { equipToy(item); } : null}
                  actionLabel={isEquipped ? '✓ On' : toysFull ? '3/3 Full' : '+ Equip'}
                  actionColor={isEquipped ? 'var(--blue)' : null}
                  actionDisabled={!activePetId || (!isEquipped && toysFull)}/>
              );
            })}
          </CompactGrid>
        </div>
      )}

      {/* Treats */}
      {shopTab === 'treats' && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 700, marginBottom: 16 }}>Buy treats to stock up — use them from the Pet tab for bigger mood boosts!</div>
          <CompactGrid>
            {treatItems.map(function(item) {
              var count = (profile.treats || {})[item.id] || 0;
              return (
                <ItemCard key={item.id} item={item} owned={false} countOwned={count} canAfford={coins >= item.price}
                  onBuy={function() { buyTreat(item); }}/>
              );
            })}
          </CompactGrid>
        </div>
      )}

      {/* Avatar */}
      {shopTab === 'avatar' && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 700, marginBottom: 16 }}>Accessories shown on your avatar in My Stuff.</div>
          <CompactGrid>
            {avatarItems.map(function(item) {
              var owned = inventory.includes(item.id);
              var isEquipped = (profile.equipped || {})[item.slot] === item.id;
              return (
                <ItemCard key={item.id} item={item} owned={owned} isActive={isEquipped} canAfford={coins >= item.price}
                  onBuy={function() { buyAvatarItem(item); }}
                  onAction={function() { equipAvatarItem(item); }}
                  actionLabel={isEquipped ? '✓ Wearing' : '+ Wear'}
                  actionColor={isEquipped ? 'var(--blue)' : null}/>
              );
            })}
          </CompactGrid>
        </div>
      )}

      {/* Power-ups */}
      {shopTab === 'powerups' && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 700, marginBottom: 16 }}>Boosts activate automatically when you play — shields protect your streak, coin boosters double your earnings!</div>
          <CompactGrid>
            {powerUpItems.map(function(item) {
              var count = (profile.powerups || {})[item.id] || 0;
              return (
                <ItemCard key={item.id} item={item} owned={false} countOwned={count} canAfford={coins >= item.price}
                  onBuy={function() { buyPowerUp(item); }}/>
              );
            })}
          </CompactGrid>
        </div>
      )}
    </div>
  );
}

var CODING_LEVEL_INFO = {
  'L1': { title: 'Level 1 — First Steps', desc: 'Guide the player in just 2 moves.', emoji: '🟢', difficulty: 'Beginner' },
  'L2': { title: 'Level 2 — Find the Route', desc: '3 moves. Think before you tap.', emoji: '🟡', difficulty: 'Easy' },
  'L3': { title: 'Level 3 — Plan Ahead', desc: '5 moves to reach the star.', emoji: '🔴', difficulty: 'Medium' },
};

function WebCodeLab({ levels, onPlayLevel }) {
  var codingLevels = (levels || []).filter(function(l) { return l.mode === 'coding'; });

  return (
    <div style={{ padding: '32px 40px 48px', background: 'linear-gradient(180deg, var(--mint-soft) 0%, var(--bg) 360px)', minHeight: '100%' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>New game mode</div>
        <h1 style={{ fontSize: 40, fontWeight: 900, margin: '0 0 10px', letterSpacing: '-0.02em' }}>🤖 The Code Lab</h1>
        <p style={{ fontSize: 16, color: 'var(--ink-soft)', fontWeight: 700, margin: 0, maxWidth: 520 }}>
          Build a sequence of moves to guide the player to the star. No spelling — just logic and planning!
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 760, marginBottom: 40 }}>
        {codingLevels.map(function(lv) {
          var info = CODING_LEVEL_INFO[lv.word] || {};
          var locked = lv.locked && !lv.current && !lv.done;
          return (
            <button key={lv.id} onClick={function() { if (!locked) onPlayLevel(lv); }}
              disabled={locked}
              style={{
                background: locked ? 'var(--surface)' : 'white',
                borderRadius: 20, padding: 24, textAlign: 'left',
                border: lv.done ? '2px solid var(--mint)' : '2px solid var(--alpha-sm)',
                boxShadow: locked ? 'none' : 'var(--shadow-toy)',
                cursor: locked ? 'default' : 'pointer',
                opacity: locked ? 0.45 : 1,
                fontFamily: 'inherit',
                transition: 'transform 150ms var(--ease-toy), box-shadow 150ms',
              }}
              onMouseEnter={function(e) { if (!locked) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; } }}
              onMouseLeave={function(e) { if (!locked) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-toy)'; } }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>{locked ? '🔒' : info.emoji}</div>
              <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 2 }}>{info.title}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>{info.difficulty}</div>
              <div style={{ fontSize: 14, color: 'var(--ink-soft)', fontWeight: 700, marginBottom: 16 }}>{info.desc}</div>
              {lv.done ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StarRow filled={lv.stars} size={16} gap={2}/>
                  <span style={{ fontSize: 12, color: 'var(--mint-ink)', fontWeight: 800 }}>Complete!</span>
                </div>
              ) : !locked ? (
                <div style={{ background: 'var(--mint-soft)', color: 'var(--mint-ink)', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 800, display: 'inline-block' }}>▶ Play</div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 700 }}>Finish previous level to unlock</div>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ maxWidth: 620 }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 16px' }}>How it works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          {[
            { n: '1', title: 'Add moves', desc: 'Tap direction buttons to queue up your sequence.' },
            { n: '2', title: 'Run it', desc: 'Watch the player follow your instructions step by step.' },
            { n: '3', title: 'Reach the ⭐', desc: 'Adjust your sequence until the player gets there.' },
          ].map(function(s) {
            return (
              <div key={s.n} style={{ background: 'var(--surface)', borderRadius: 14, padding: 16 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--mint)', color: 'var(--mint-ink)', fontWeight: 900, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>{s.n}</div>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 700 }}>{s.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WebPet({ profile, setProfile, levels }) {
  var activePetId = profile.activePetId;
  var ownedSpecies = profile.ownedSpecies || [];
  var coins = profile.coins || 0;
  var allSpecies = window.PET_SPECIES || [];
  var completedChapters = typeof getCompletedChapters !== 'undefined' ? getCompletedChapters(levels) : [];

  var activePetSpec = allSpecies.find(function(s) { return s.id === activePetId; });
  var activePetData = activePetId ? ((profile.petData || {})[activePetId] || {}) : {};
  var petMood = activePetData.mood != null ? activePetData.mood : 80;
  var petName = activePetData.name || (activePetSpec && activePetSpec.name) || 'Pet';
  var petEquipped = activePetData.equipped || {};
  var isShiny = activePetData.shiny || false;

  var stage = typeof getPetStage !== 'undefined' ? getPetStage(completedChapters, isShiny) : 'egg';
  var moodLabel = typeof getPetMoodLabel !== 'undefined' ? getPetMoodLabel(petMood) : 'happy';
  var moodColors = (typeof PET_MOOD_COLORS !== 'undefined' && PET_MOOD_COLORS[moodLabel]) || { bar: 'var(--mint)', text: 'var(--mint-ink)', label: '😄 Happy' };
  var next = typeof getPetNextStage !== 'undefined' ? getPetNextStage(completedChapters) : { chapter: 1, label: 'Complete Chapter 1 to hatch!' };

  var [editingName, setEditingName] = React.useState(false);
  var [nameInput, setNameInput] = React.useState(petName);

  function feed() {
    if (coins < 5 || petMood >= 100 || !activePetId) return;
    window.sfx?.complete();
    setProfile(function(prev) {
      var newFeedCount = (prev.feedCount || 0) + 1;
      var pd = Object.assign({}, prev.petData || {});
      var entry = Object.assign({}, pd[prev.activePetId] || {});
      entry.mood = Math.min(100, (entry.mood || 80) + 20);
      entry.lastPlayed = new Date().toISOString().slice(0, 10);
      pd[prev.activePetId] = entry;
      if (pd.petal && newFeedCount >= 15) pd.petal = Object.assign({}, pd.petal, { shiny: true });
      return Object.assign({}, prev, {
        coins: Math.max(0, (prev.coins || 0) - 5),
        feedCount: newFeedCount,
        petData: pd,
      });
    });
  }

  function saveName() {
    var n = nameInput.trim() || (activePetSpec && activePetSpec.name) || 'Pet';
    if (!activePetId) return;
    setProfile(function(prev) {
      var pd = Object.assign({}, prev.petData || {});
      pd[prev.activePetId] = Object.assign({}, pd[prev.activePetId] || {}, { name: n });
      return Object.assign({}, prev, { petData: pd });
    });
    setEditingName(false);
  }

  function switchActive(sid) {
    window.sfx?.tap();
    setProfile(function(prev) { return Object.assign({}, prev, { activePetId: sid }); });
  }

  var stageLabels = { egg: '🥚 Egg', baby: '🐣 Baby', kid: '🐥 Kid', adult: '🐾 Adult', shiny: '✨ Shiny' };
  var stageTips = {
    egg: 'Complete Chapter 1 to hatch your egg!',
    baby: 'Growing! Complete Chapter 3 to reach the Kid stage.',
    kid: 'Almost there! Complete Chapter 5 to reach Adult.',
    adult: 'Fully grown! Meet the shiny condition to unlock ✨.',
    shiny: 'You did it! This is the ultimate form. Amazing!',
  };

  var specBg = activePetSpec ? activePetSpec.bg : 'var(--lilac-soft, #F3EEFF)';
  var specColor = activePetSpec ? activePetSpec.color : 'var(--blue)';

  // Room background
  var roomItem = (window.PET_ROOMS || []).find(function(r) { return r.id === activePetData.room; });
  var petRoomBg = roomItem ? roomItem.bg : null;

  // Equipped toys
  var equippedToys = (activePetData.toys || []).map(function(id) {
    return (window.PET_TOYS || []).find(function(t) { return t.id === id; });
  }).filter(Boolean);

  // Owned treats
  var ownedTreats = (window.PET_TREATS || []).filter(function(t) {
    return ((profile.treats || {})[t.id] || 0) > 0;
  });

  function useTreat(item) {
    var count = (profile.treats || {})[item.id] || 0;
    if (count < 1 || !activePetId) return;
    window.sfx?.complete();
    setProfile(function(prev) {
      var t = Object.assign({}, prev.treats || {});
      t[item.id] = Math.max(0, (t[item.id] || 0) - 1);
      var pd = Object.assign({}, prev.petData || {});
      var entry = Object.assign({}, pd[prev.activePetId] || {});
      entry.mood = Math.min(100, (entry.mood || 80) + item.moodBoost);
      entry.lastPlayed = new Date().toISOString().slice(0, 10);
      pd[prev.activePetId] = entry;
      var newFeedCount = (prev.feedCount || 0) + (item.feedBonus || 0);
      if (pd.petal && newFeedCount >= 15) pd.petal = Object.assign({}, pd.petal, { shiny: true });
      return Object.assign({}, prev, {
        coins: (prev.coins || 0) + (item.coinBonus || 0),
        treats: t,
        feedCount: newFeedCount,
        petData: pd,
      });
    });
  }

  // Shiny progress for active pet
  var shinyProgress = null;
  if (activePetSpec && activePetSpec.shinyKey && !isShiny) {
    var cur = activePetData[activePetSpec.shinyKey] || 0;
    var target = activePetSpec.shinyTarget;
    shinyProgress = { cur: cur, target: target, label: activePetSpec.shinyLabel };
  }
  if (activePetSpec && activePetSpec.shinyKey === null && !isShiny) {
    var codingDone = (levels || []).filter(function(l) { return l.mode === 'coding' && l.done; }).length;
    shinyProgress = { cur: codingDone, target: 3, label: activePetSpec.shinyLabel };
  }

  return (
    <div style={{ padding: '32px 40px 48px', minHeight: '100%', background: 'linear-gradient(180deg, ' + specBg + ' 0%, var(--bg) 360px)' }}>

      {/* Collection row */}
      {ownedSpecies.length > 1 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Your Collection</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {ownedSpecies.map(function(sid) {
              var spec = allSpecies.find(function(s) { return s.id === sid; });
              var pData = (profile.petData || {})[sid] || {};
              var isAct = sid === activePetId;
              return (
                <button key={sid} onClick={function() { switchActive(sid); }} style={{
                  background: isAct ? (spec ? spec.bg : 'var(--blue-soft)') : 'var(--surface)',
                  border: isAct ? '2px solid ' + (spec ? spec.color : 'var(--blue)') : '2px solid var(--alpha-sm)',
                  borderRadius: 14, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8,
                  cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 13,
                  transition: 'border-color 150ms, background 150ms',
                }}>
                  {typeof PetSprite !== 'undefined' && (
                    <PetSprite speciesId={sid} completedChapters={completedChapters}
                      mood={pData.mood != null ? pData.mood : 80} size={32} equipped={pData.equipped || {}} animate={false}/>
                  )}
                  <span>{pData.name || (spec && spec.name) || sid}</span>
                  {pData.shiny && <span>✨</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 40, flexWrap: 'wrap' }}>

        {/* Left — active pet display */}
        <div style={{ minWidth: 260 }}>
          <div style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>
            {activePetSpec && activePetSpec.typeIcon} Active companion
          </div>
          {editingName ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <input value={nameInput} onChange={function(e) { setNameInput(e.target.value); }}
                onKeyDown={function(e) { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                style={{ fontSize: 32, fontWeight: 900, border: 'none', borderBottom: '2px solid var(--blue)', background: 'transparent', outline: 'none', fontFamily: 'inherit', maxWidth: 200 }} autoFocus/>
              <button onClick={saveName} style={{ background: 'var(--blue)', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', fontFamily: 'inherit', fontWeight: 800, cursor: 'pointer' }}>Save</button>
            </div>
          ) : (
            <h1 style={{ fontSize: 40, fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.02em', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10 }}
              onClick={function() { setNameInput(petName); setEditingName(true); }}>
              {petName} <span style={{ fontSize: 18, color: 'var(--ink-mute)' }}>✏️</span>
            </h1>
          )}
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-soft)', marginBottom: 24 }}>
            {stageLabels[stage]} · {moodColors.label}
            {activePetSpec && <span style={{ marginLeft: 8, fontSize: 13, color: 'var(--ink-mute)' }}>{activePetSpec.type}</span>}
          </div>

          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24, borderRadius: 20, padding: '20px 0 12px',
            background: petRoomBg || 'linear-gradient(135deg, var(--surface-alt, #F7F2FF), var(--bg))',
            transition: 'background 0.5s ease',
          }}>
            {typeof PetSprite !== 'undefined' && activePetId && (
              <PetSprite speciesId={activePetId} completedChapters={completedChapters}
                mood={petMood} size={160} equipped={petEquipped} animate={true}/>
            )}
            {equippedToys.length > 0 && (
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                {equippedToys.map(function(toy) {
                  return <span key={toy.id} style={{ fontSize: 26 }} title={toy.name}>{toy.emoji}</span>;
                })}
              </div>
            )}
            {roomItem && (
              <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.8)', marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{roomItem.emoji} {roomItem.name}</div>
            )}
          </div>

          {/* Mood bar + feed */}
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '16px 20px', marginBottom: 16, boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 14 }}>Mood</span>
              <span style={{ fontWeight: 900, fontSize: 14, color: moodColors.text }}>{moodColors.label}</span>
            </div>
            <div style={{ height: 14, background: 'var(--alpha-sm)', borderRadius: 7, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{ height: '100%', width: petMood + '%', background: moodColors.bar, borderRadius: 7, transition: 'width 0.6s ease' }}/>
            </div>
            <button onClick={feed} disabled={coins < 5 || petMood >= 100 || !activePetId} style={{
              width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
              background: (coins < 5 || petMood >= 100 || !activePetId) ? 'var(--alpha-sm)' : 'var(--yellow)',
              color: (coins < 5 || petMood >= 100 || !activePetId) ? 'var(--ink-mute)' : 'var(--yellow-ink)',
              fontFamily: 'inherit', fontWeight: 900, fontSize: 15,
              cursor: (coins < 5 || petMood >= 100 || !activePetId) ? 'default' : 'pointer',
              transition: 'background 150ms',
            }}>
              {petMood >= 100 ? '😄 ' + petName + ' is full!' : coins < 5 ? '🍎 Need 5 🪙 to feed' : '🍎 Feed ' + petName + ' (5 🪙)'}
            </button>
            {ownedTreats.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Special treats</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ownedTreats.map(function(item) {
                    var count = (profile.treats || {})[item.id] || 0;
                    return (
                      <button key={item.id} onClick={function() { useTreat(item); }} disabled={petMood >= 100 || !activePetId} style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '6px 12px', borderRadius: 10, border: 'none',
                        background: (petMood >= 100 || !activePetId) ? 'var(--alpha-sm)' : 'var(--pink-soft, #FFE0F0)',
                        color: (petMood >= 100 || !activePetId) ? 'var(--ink-mute)' : 'var(--pink-ink, #C2185B)',
                        fontFamily: 'inherit', fontWeight: 800, fontSize: 12,
                        cursor: (petMood >= 100 || !activePetId) ? 'default' : 'pointer',
                      }}>
                        <span>{item.emoji}</span>
                        <span>{item.name}</span>
                        <span style={{ background: 'rgba(0,0,0,0.12)', borderRadius: 999, padding: '1px 6px', fontSize: 10 }}>×{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Growth progress */}
          {next.chapter && (
            <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '16px 20px', marginBottom: 16, boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>Next evolution</div>
              <div style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 700 }}>{next.label}</div>
            </div>
          )}
          {!next.chapter && (
            <div style={{ background: 'var(--mint-soft)', borderRadius: 16, padding: '14px 20px', textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>🎉</div>
              <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--mint-ink)' }}>Fully evolved!</div>
            </div>
          )}

          {/* Shiny progress */}
          {shinyProgress && (
            <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '16px 20px', boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 14 }}>✨ Shiny progress</span>
                <span style={{ fontWeight: 900, fontSize: 13, color: 'var(--yellow-ink)' }}>{shinyProgress.cur}/{shinyProgress.target}</span>
              </div>
              <div style={{ height: 10, background: 'var(--alpha-sm)', borderRadius: 5, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ height: '100%', width: Math.min(100, shinyProgress.cur / shinyProgress.target * 100) + '%', background: '#FFD166', borderRadius: 5, transition: 'width 0.6s ease' }}/>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 700 }}>{shinyProgress.label}</div>
            </div>
          )}
          {isShiny && (
            <div style={{ background: '#FFFBEB', borderRadius: 16, padding: '14px 20px', textAlign: 'center', boxShadow: '0 0 0 2px #FFD166' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>✨</div>
              <div style={{ fontWeight: 900, fontSize: 15, color: '#B45309' }}>Shiny unlocked!</div>
              <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 700 }}>This {petName} has a golden glow.</div>
            </div>
          )}
        </div>

        {/* Right — stage info + tips */}
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ background: specBg, borderRadius: 20, padding: '20px 24px', marginBottom: 20, boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}>{stageLabels[stage]}</div>
            <div style={{ fontSize: 14, color: 'var(--ink-soft)', fontWeight: 700, lineHeight: 1.5 }}>{stageTips[stage]}</div>
          </div>

          <h3 style={{ fontSize: 17, fontWeight: 900, margin: '0 0 14px' }}>Care tips</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {[
              { icon: '🗺', tip: 'Complete whole chapters to evolve your pet!' },
              { icon: '🎮', tip: 'Play every day to keep their mood up — it drops if you skip.' },
              { icon: '🪙', tip: 'Feed your pet for 5 coins to boost mood instantly.' },
              { icon: '🛍', tip: 'Buy outfits in the Shop → Outfits tab to dress them up.' },
              { icon: '✨', tip: 'Meet your pet\'s special condition to unlock their shiny form!' },
            ].map(function(t, i) {
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface)', borderRadius: 14, padding: '14px 18px', boxShadow: 'var(--shadow-soft)' }}>
                  <div style={{ fontSize: 26, flexShrink: 0 }}>{t.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-soft)' }}>{t.tip}</div>
                </div>
              );
            })}
          </div>

          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '16px 20px', boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 12 }}>Stats</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Total stars', value: (profile.totalStars || 0) + ' ⭐' },
                { label: 'Mood', value: petMood + '%' },
                { label: 'Stage', value: stageLabels[stage] },
                { label: 'Pets owned', value: ownedSpecies.length + ' / ' + allSpecies.length },
              ].map(function(s) {
                return (
                  <div key={s.label} style={{ background: 'var(--bg)', borderRadius: 12, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 700, marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>{s.value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StarterSelect({ profile, setProfile }) {
  var [picked, setPicked] = React.useState(null);
  var [confirmed, setConfirmed] = React.useState(false);
  var starters = (window.PET_SPECIES || []).filter(function(s) { return s.isStarter; });

  function confirm() {
    if (!picked) return;
    setConfirmed(true);
    window.sfx?.complete();
    setTimeout(function() {
      var spec = starters.find(function(s) { return s.id === picked; });
      setProfile(function(prev) {
        var pd = Object.assign({}, prev.petData || {});
        pd[picked] = { name: spec.name, mood: 80, lastPlayed: null, equipped: {}, shiny: false, happyDays: 0, lastMoodDate: null };
        if (spec.shinyKey && !(spec.shinyKey in pd[picked])) pd[picked][spec.shinyKey] = 0;
        return Object.assign({}, prev, {
          starterPicked: true,
          ownedSpecies: [picked],
          activePetId: picked,
          petData: pd,
        });
      });
    }, 900);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(180deg, #1A0A3E 0%, #2D1B69 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 32, fontFamily: "'Nunito', system-ui, sans-serif",
    }}>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Welcome to SpellLoop</div>
      <h1 style={{ fontSize: 38, fontWeight: 900, color: 'white', margin: '0 0 8px', letterSpacing: '-0.02em', textAlign: 'center' }}>Choose your starter!</h1>
      <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', fontWeight: 700, margin: '0 0 40px', textAlign: 'center' }}>Pick a companion egg to journey with you. Choose wisely!</p>

      <div style={{ display: 'flex', gap: 24, marginBottom: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
        {starters.map(function(spec) {
          var isPicked = picked === spec.id;
          var isAnimating = confirmed && isPicked;
          return (
            <button key={spec.id} onClick={function() { if (!confirmed) { setPicked(spec.id); window.sfx?.tap(); } }}
              style={{
                background: isPicked ? spec.bg : 'rgba(255,255,255,0.08)',
                border: isPicked ? '3px solid ' + spec.color : '3px solid rgba(255,255,255,0.15)',
                borderRadius: 24, padding: '28px 24px', textAlign: 'center', cursor: 'pointer',
                width: 200, transition: 'border-color 150ms, background 150ms, transform 150ms',
                transform: isPicked ? 'scale(1.06)' : 'scale(1)',
                boxShadow: isPicked ? '0 0 0 6px ' + spec.color + '33' : 'none',
                fontFamily: 'inherit',
              }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                {typeof PetSprite !== 'undefined' ? (
                  <PetSprite speciesId={spec.id} completedChapters={[]} mood={80} size={90}
                    equipped={{}} animate={isPicked} reaction={isAnimating ? 'egg-pick' : undefined}/>
                ) : (
                  <div style={{ fontSize: 72 }}>🥚</div>
                )}
              </div>
              <div style={{ fontWeight: 900, fontSize: 18, color: isPicked ? 'var(--ink)' : 'white', marginBottom: 4 }}>{spec.name}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: isPicked ? spec.color : 'rgba(255,255,255,0.5)', marginBottom: 8 }}>{spec.typeIcon} {spec.type}</div>
              <div style={{ fontSize: 13, color: isPicked ? 'var(--ink)' : 'rgba(255,255,255,0.6)', fontWeight: 700, lineHeight: 1.4, marginBottom: 10 }}>{spec.tagline}</div>
              <div style={{ fontSize: 11, color: isPicked ? 'var(--ink-soft)' : 'rgba(255,255,255,0.4)', fontWeight: 700, background: isPicked ? 'var(--alpha-sm)' : 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '4px 8px' }}>
                ✨ {spec.shinyLabel}
              </div>
            </button>
          );
        })}
      </div>

      <button onClick={confirm} disabled={!picked || confirmed} style={{
        padding: '18px 52px', borderRadius: 999, border: 'none',
        background: picked ? 'var(--yellow)' : 'rgba(255,255,255,0.15)',
        color: picked ? 'var(--ink)' : 'rgba(255,255,255,0.4)',
        fontFamily: 'inherit', fontWeight: 900, fontSize: 20,
        cursor: picked && !confirmed ? 'pointer' : 'default',
        transition: 'background 200ms, color 200ms, transform 150ms',
        transform: picked && !confirmed ? 'scale(1)' : 'scale(0.97)',
        boxShadow: picked ? '0 8px 24px rgba(255,209,102,0.4)' : 'none',
      }}>
        {confirmed ? '✨ Starting your journey...' : picked ? 'Choose ' + starters.find(function(s) { return s.id === picked; }).name + '!' : 'Pick an egg first'}
      </button>
    </div>
  );
}

Object.assign(window, { WebApp, WebHome, WebStat, WebShop, WebCodeLab, WebPet, StarterSelect, isSpeciesUnlocked, getSpeciesDisplayPrice });
