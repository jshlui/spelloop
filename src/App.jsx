// Root shell — multi-profile, no device frames.

function makeId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

var DEFAULT_SETTINGS = { theme: 'blue', difficulty: 'med', ageSkew: '', avatarStyle: 'animal', sounds: true };
var DEFAULT_PROFILE  = { name: 'Sam', age: 7, avatar: 'fox', level: 1, streak: 0, totalStars: 0, words: 0 };

function App() {
  var [settings, setSettings] = React.useState(function() {
    try { var s = localStorage.getItem('spelloop-settings'); return s ? JSON.parse(s) : DEFAULT_SETTINGS; }
    catch(e) { return DEFAULT_SETTINGS; }
  });

  // ── Profiles (migrates old single-profile format) ──────────────────
  var [profiles, setProfilesRaw] = React.useState(function() {
    try {
      var ps = localStorage.getItem('spelloop-profiles');
      if (ps) return JSON.parse(ps);
      // Migrate from old single-profile
      var op = localStorage.getItem('spelloop-profile');
      var id = makeId();
      var p = op ? Object.assign({}, JSON.parse(op), { id: id }) : Object.assign({}, DEFAULT_PROFILE, { id: id });
      var arr = [p];
      localStorage.setItem('spelloop-profiles', JSON.stringify(arr));
      return arr;
    } catch(e) {
      var id = makeId();
      return [Object.assign({}, DEFAULT_PROFILE, { id: id })];
    }
  });

  var [activeId, setActiveIdRaw] = React.useState(function() {
    var stored = localStorage.getItem('spelloop-active-profile');
    return stored || profiles[0].id;
  });

  var profile = profiles.find(function(p) { return p.id === activeId; }) || profiles[0];

  function saveProfiles(next) {
    localStorage.setItem('spelloop-profiles', JSON.stringify(next));
    setProfilesRaw(next);
  }

  function setProfile(updater) {
    var next = profiles.map(function(p) {
      if (p.id !== activeId) return p;
      return typeof updater === 'function' ? updater(p) : Object.assign({}, p, updater);
    });
    saveProfiles(next);
  }

  function switchProfile(id) {
    localStorage.setItem('spelloop-active-profile', id);
    setActiveIdRaw(id);
  }

  function addProfile(name, age, avatar) {
    var id = makeId();
    var p = Object.assign({}, DEFAULT_PROFILE, { id: id, name: name, age: parseInt(age) || 7, avatar: avatar || 'fox' });
    var next = profiles.concat([p]);
    saveProfiles(next);
    localStorage.setItem('spelloop-levels-' + id, JSON.stringify(LEVELS.slice()));
    return id;
  }

  function deleteProfile(id) {
    if (profiles.length <= 1) return;
    var next = profiles.filter(function(p) { return p.id !== id; });
    saveProfiles(next);
    localStorage.removeItem('spelloop-levels-' + id);
    if (id === activeId) switchProfile(next[0].id);
  }

  function resetProgress(id) {
    localStorage.setItem('spelloop-levels-' + id, JSON.stringify(LEVELS.slice()));
    var next = profiles.map(function(p) {
      if (p.id !== id) return p;
      return Object.assign({}, p, { level: 1, streak: 0, totalStars: 0, words: 0 });
    });
    saveProfiles(next);
    if (id === activeId) setLevels(LEVELS.slice());
  }

  // ── Levels (per profile) ───────────────────────────────────────────
  var [levels, setLevels] = React.useState(function() {
    try {
      var key = 'spelloop-levels-' + profile.id;
      var l = localStorage.getItem(key) || localStorage.getItem('spelloop-levels');
      var parsed = l ? JSON.parse(l) : null;
      if (parsed && parsed.length < LEVELS.length) parsed = null;
      return parsed || LEVELS.slice();
    } catch(e) { return LEVELS.slice(); }
  });

  var prevIdRef = React.useRef(activeId);
  React.useEffect(function() {
    if (prevIdRef.current === activeId) return;
    prevIdRef.current = activeId;
    try {
      var key = 'spelloop-levels-' + activeId;
      var l = localStorage.getItem(key);
      var parsed = l ? JSON.parse(l) : null;
      setLevels(parsed && parsed.length >= LEVELS.length ? parsed : LEVELS.slice());
    } catch(e) { setLevels(LEVELS.slice()); }
  }, [activeId]);

  React.useEffect(function() {
    try { localStorage.setItem('spelloop-levels-' + activeId, JSON.stringify(levels)); } catch(e) {}
  }, [levels, activeId]);

  // ── Settings effects ───────────────────────────────────────────────
  React.useEffect(function() {
    try { localStorage.setItem('spelloop-settings', JSON.stringify(settings)); } catch(e) {}
    document.documentElement.setAttribute('data-theme', settings.theme || 'blue');
    document.documentElement.setAttribute('data-age', settings.ageSkew || '');
    window.__tweaks = { avatarStyle: settings.avatarStyle, difficulty: settings.difficulty };
    window.sfx && window.sfx.setEnabled && window.sfx.setEnabled(settings.sounds);
  }, [settings]);

  // ── Tutorial ───────────────────────────────────────────────────────
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
          profiles={profiles}   activeId={activeId}
          profile={profile}     setProfile={setProfile}
          levels={levels}       setLevels={setLevels}
          settings={settings}   setSettings={setSettings}
          onSwitchProfile={switchProfile}
          onAddProfile={addProfile}
          onDeleteProfile={deleteProfile}
          onResetProgress={resetProgress}
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
