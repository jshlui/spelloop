// Top-level shell: web-first app wrapped in a browser window.
// Mobile view is still available via Tweaks.

function App() {
  const DEFAULTS = /*EDITMODE-BEGIN*/{
    "age": "mid",
    "theme": "blue",
    "avatarStyle": "animal",
    "difficulty": "med",
    "platform": "web",
    "device": "ios",
    "parentOpen": false,
    "sounds": true
  }/*EDITMODE-END*/;
  const [tweaks, setTweaks] = React.useState(DEFAULTS);
  const [tweaksVisible, setTweaksVisible] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-age', tweaks.age === 'mid' ? '' : tweaks.age);
    document.documentElement.setAttribute('data-theme', tweaks.theme);
    window.__tweaks = tweaks;
    window.sfx?.setEnabled(tweaks.sounds);
  }, [tweaks]);

  React.useEffect(() => {
    const handler = (e) => {
      const d = e.data || {};
      if (d.type === '__activate_edit_mode') setTweaksVisible(true);
      if (d.type === '__deactivate_edit_mode') setTweaksVisible(false);
    };
    window.addEventListener('message', handler);
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}
    return () => window.removeEventListener('message', handler);
  }, []);

  const [tutorialDone, setTutorialDone] = React.useState(
    function() { return sessionStorage.getItem('spelloop-tutorial') === '1'; }
  );
  const handleTutorialComplete = React.useCallback(function() {
    sessionStorage.setItem('spelloop-tutorial', '1');
    setTutorialDone(true);
  }, []);

  const [profile] = React.useState({
    name: 'Sam', age: 7, avatar: 'fox', level: 4, streak: 5, totalStars: 7, words: 3,
  });

  const parentOpen = tweaks.parentOpen;
  function setParentOpen(v) {
    const next = { ...tweaks, parentOpen: v };
    setTweaks(next);
    try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { parentOpen: v } }, '*'); } catch (e) {}
  }

  const isWeb = tweaks.platform === 'web';
  const isMobile = tweaks.platform === 'mobile';

  return (
    <div style={{
      minHeight: '100vh', width: '100vw', padding: 20, boxSizing: 'border-box',
      display: 'flex', alignItems: isMobile ? 'center' : 'flex-start', justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, #F8FAFD 0%, #E5EAF2 70%, #CFD6E3 100%)',
    }}>
      {!tutorialDone && <HoverTutorial onComplete={handleTutorialComplete} />}
      <StreakBadge />
      {isWeb ? (
        <div data-screen-label={webLabel(parentOpen)} style={{ width: '100%', maxWidth: 1360 }}>
          <ChromeWindow
            width="100%" height={880}
            url="spelloop.com/app"
            tabs={[
              { title: 'SpellLoop Kids — Sam', active: true },
              { title: 'Classroom portal' },
              { title: 'Help center' },
            ]}
            activeIndex={0}
          >
            <div style={{ height: '100%', position: 'relative' }}>
              <WebApp profile={profile} tweaks={tweaks} setParentOpen={setParentOpen}/>
              {parentOpen && <WebParent profile={profile} onClose={() => setParentOpen(false)}/>}
            </div>
          </ChromeWindow>
        </div>
      ) : (
        <MobileApp profile={profile} tweaks={tweaks} setParentOpen={setParentOpen} parentOpen={parentOpen}/>
      )}

      <TweaksPanel tweaks={tweaks} setTweaks={setTweaks} visible={tweaksVisible}/>
    </div>
  );
}

function webLabel(parentOpen) {
  return parentOpen ? '05 Parent Dashboard (Web)' : '01 Web App';
}

// ─── Mobile fallback (original phone shell) ───────────────────
function MobileApp({ profile, tweaks, setParentOpen, parentOpen }) {
  const [tab, setTab] = React.useState('home');
  const [route, setRoute] = React.useState({ name: 'home' });
  const [levelTransition, setLevelTransition] = React.useState(null);
  function startLevel(level) {
    setRoute({ name: 'game', mode: level.mode === 'boss' ? 'type' : level.mode, word: level.word });
  }
  function startMode(mode) {
    const pool = getWordsForDifficulty(tweaks.difficulty === 'med' ? 'med' : tweaks.difficulty);
    const w = pool[Math.floor(Math.random() * pool.length)].word;
    setRoute({ name: 'game', mode, word: w });
  }
  function finishGame(stars) { setRoute({ name: 'reward', word: route.word, stars }); }
  function closeGame() { setRoute({ name: 'home' }); }
  function handleRewardNext() {
    const nextLevel = (profile.level || 1) + 1;
    setLevelTransition({ level: nextLevel, color: '#6C8EFF' });
    window.sfx?.playLevelUp && window.sfx.playLevelUp();
    setTimeout(() => setLevelTransition(null), 700);
    setRoute({ name: 'home' });
    setTab('map');
  }

  let screen;
  if (route.name === 'home') {
    if (tab === 'home') screen = <HomeScreen profile={profile} onContinue={() => startLevel(LEVELS.find(l => l.current))} onPickMode={startMode} onOpenParent={() => setParentOpen(true)}/>;
    else if (tab === 'map') screen = <MapScreen onPlayLevel={startLevel}/>;
    else screen = <MeScreen profile={profile} onOpenParent={() => setParentOpen(true)}/>;
  } else if (route.name === 'game') {
    const props = { word: route.word, onClose: closeGame, onDone: finishGame };
    if (route.mode === 'click') screen = <ClickGame {...props}/>;
    else if (route.mode === 'drag') screen = <DragGame {...props}/>;
    else if (route.mode === 'type') screen = <TypeGame {...props}/>;
    else if (route.mode === 'missing') screen = <MissingGame {...props}/>;
    else if (route.mode === 'keyboard') screen = <KeyboardGame {...props}/>;
    else if (route.mode === 'precision') screen = <PrecisionGame {...props}/>;
  } else if (route.name === 'reward') {
    screen = <RewardScreen word={route.word} stars={route.stars} onNext={handleRewardNext} onHome={() => { setRoute({ name: 'home' }); setTab('map'); }}/>;
  }

  const DeviceFrame = tweaks.device === 'android' ? AndroidDevice : IOSDevice;
  const frameProps = tweaks.device === 'android' ? { width: 412, height: 892 } : { width: 402, height: 874 };
  return (
    <div data-screen-label={parentOpen ? '05 Parent (Mobile)' : '02 Mobile App'} style={{ position: 'relative' }}>
      <DeviceFrame {...frameProps}>
        <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
          {screen}
          {route.name === 'home' && <BottomNav tab={tab} onTab={setTab}/>}
          {parentOpen && <ParentDashboard profile={profile} onClose={() => setParentOpen(false)}/>}
          {levelTransition && <LevelTransition level={levelTransition.level} color={levelTransition.color} onDone={() => setLevelTransition(null)} />}
          <StreakBadge />
        </div>
      </DeviceFrame>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GameContextProvider>
    <App />
  </GameContextProvider>
);
