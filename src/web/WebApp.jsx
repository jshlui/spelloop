// Desktop web app — sidebar + main content. Fills full viewport.

function WebApp({ profile, setProfile, levels, setLevels, settings, setSettings, onOpenParent }) {
  window.__currentProfileId = profile.id || 'p0';
  var [tab, setTab] = React.useState(function() { return localStorage.getItem('sl_web_tab') || 'home'; });
  var [route, setRoute] = React.useState({ name: 'screen' });
  var [dailyState, setDailyState] = React.useState(function() {
    try { return JSON.parse(localStorage.getItem('spelloop-daily-' + (profile.id || 'p0')) || 'null') || {}; } catch(e) { return {}; }
  });

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

  function handleStartDaily(daily) {
    setRoute({ name: 'game', mode: daily.mode, word: daily.word });
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

    var prevBest = completedId ? (levels.find(function(l) { return l.id === completedId; }) || {}).stars || 0 : 0;
    var isNewRecord = !!completedId && stars > prevBest;

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

    // Check if this completed the daily challenge
    var today = new Date().toISOString().slice(0, 10);
    var daily = typeof getDailyChallenge !== 'undefined' ? getDailyChallenge(today) : null;
    if (daily && capturedRoute.word === daily.word && capturedRoute.mode === daily.mode) {
      var prevDaily = dailyState || {};
      var prevStreak = prevDaily.lastDate === new Date(Date.now() - 86400000).toISOString().slice(0, 10)
        ? (prevDaily.challengeStreak || 0)
        : 0;
      var newDailyState = { lastDate: today, todayDone: true, challengeStreak: prevStreak + 1 };
      setDailyState(newDailyState);
      localStorage.setItem('spelloop-daily-' + (profile.id || 'p0'), JSON.stringify(newDailyState));
      // Bonus 25 coins already handled by coinsEarned — add 25 more
      setProfile(function(prev) {
        return Object.assign({}, prev, { coins: (prev.coins || 0) + 25 });
      });
    }

    if (capturedRoute.mode === 'boss') {
      window.Juice?.emit('chapterBoss');
      // Find which chapter this boss belongs to
      var bossLevel = (window.LEVELS || []).find(function(l) { return l.id === completedId; });
      var bossChapter = bossLevel ? bossLevel.chapter : 1;
      // Show postcard first, then reward
      setRoute({ name: 'chapterComplete', chapter: bossChapter, pending: { name: 'storyBuilder', chapter: bossChapter, reward: { name: 'reward', word: capturedRoute.word, stars: stars, mode: capturedRoute.mode, coins: coinsEarned, isNewRecord: isNewRecord } } });
    } else {
      setRoute({ name: 'reward', word: capturedRoute.word, stars: stars, mode: capturedRoute.mode, coins: coinsEarned, isNewRecord: isNewRecord });
    }
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
            onPlayLevel={startLevel}
            onPickMode={startMode}
            onTab={function(t) { setTab(t); setRoute({ name: 'screen' }); }}
            dailyState={dailyState}
            onStartDaily={handleStartDaily}/>
        )}
        {route.name === 'screen' && tab === 'map'  && <WebMap levels={levels} onPlayLevel={startLevel} onBack={function() { setTab('home'); }}/>}
        {route.name === 'screen' && tab === 'me'   && (
          <DashboardSubPage icon="👤" eyebrow="Profile" title="My Stuff" onBack={function() { setTab('home'); }}>
            <WebMe profile={profile} setProfile={setProfile} levels={levels} onOpenParent={onOpenParent}/>
          </DashboardSubPage>
        )}
        {route.name === 'screen' && tab === 'code' && (
          <WebCodeLab levels={levels} onPlayLevel={startLevel} onBack={function() { setTab('home'); }}/>
        )}
        {route.name === 'screen' && tab === 'shop' && (
          <DashboardSubPage icon="🏆" eyebrow="Rewards" title="Shop" onBack={function() { setTab('home'); }}>
            <WebShop profile={profile} setProfile={setProfile} levels={levels}/>
          </DashboardSubPage>
        )}
        {route.name === 'screen' && tab === 'pet'  && profile.starterPicked && (
          <DashboardSubPage icon="🥚" eyebrow="Companion" title="My Pet" onBack={function() { setTab('home'); }}>
            <WebPet profile={profile} setProfile={setProfile} levels={levels}/>
          </DashboardSubPage>
        )}
        {route.name === 'game'   && <WebGame mode={route.mode} word={route.word} onClose={closeGame} onDone={finishGame}/>}
        {route.name === 'chapterComplete' && typeof ChapterComplete !== 'undefined' && (
          <ChapterComplete
            chapter={route.chapter}
            onNext={function() { setRoute(route.pending); }}
          />
        )}
        {route.name === 'storyBuilder' && typeof StoryBuilder !== 'undefined' && (
          <StoryBuilder
            chapter={route.chapter}
            chapterWords={(levels || []).filter(function(l) { return l.chapter === route.chapter && l.done && l.stars >= 2 && l.mode !== 'coding'; }).map(function(l) { return l.word; })}
            onDone={function() { setRoute(route.reward); }}
          />
        )}
        {route.name === 'reward' && (
          <WebReward word={route.word} stars={route.stars} coins={route.coins} isNewRecord={route.isNewRecord}
            onNext={function() { setRoute({ name: 'screen' }); setTab('map'); }}
            onHome={function() { setRoute({ name: 'screen' }); setTab('home'); }}/>
        )}
      </div>
    </div>
  );
}

