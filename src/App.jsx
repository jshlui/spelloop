// Root shell — no device frames, no tweaks panel. Pure app.

function App() {
  var defaultSettings = { theme: 'blue', difficulty: 'med', ageSkew: '', avatarStyle: 'animal', sounds: true };
  var defaultProfile  = { name: 'Sam', age: 7, avatar: 'fox', level: 1, streak: 0, totalStars: 0, words: 0 };

  var [settings, setSettings] = React.useState(function() {
    try { var s = localStorage.getItem('spelloop-settings'); return s ? JSON.parse(s) : defaultSettings; }
    catch(e) { return defaultSettings; }
  });

  var [profile, setProfile] = React.useState(function() {
    try { var p = localStorage.getItem('spelloop-profile'); return p ? JSON.parse(p) : defaultProfile; }
    catch(e) { return defaultProfile; }
  });

  var [levels, setLevels] = React.useState(function() {
    try {
      var l = localStorage.getItem('spelloop-levels');
      var parsed = l ? JSON.parse(l) : null;
      // Reset if stale (old build had only 8 levels, new has 24)
      if (parsed && parsed.length < LEVELS.length) parsed = null;
      return parsed || LEVELS.slice();
    } catch(e) { return LEVELS.slice(); }
  });

  // Apply and persist settings
  React.useEffect(function() {
    try { localStorage.setItem('spelloop-settings', JSON.stringify(settings)); } catch(e) {}
    document.documentElement.setAttribute('data-theme', settings.theme || 'blue');
    document.documentElement.setAttribute('data-age', settings.ageSkew || '');
    window.__tweaks = { avatarStyle: settings.avatarStyle, difficulty: settings.difficulty };
    window.sfx && window.sfx.setEnabled && window.sfx.setEnabled(settings.sounds);
  }, [settings]);

  // Persist profile
  React.useEffect(function() {
    try { localStorage.setItem('spelloop-profile', JSON.stringify(profile)); } catch(e) {}
  }, [profile]);

  // Persist levels
  React.useEffect(function() {
    try { localStorage.setItem('spelloop-levels', JSON.stringify(levels)); } catch(e) {}
  }, [levels]);

  // Tutorial — use localStorage so it persists across sessions
  var [tutorialDone, setTutorialDone] = React.useState(function() {
    return localStorage.getItem('spelloop-tutorial') === '1';
  });
  var handleTutorialComplete = React.useCallback(function() {
    localStorage.setItem('spelloop-tutorial', '1');
    setTutorialDone(true);
  }, []);

  var [parentOpen, setParentOpen] = React.useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Nunito', system-ui, sans-serif" }}>
      {!tutorialDone && <HoverTutorial onComplete={handleTutorialComplete} />}
      <StreakBadge />
      <WebApp
        profile={profile}   setProfile={setProfile}
        levels={levels}     setLevels={setLevels}
        settings={settings} setSettings={setSettings}
        onOpenParent={function() { setParentOpen(true); }}
      />
      {parentOpen && (
        <WebParent
          profile={profile} levels={levels}
          settings={settings} setSettings={setSettings}
          onClose={function() { setParentOpen(false); }}
        />
      )}
    </div>
  );
}

var _root = ReactDOM.createRoot(document.getElementById('root'));
_root.render(
  React.createElement(GameContextProvider, null,
    React.createElement(App, null)
  )
);
