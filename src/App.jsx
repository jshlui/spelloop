// Root shell — multi-profile, no device frames.

function makeId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

var DEFAULT_SETTINGS = { theme: 'blue', difficulty: 'med', ageSkew: '', avatarStyle: 'animal', sounds: true };
var DEFAULT_PROFILE  = {
  name: 'Sam', age: 7, avatar: 'fox', level: 1, streak: 0,
  lastStreakDate: null,
  totalStars: 0, words: 0, coins: 0,
  inventory: [], equipped: {},
  starterPicked: false,
  ownedSpecies:  [],
  activePetId:   null,
  feedCount:     0,
  petData:       {},
  treats:        {},
  powerups:      {},
};

function makePetEntry(spec, source) {
  source = source || {};
  var entry = {
    name:         source.name || source.petName || (spec && spec.name) || 'Pebble',
    mood:         source.mood != null ? source.mood : (source.petMood != null ? source.petMood : 80),
    lastPlayed:   source.lastPlayed || source.petLastPlayed || null,
    equipped:     source.equipped || source.petEquipped || {},
    shiny:        source.shiny || false,
    happyDays:    source.happyDays || 0,
    lastMoodDate: source.lastMoodDate || null,
    room:         source.room || null,
    toys:         source.toys || [],
  };
  if (source.growthPoints != null) entry.growthPoints = source.growthPoints;
  if (spec && spec.shinyKey && entry[spec.shinyKey] == null) entry[spec.shinyKey] = 0;
  return entry;
}

function getStarterPetSpec(id) {
  var species = window.PET_SPECIES || [];
  return species.find(function(s) { return s.id === id; })
    || species.find(function(s) { return s.isStarter; })
    || { id: 'pebble', name: 'Pebble' };
}

function migrateProfile(p) {
  var out = Object.assign({}, p);
  // Legacy field migrations
  if (!out.inventory) out.inventory = [];
  if (!out.equipped)  out.equipped  = {};
  if (out.feedCount == null) out.feedCount = 0;
  if (!out.petData)   out.petData   = {};
  if (!out.treats)    out.treats    = {};
  if (!out.powerups)  out.powerups  = {};
  if (out.lastStreakDate === undefined) out.lastStreakDate = null;
  // Migrate existing petData entries to include room + toys
  Object.keys(out.petData).forEach(function(id) {
    if (out.petData[id].room === undefined) out.petData[id].room = null;
    if (!out.petData[id].toys) out.petData[id].toys = [];
  });

  if (out.starterPicked == null) {
    // Existing users get treated as having picked Pebble
    out.starterPicked = true;
    out.ownedSpecies  = out.ownedSpecies || ['pebble'];
    out.activePetId   = out.activePetId  || 'pebble';
    if (!out.petData.pebble) {
      out.petData = Object.assign({}, out.petData, { pebble: makePetEntry(getStarterPetSpec('pebble'), out) });
    }
  }
  if (out.starterPicked) {
    var owned = Array.isArray(out.ownedSpecies) ? out.ownedSpecies.slice() : [];
    var active = out.activePetId || owned[0] || 'pebble';
    var spec = getStarterPetSpec(active);
    active = spec.id || active;
    if (!owned.includes(active)) owned.unshift(active);
    out.ownedSpecies = owned.length ? owned : [active];
    out.activePetId = active;
    if (!out.petData[active]) {
      out.petData = Object.assign({}, out.petData);
      out.petData[active] = makePetEntry(spec, out);
    } else {
      out.petData[active] = makePetEntry(spec, out.petData[active]);
    }
  }
  // Remove old flat pet fields now nested in petData
  delete out.petMood;
  delete out.petName;
  delete out.petLastPlayed;
  delete out.petEquipped;
  return out;
}

function App() {
  var [settings, setSettings] = React.useState(function() {
    try { var s = localStorage.getItem('spelloop-settings'); return s ? JSON.parse(s) : DEFAULT_SETTINGS; }
    catch(e) { return DEFAULT_SETTINGS; }
  });

  // ── Profiles (migrates old single-profile format) ──────────────────
  var [profiles, setProfilesRaw] = React.useState(function() {
    try {
      var ps = localStorage.getItem('spelloop-profiles');
      if (ps) return JSON.parse(ps).map(migrateProfile);
      // Migrate from old single-profile
      var op = localStorage.getItem('spelloop-profile');
      var id = makeId();
      var p = op ? migrateProfile(Object.assign({}, JSON.parse(op), { id: id })) : Object.assign({}, DEFAULT_PROFILE, { id: id });
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
  function mergeWithCanonical(parsed) {
    if (!parsed || !parsed.length) return LEVELS.slice();
    var savedById = {};
    var savedByKey = {};
    parsed.forEach(function(lv) {
      savedById[lv.id] = lv;
      savedByKey[lv.mode + '|' + lv.word] = lv;
    });
    var next = LEVELS.map(function(canon) {
      var byId = savedById[canon.id];
      var sv = byId && byId.mode === canon.mode && byId.word === canon.word
        ? byId
        : savedByKey[canon.mode + '|' + canon.word];
      if (!sv) return Object.assign({}, canon);
      var merged = Object.assign({}, canon, {
        stars: sv.stars || 0,
        done: !!sv.done,
        locked: sv.locked,
        current: !!sv.current,
      });
      if (merged.locked == null) delete merged.locked;
      // Never-played level: respect canonical lock state so new unlocked entries aren't frozen
      if (!merged.done && merged.stars === 0 && merged.locked && !canon.locked) {
        return Object.assign({}, merged, { locked: false });
      }
      return merged;
    });
    if (!next.some(function(lv) { return lv.current; })) {
      var firstOpen = next.findIndex(function(lv, idx) {
        if (lv.done) return false;
        var prev = idx > 0 ? next[idx - 1] : null;
        return !lv.locked || !prev || prev.done;
      });
      if (firstOpen !== -1) next[firstOpen] = Object.assign({}, next[firstOpen], { locked: false, current: true });
    }
    return next;
  }

  var [levels, setLevels] = React.useState(function() {
    try {
      var key = 'spelloop-levels-' + profile.id;
      var l = localStorage.getItem(key) || localStorage.getItem('spelloop-levels');
      return mergeWithCanonical(l ? JSON.parse(l) : null);
    } catch(e) { return LEVELS.slice(); }
  });

  var prevIdRef = React.useRef(activeId);
  React.useEffect(function() {
    if (prevIdRef.current === activeId) return;
    prevIdRef.current = activeId;
    try {
      var key = 'spelloop-levels-' + activeId;
      var l = localStorage.getItem(key);
      setLevels(mergeWithCanonical(l ? JSON.parse(l) : null));
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