function DashboardSubPage({ icon, eyebrow, title, onBack, children }) {
  return (
    <main className="spelloop-dashboard spelloop-subpage">
      <header className="journey-top">
        <button className="journey-back" onClick={onBack} aria-label="Back to home">←</button>
        <div className="journey-title">
          <span>{icon}</span>
          <div>
            <p>{eyebrow}</p>
            <h1>{title}</h1>
          </div>
        </div>
        <button className="journey-help" aria-label="Help">?</button>
      </header>
      <section className="spelloop-subpage-panel">
        {children}
      </section>
    </main>
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
    { id: 'home', label: 'Home', icon: function(c) { return <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M4 12 L12 5 L20 12 V20 H14 V15 H10 V20 H4 Z" fill={c} stroke={c} strokeWidth="1.8" strokeLinejoin="round"/></svg>; } },
    { id: 'map',  label: 'Learn', icon: function(c) { return <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M4 6.5 C6.4 5.4 9.2 5.5 12 7.5 C14.8 5.5 17.6 5.4 20 6.5 V19 C17.6 17.9 14.8 18 12 20 C9.2 18 6.4 17.9 4 19 Z" stroke={c} strokeWidth="2" strokeLinejoin="round"/><path d="M12 7.5 V20" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>; } },
    { id: 'code', label: 'Play', icon: function(c) { return <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M7 9 H17 L20 14.5 C20.8 16.1 19.7 18 17.9 18 C16.9 18 16 17.4 15.5 16.5 L14.9 15.5 H9.1 L8.5 16.5 C8 17.4 7.1 18 6.1 18 C4.3 18 3.2 16.1 4 14.5 Z" fill={c}/><path d="M8 12 V15 M6.5 13.5 H9.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><circle cx="15.5" cy="13.5" r="1" fill="white"/><circle cx="18" cy="12" r="1" fill="white"/></svg>; } },
    { id: 'shop', label: 'Rewards', icon: function(c) { return <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M7 4 H17 V7 C17 10.2 15 12.6 12 13.2 C9 12.6 7 10.2 7 7 Z" fill={c}/><path d="M7 6 H4 V8 C4 10 5.4 11.4 7.5 11.7 M17 6 H20 V8 C20 10 18.6 11.4 16.5 11.7" stroke={c} strokeWidth="2" strokeLinecap="round"/><path d="M12 13 V17 M9 20 H15 M10 17 H14" stroke={c} strokeWidth="2.2" strokeLinecap="round"/></svg>; } },
    { id: 'me',   label: 'Profile', icon: function(c) { return <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill={c}/><path d="M4 20 C4 15.4 8 14 12 14 C16 14 20 15.4 20 20" fill={c}/></svg>; } },
  ];
  return (
    <aside aria-label="Main navigation" className="web-sidebar spelloop-sidebar">
      <div className="spelloop-brand sidebar-brand">
        <div className="spelloop-brand-star" aria-hidden="true">★</div>
        <div className="spelloop-brand-word">Spell<span>oop</span></div>
      </div>

      <nav role="navigation" aria-label="App sections" className="spelloop-sidebar-nav">
        {items.map(function(it) {
          var active = tab === it.id;
          return (
            <button key={it.id} aria-current={active ? 'page' : undefined}
              className={'sidebar-nav-btn spelloop-nav-btn' + (active ? ' is-active' : '')}
              onClick={function() { onTab(it.id); window.sfx && window.sfx.tap && window.sfx.tap(); }}
              >
              <span className="spelloop-nav-icon">{it.icon(active ? 'white' : 'var(--spelloop-purple)')}</span>
              <span className="sidebar-label spelloop-nav-label">{it.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="spelloop-sidebar-spacer"/>

      <div className="spelloop-kid-card sidebar-profile">
        <div className="spelloop-kid-card__pet">
          {typeof PetSprite !== 'undefined' && profile.activePetId ? (
            <PetSprite speciesId={profile.activePetId} mood={(activePetData && activePetData.mood) || 80} size={142} animate={true}/>
          ) : (
            <div className="spelloop-dino-fallback">🦖</div>
          )}
        </div>
        <div className="spelloop-kid-card__name">Hi, {profile.name}!</div>
        <div id="juice-coin" className="spelloop-kid-card__stars sidebar-coins">
          <span className="juice-coin-icon">⭐</span>
          <strong>{profile.totalStars || 0}</strong>
        </div>
        <div className="spelloop-kid-card__level">Next Level</div>
        <div className="spelloop-kid-card__bar"><span style={{ width: Math.min(100, ((levels || []).filter(function(l) { return l.done; }).length % 8) / 8 * 100) + '%' }}/></div>
      </div>

      <button onClick={onOpenParent} title="Parent area" className="spelloop-parent-btn">Parent</button>
    </aside>
  );
}

function LandscapeShell({ title, onBack, onHelp, topExtra, showBack, children }) {
  var showBackBtn = showBack !== false;
  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden',
      background: 'linear-gradient(180deg, var(--sky-top) 0%, var(--sky-mid) 25%, var(--sky-bottom) 38%, var(--grass-top) 38%, var(--grass-mid) 60%, var(--grass-deep) 100%)',
      fontFamily: "'Nunito', system-ui, sans-serif",
    }}>
      {/* Sun */}
      <div style={{ position: 'absolute', top: 16, right: 80, width: 64, height: 64, borderRadius: '50%',
        background: 'radial-gradient(circle, #FFE066 60%, #FFD700 100%)',
        boxShadow: '0 0 0 8px rgba(255,220,50,0.2), 0 0 0 16px rgba(255,220,50,0.1)',
        zIndex: 0, pointerEvents: 'none',
      }}/>
      {/* Clouds */}
      {[
        { w: 82, h: 28, top: 20, left: 80, bw: 40, bh: 40, bt: -20, bl: 12, aw: 30, ah: 30, at: -14, ar: 10 },
        { w: 64, h: 22, top: 48, left: 240, bw: 30, bh: 30, bt: -14, bl: 9, aw: 24, ah: 24, at: -10, ar: 8, opacity: 0.75 },
        { w: 74, h: 26, top: 18, left: 460, bw: 36, bh: 36, bt: -18, bl: 11, aw: 28, ah: 28, at: -13, ar: 9 },
      ].map(function(c, i) {
        return (
          <div key={i} style={{ position: 'absolute', top: c.top, left: c.left, width: c.w, height: c.h,
            background: 'white', borderRadius: 50, opacity: c.opacity || 0.92, zIndex: 0, pointerEvents: 'none',
          }}>
            <div style={{ position: 'absolute', width: c.bw, height: c.bh, borderRadius: '50%', background: 'white', top: c.bt, left: c.bl }}/>
            <div style={{ position: 'absolute', width: c.aw, height: c.ah, borderRadius: '50%', background: 'white', top: c.at, right: c.ar }}/>
          </div>
        );
      })}
      {/* Birds */}
      <svg style={{ position: 'absolute', top: 60, left: 0, width: '100%', height: 80, zIndex: 0, pointerEvents: 'none' }} viewBox="0 0 1000 80" preserveAspectRatio="none">
        <path d="M 180 30 Q 186 24 192 30 Q 198 24 204 30" stroke="rgba(255,255,255,0.48)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M 340 50 Q 345 44 350 50 Q 355 44 360 50" stroke="rgba(255,255,255,0.40)" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M 720 22 Q 727 15 734 22 Q 741 15 748 22" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </svg>
      {/* Rolling hills */}
      {[
        { w: 480, h: 170, left: -60,  bg: '#15803D' },
        { w: 340, h: 130, left: 240,  bg: '#16A34A' },
        { w: 280, h: 105, left: 420,  bg: '#22C55E' },
        { w: 320, h: 125, right: 260, bg: '#16A34A' },
        { w: 420, h: 155, right: -40, bg: '#15803D' },
        { w: 210, h: 82,  right: 340, bg: '#14532D' },
      ].map(function(h, i) {
        return (
          <div key={i} style={{
            position: 'absolute', bottom: 0,
            left: h.left !== undefined ? h.left : undefined,
            right: h.right !== undefined ? h.right : undefined,
            width: h.w, height: h.h,
            background: h.bg,
            borderRadius: '50% 50% 0 0',
            zIndex: 0, pointerEvents: 'none',
          }}/>
        );
      })}

      {/* Top chrome — hidden on home (showBack=false, no topExtra) */}
      {(showBackBtn || topExtra) && (
        <div style={{ position: 'relative', zIndex: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 18px',
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(8px)',
          borderBottom: '2px solid rgba(255,255,255,0.8)',
        }}>
          {showBackBtn
            ? <button onClick={onBack} aria-label="Go back" style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'var(--btn-back-bg)', border: '3px solid var(--btn-back-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 900, color: 'var(--btn-back-ink)',
                boxShadow: '0 3px 0 var(--btn-back-shadow)',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>←</button>
            : <div style={{ width: 40 }}/>
          }

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontFamily: "'Fredoka', 'Nunito', sans-serif", fontSize: 26, fontWeight: 700, color: '#0F172A' }}>{title}</div>
            {topExtra}
          </div>

          <button onClick={onHelp || function() {}} aria-label="Help" style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--btn-help-bg)', border: '3px solid var(--btn-help-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 900, color: 'white',
            boxShadow: '0 3px 0 var(--btn-help-shadow)',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>?</button>
        </div>
      )}

      {/* Content layer over landscape */}
      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  );
}

function ScreenPanel({ children }) {
  return (
    <div style={{
      margin: '0 16px 16px',
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(10px)',
      borderRadius: 20,
      padding: 24,
      boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
      minHeight: 'calc(100vh - 120px)',
      overflow: 'auto',
    }}>
      {children}
    </div>
  );
}

// SVG icons for home nav tiles — consistent, cross-platform
var HOME_TILE_ICONS = {
  home: function() {
    return (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <circle cx="26" cy="26" r="26" fill="rgba(255,255,255,0.18)"/>
        <path d="M26 12 L40 24 L40 40 L32 40 L32 30 L20 30 L20 40 L12 40 L12 24 Z" fill="white" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M18 24 L26 17 L34 24" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    );
  },
  map: function() {
    return (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <circle cx="26" cy="26" r="26" fill="rgba(255,255,255,0.18)"/>
        <path d="M10 16 L20 12 L32 16 L42 12 V38 L32 42 L20 38 L10 42 Z" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M20 12 V38 M32 16 V42" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="26" cy="27" r="4" fill="white"/>
      </svg>
    );
  },
  me: function() {
    return (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <circle cx="26" cy="26" r="26" fill="rgba(255,255,255,0.18)"/>
        <path d="M26 13 L28.5 20.5 L36.5 20.5 L30 25.5 L32.5 33 L26 28 L19.5 33 L22 25.5 L15.5 20.5 L23.5 20.5 Z" fill="white"/>
      </svg>
    );
  },
  code: function() {
    return (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <circle cx="26" cy="26" r="26" fill="rgba(255,255,255,0.18)"/>
        <rect x="12" y="16" width="28" height="20" rx="3" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="2"/>
        <path d="M18 24 L15 27 L18 30" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M34 24 L37 27 L34 30" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M28 22 L24 32" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <rect x="16" y="36" width="20" height="3" rx="1.5" fill="white"/>
      </svg>
    );
  },
  shop: function() {
    return (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <circle cx="26" cy="26" r="26" fill="rgba(255,255,255,0.18)"/>
        <path d="M14 20 L38 20 L35 38 H17 Z" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M14 20 L16 14 H36 L38 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 20 C21 23.3 23.7 26 26 26 C28.3 26 31 23.3 31 20" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
    );
  },
  pet: function() {
    return (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <circle cx="26" cy="26" r="26" fill="rgba(255,255,255,0.18)"/>
        <ellipse cx="26" cy="30" rx="10" ry="8" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="2"/>
        <circle cx="19" cy="20" r="4" fill="white"/>
        <circle cx="33" cy="20" r="4" fill="white"/>
        <circle cx="14" cy="28" r="3" fill="white"/>
        <circle cx="38" cy="28" r="3" fill="white"/>
      </svg>
    );
  },
};

function SpaceHeroArt() {
  return (
    <div className="space-hero-art" aria-hidden="true">
      <div className="space-planet"/>
      <div className="space-star space-star--big">★</div>
      <div className="space-rocket">
        <div className="space-rocket__body">
          <div className="space-rocket__window"/>
          <div className="space-rocket__nose"/>
          <div className="space-rocket__fin space-rocket__fin--left"/>
          <div className="space-rocket__fin space-rocket__fin--right"/>
          <div className="space-rocket__flame"/>
        </div>
        <div className="space-astronaut">
          <div className="space-astronaut__helmet"><div className="space-astronaut__face">●‿●</div></div>
          <div className="space-astronaut__arm"/>
        </div>
      </div>
      <div className="space-cloud space-cloud--left"/>
      <div className="space-cloud space-cloud--right"/>
    </div>
  );
}

function LessonThumb({ kind }) {
  if (kind === 'letters') return <div className="lesson-thumb lesson-thumb--letters"><span>A</span><span>B</span><span>C</span></div>;
  if (kind === 'numbers') return <div className="lesson-thumb lesson-thumb--numbers"><span>1</span><span>2</span><span>3</span></div>;
  if (kind === 'space') return <div className="lesson-thumb lesson-thumb--space"><span></span></div>;
  if (kind === 'animals') return <div className="lesson-thumb lesson-thumb--animals"><span>🦋</span></div>;
  return <div className="lesson-thumb lesson-thumb--colors"><span></span><i></i></div>;
}

function ActivityThumb({ kind }) {
  return <div className={'activity-thumb activity-thumb--' + kind} aria-hidden="true"/>;
}

function WebHome({ profile, levels, onContinue, onPlayLevel, onPickMode, onTab, dailyState, onStartDaily }) {
  var playable = (levels || []).filter(function(l) { return !l.locked || l.current || l.done; });
  var lessonSource = playable.length ? playable : (levels || []).slice(0, 5);
  var lessonTitles = ['Fun with Letters', 'Numbers Adventure', 'Space Explorers', 'Amazing Animals', 'Color & Shapes'];
  var lessonKinds = ['letters', 'numbers', 'space', 'animals', 'colors'];
  var lessonColors = ['green', 'blue', 'purple', 'yellow', 'pink'];
  var lessonPercents = [60, 40, 75, 60, 30];
  var lessons = lessonTitles.map(function(title, idx) {
    return { title: title, kind: lessonKinds[idx], color: lessonColors[idx], percent: lessonPercents[idx], level: lessonSource[idx % Math.max(lessonSource.length, 1)] };
  });
  var activities = [
    { title: 'Math Match', mode: 'missing', kind: 'math' },
    { title: 'Pizza Party', mode: 'scramble', kind: 'pizza' },
    { title: 'Song Time', mode: 'speed', kind: 'song' },
    { title: 'Puzzle World', mode: 'coding', kind: 'puzzle' },
  ];

  return (
    <main className="spelloop-dashboard">
      <header className="spelloop-topbar">
        <button className="spelloop-search" aria-label="Search">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2.6"/><path d="M15.5 15.5 L21 21" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"/></svg>
        </button>
        <div className="spelloop-topbar__right">
          <div className="spelloop-gems" aria-label={(profile.coins || 0) + ' gems'}><span className="spelloop-gem-icon">◆</span><strong>{profile.coins || 25}</strong></div>
          <button className="spelloop-profile-chip" onClick={function() { onTab('me'); }} aria-label="Open profile">
            <Avatar id={profile.avatar} size={58} style={(window.__tweaks && window.__tweaks.avatarStyle) || 'animal'}/>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9 L12 15 L18 9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </header>

      <section className="spelloop-hero">
        <SpaceHeroArt/>
        <div className="spelloop-hero__copy">
          <h1>Let's learn<br/><span>something new!</span></h1>
          <p>Explore fun lessons and activities just for you.</p>
          <button className="spelloop-hero-cta" onClick={onContinue}><span>Start Learning</span><i aria-hidden="true">▶</i></button>
        </div>
        <div className="spelloop-hero__dots" aria-hidden="true"><span/><span/><span/><span className="is-active"/></div>
      </section>

      <section className="spelloop-section">
        <div className="spelloop-section-head"><h2>Continue Learning</h2><button onClick={function() { onTab('map'); }}>View all</button></div>
        <div className="spelloop-lessons">
          {lessons.map(function(lesson) {
            return (
              <button key={lesson.title} className={'spelloop-lesson spelloop-lesson--' + lesson.color}
                onClick={function() { if (lesson.level && onPlayLevel) onPlayLevel(lesson.level); else onContinue(); }}>
                <LessonThumb kind={lesson.kind}/>
                <div className="spelloop-lesson__body">
                  <h3>{lesson.title}</h3>
                  <div className="spelloop-progress"><span style={{ width: lesson.percent + '%' }}/></div>
                  <strong>{lesson.percent}%</strong>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="spelloop-section">
        <div className="spelloop-section-head"><h2>Fun Activities</h2><button onClick={function() { onTab('code'); }}>View all</button></div>
        <div className="spelloop-activities">
          {activities.map(function(activity) {
            return (
              <article key={activity.title} className={'spelloop-activity spelloop-activity--' + activity.kind}>
                <ActivityThumb kind={activity.kind}/>
                <div className="spelloop-activity__row">
                  <h3>{activity.title}</h3>
                  <button onClick={function() { onPickMode(activity.mode); }}><span>🎮</span> Play</button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="spelloop-reward-banner">
        <div className="spelloop-trophy" aria-hidden="true">🏆</div>
        <h2>Complete activities, earn stars<br/>and unlock awesome rewards!</h2>
        <button onClick={function() { onTab('shop'); }}>Go to Rewards</button>
        <div className="spelloop-chest" aria-hidden="true">🎁</div>
      </section>

      {(function() {
        var today = new Date().toISOString().slice(0, 10);
        var daily = typeof getDailyChallenge !== 'undefined' ? getDailyChallenge(today) : null;
        if (!daily) return null;
        var done = dailyState && dailyState.lastDate === today && dailyState.todayDone;
        return <button className={'spelloop-daily' + (done ? ' is-done' : '')} onClick={done ? undefined : function() { onStartDaily && onStartDaily(daily); }}><span>{done ? '✓' : '⚡'}</span><strong>{done ? 'Daily done!' : "Today's Challenge"}</strong></button>;
      })()}
    </main>
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
      <div className="shop-item-card" style={{
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
                background: canAfford ? 'var(--gold)' : 'var(--alpha-sm)',
                color: canAfford ? '#451A03' : 'var(--ink-mute)',
                fontFamily: "'Fredoka', 'Nunito', sans-serif", fontWeight: 600, fontSize: 12,
                cursor: canAfford ? 'pointer' : 'default',
                boxShadow: canAfford ? '0 2px 0 var(--gold-dark)' : 'none',
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
          <div role="status" style={{ fontSize: 11, fontWeight: 800, color: 'white', background: 'var(--emerald)', borderRadius: 8, padding: '4px 10px' }}>✓ Owned</div>
        )}
      </div>
    );
  }

  function CompactGrid({ children }) {
    return <div className="shop-compact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>{children}</div>;
  }

  return (
    <div className="dashboard-shop" style={{ minHeight: '100%' }}>
      {/* Coin badge + tab row */}
      <div className="shop-toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
        <div className="shop-tabs" style={{ display: 'flex', gap: 8, overflowX: 'auto', flexShrink: 1 }}>
          {shopTabs.map(function(t) {
            var active = shopTab === t.id;
            return (
              <button key={t.id} className={active ? 'is-active' : ''} onClick={function() { setShopTab(t.id); window.sfx?.tap(); }} style={{
                flexShrink: 0, padding: '8px 18px', borderRadius: 999, border: 'none',
                background: active ? 'var(--brand)' : 'var(--brand-light)',
                color: active ? 'white' : 'var(--brand)',
                fontFamily: "'Fredoka', 'Nunito', sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer',
                transition: 'background 150ms, color 150ms',
                boxShadow: active ? '0 3px 0 var(--brand-dark)' : 'none',
              }}>{t.label}</button>
            );
          })}
        </div>
        <div className="shop-coin-chip" style={{
          display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
          background: 'var(--gold)', borderRadius: 999, padding: '8px 18px',
          boxShadow: '0 3px 0 var(--gold-dark)',
        }}>
          <span style={{ fontSize: 18 }}>🪙</span>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#451A03', fontFamily: "'Fredoka', sans-serif" }}>{coins}</span>
        </div>
      </div>

      <div>

      {/* Species */}
      {shopTab === 'species' && (
        <div className="shop-species-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
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
                <div key={species.id} className="shop-species-card is-locked" style={{
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
              <div key={species.id} className={'shop-species-card' + (isActive ? ' is-active' : '')} style={{
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
                      background: 'var(--emerald-soft)', color: 'var(--emerald-dark)',
                      fontFamily: "'Fredoka', 'Nunito', sans-serif", fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    }}>Switch to {species.name}</button>
                  )
                ) : (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--yellow-ink)', marginBottom: 8 }}>🪙 {price}</div>
                    <button onClick={function() { buySpecies(species); }} disabled={!canAfford} style={{
                      width: '100%', padding: '9px 0', borderRadius: 10, border: 'none',
                      background: canAfford ? 'var(--gold)' : 'var(--alpha-sm)',
                      color: canAfford ? '#451A03' : 'var(--ink-mute)',
                      fontFamily: "'Fredoka', 'Nunito', sans-serif", fontWeight: 600, fontSize: 13,
                      cursor: canAfford ? 'pointer' : 'default',
                      boxShadow: canAfford ? '0 3px 0 var(--gold-dark)' : 'none',
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
    </div>
  );
}

var CODING_LEVEL_INFO = {
  'L1': { title: 'Level 1 — First Steps', desc: 'Guide the player in just 2 moves.', emoji: '🟢', difficulty: 'Beginner' },
  'L2': { title: 'Level 2 — Find the Route', desc: '3 moves. Think before you tap.', emoji: '🟡', difficulty: 'Easy' },
  'L3': { title: 'Level 3 — Plan Ahead', desc: '5 moves to reach the star.', emoji: '🔴', difficulty: 'Medium' },
};

function CodeLabPreview() {
  return (
    <div className="code-lab-preview" aria-hidden="true">
      <div className="code-lab-grid">
        {Array.from({ length: 64 }).map(function(_, i) {
          return <span key={i} className={(i === 9 || i === 18 || i === 27 || i === 36 || i === 45) ? 'is-path' : ''}/>;
        })}
      </div>
      <div className="code-lab-player">🙂</div>
      <div className="code-lab-star">★</div>
      <div className="code-lab-route"><span>↑</span><span>→</span><span>→</span></div>
    </div>
  );
}

function WebCodeLab({ levels, onPlayLevel, onBack }) {
  var codingLevels = (levels || []).filter(function(l) { return l.mode === 'coding'; });
  var doneCount = codingLevels.filter(function(l) { return l.done; }).length;
  var current = codingLevels.find(function(l) { return l.current; }) || codingLevels.find(function(l) { return !l.locked; }) || codingLevels[0];

  return (
    <main className="spelloop-dashboard code-lab-page">
      <header className="journey-top">
        <button className="journey-back" onClick={onBack} aria-label="Back to home">←</button>
        <div className="journey-title code-lab-title">
          <span>🤖</span>
          <div>
            <p>New game mode</p>
            <h1>Code Lab</h1>
          </div>
        </div>
        <button className="journey-help" aria-label="Help">?</button>
      </header>

      <section className="code-lab-hero">
        <div className="code-lab-hero__copy">
          <div className="code-lab-kicker">Logic and planning</div>
          <h2>Build a path to the star</h2>
          <p>Queue moves, run the route, and adjust your plan until the player reaches the goal.</p>
          <button onClick={function() { if (current) onPlayLevel(current); }}>
            <span>Start Coding</span><i aria-hidden="true">▶</i>
          </button>
        </div>
        <CodeLabPreview/>
      </section>

      <section className="journey-summary code-lab-summary">
        <div className="journey-summary-card"><span className="journey-summary-card__icon">⭐</span><div><strong>{doneCount}</strong><p>Labs solved</p></div></div>
        <div className="journey-summary-card"><span className="journey-summary-card__icon">🎯</span><div><strong>{current ? ((CODING_LEVEL_INFO[current.word] || {}).title || current.word) : 'Ready'}</strong><p>Next challenge</p></div></div>
        <div className="journey-summary-card"><span className="journey-summary-card__icon">🧠</span><div><strong>{codingLevels.length}</strong><p>Total levels</p></div></div>
      </section>

      <section className="spelloop-section">
        <div className="spelloop-section-head"><h2>Choose a Lab</h2><button type="button">View all</button></div>
        <div className="code-lab-levels">
        {codingLevels.map(function(lv) {
          var info = CODING_LEVEL_INFO[lv.word] || {};
          var locked = lv.locked && !lv.current && !lv.done;
          return (
            <button key={lv.id} onClick={function() { if (!locked) onPlayLevel(lv); }}
              disabled={locked}
              className={'code-lab-card' + (locked ? ' is-locked' : '') + (lv.done ? ' is-done' : '')}
            >
              <div className="code-lab-card__icon">{locked ? '🔒' : info.emoji}</div>
              <div className="code-lab-card__meta">{info.difficulty}</div>
              <h3>{info.title}</h3>
              <p>{info.desc}</p>
              {lv.done ? (
                <div className="code-lab-card__complete">
                  <StarRow filled={lv.stars} size={16} gap={2}/>
                  <span>Complete!</span>
                </div>
              ) : !locked ? (
                <div className="code-lab-card__play">▶ Play</div>
              ) : (
                <div className="code-lab-card__locked">Finish previous level to unlock</div>
              )}
            </button>
          );
        })}
        </div>
      </section>

      <section className="spelloop-section">
        <div className="spelloop-section-head"><h2>How it works</h2></div>
        <div className="code-lab-steps">
          {[
            { n: '1', icon: '➕', title: 'Add moves', desc: 'Tap direction buttons to queue up your sequence.' },
            { n: '2', icon: '▶', title: 'Run it', desc: 'Watch the player follow your instructions step by step.' },
            { n: '3', icon: '⭐', title: 'Reach the star', desc: 'Adjust your sequence until the player gets there.' },
          ].map(function(s) {
            return (
              <div key={s.n} className="code-lab-step">
                <div className="code-lab-step__number">{s.n}</div>
                <div className="code-lab-step__icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
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
    window.Juice?.emit('petHappy');
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
    window.Juice?.emit('petHappy');
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
    <div className="pet-dashboard" style={{ padding: '32px 40px 48px', minHeight: '100%', background: 'var(--bg)' }}>

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
            <h1 style={{ fontSize: 34, fontWeight: 700, fontFamily: "'Fredoka', 'Nunito', sans-serif", margin: '0 0 4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10 }}
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
            background: petRoomBg || 'linear-gradient(135deg, var(--brand-dark) 0%, var(--violet) 100%)',
            transition: 'background 0.5s ease',
          }}>
            {typeof PetSprite !== 'undefined' && activePetId && (
              <div id="juice-pet" style={{ filter: 'drop-shadow(0 0 24px rgba(37,99,235,0.5))' }}>
                <PetSprite speciesId={activePetId} completedChapters={completedChapters}
                  mood={petMood} size={160} equipped={petEquipped} animate={true}/>
              </div>
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

Object.assign(window, { WebApp, WebHome, WebShop, WebCodeLab, WebPet, StarterSelect, isSpeciesUnlocked, getSpeciesDisplayPrice, LandscapeShell, ScreenPanel });
