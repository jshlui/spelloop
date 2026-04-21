// Web Parent Dashboard — PIN-gated, full landscape layout.

function PinGate({ onSuccess, onCancel }) {
  var storedPin = localStorage.getItem('spelloop-pin');
  var isSetup = !storedPin;
  var [step, setStep] = React.useState(isSetup ? 'setup' : 'verify');
  var [digits, setDigits] = React.useState([]);
  var [firstPin, setFirstPin] = React.useState('');
  var [error, setError] = React.useState('');
  var [shake, setShake] = React.useState(false);

  function triggerError(msg) {
    setError(msg);
    setShake(true);
    setTimeout(function() { setShake(false); }, 400);
    setDigits([]);
  }

  function handleDigit(d) {
    if (digits.length >= 4) return;
    var next = digits.concat([String(d)]);
    setDigits(next);
    setError('');
    if (next.length === 4) {
      var pin = next.join('');
      setTimeout(function() {
        if (step === 'setup') {
          setFirstPin(pin);
          setStep('confirm');
          setDigits([]);
        } else if (step === 'confirm') {
          if (pin === firstPin) {
            localStorage.setItem('spelloop-pin', pin);
            onSuccess();
          } else {
            triggerError("PINs don't match — try again");
            setStep('setup');
            setFirstPin('');
          }
        } else {
          if (pin === storedPin) {
            onSuccess();
          } else {
            triggerError('Wrong PIN — try again');
          }
        }
      }, 150);
    }
  }

  function handleDelete() {
    setDigits(function(prev) { return prev.slice(0, -1); });
    setError('');
  }

  var title = step === 'setup' ? 'Set a parent PIN'
    : step === 'confirm' ? 'Confirm your PIN'
    : 'Parent area';
  var sub = step === 'setup' ? "Choose a 4-digit PIN to protect parent settings."
    : step === 'confirm' ? "Enter the same PIN again to confirm."
    : "Enter your PIN to continue.";

  var numBtnStyle = {
    width: 80, height: 80, borderRadius: 999,
    background: 'white', border: '2px solid #E8ECF3',
    fontSize: 28, fontWeight: 900, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'inherit', color: '#1F2A44',
    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
    transition: 'background 80ms',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 350,
      background: '#F7F9FC',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Nunito, system-ui, sans-serif',
    }}>
      <button onClick={onCancel} style={{
        position: 'absolute', top: 24, left: 24,
        background: '#ECEEF2', border: 'none', borderRadius: 8,
        padding: '8px 14px', fontWeight: 700, fontSize: 13,
        cursor: 'pointer', fontFamily: 'inherit', color: '#4B587A',
      }}>← Back</button>

      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 8px', color: '#1F2A44' }}>{title}</h1>
        <p style={{ fontSize: 14, color: '#7C89A8', fontWeight: 600, margin: 0, maxWidth: 300 }}>{sub}</p>
      </div>

      {/* dot indicators */}
      <div style={{ display: 'flex', gap: 18, marginBottom: 16 }}>
        {[0,1,2,3].map(function(i) {
          return <div key={i} style={{
            width: 20, height: 20, borderRadius: '50%',
            background: i < digits.length ? '#3F5FE2' : '#D4DAE5',
            transition: 'background 0.12s',
            transform: shake ? 'translateX(' + (i % 2 === 0 ? '-4px' : '4px') + ')' : 'none',
            transition: shake ? 'transform 0.1s' : 'background 0.12s',
          }}/>;
        })}
      </div>

      {error
        ? <div style={{ fontSize: 13, fontWeight: 700, color: '#F07171', marginBottom: 24, minHeight: 20 }}>{error}</div>
        : <div style={{ minHeight: 37, marginBottom: 7 }}/>
      }

      {/* numpad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 80px)', gap: 14 }}>
        {[1,2,3,4,5,6,7,8,9].map(function(n) {
          return <button key={n} onClick={function() { handleDigit(n); }} style={numBtnStyle}
            onMouseDown={function(e) { e.currentTarget.style.background = '#E3EAFF'; }}
            onMouseUp={function(e) { e.currentTarget.style.background = 'white'; }}
          >{n}</button>;
        })}
        <div/>
        <button onClick={function() { handleDigit(0); }} style={numBtnStyle}
          onMouseDown={function(e) { e.currentTarget.style.background = '#E3EAFF'; }}
          onMouseUp={function(e) { e.currentTarget.style.background = 'white'; }}
        >0</button>
        <button onClick={handleDelete} style={Object.assign({}, numBtnStyle, { fontSize: 22, color: '#7C89A8', border: 'none', background: 'transparent', boxShadow: 'none' })}>⌫</button>
      </div>
    </div>
  );
}

function WebParent({ profiles, activeId, profile, setProfile, levels, setLevels, settings, setSettings, onSwitchProfile, onAddProfile, onDeleteProfile, onResetProgress, onClose }) {
  var [pinVerified, setPinVerified] = React.useState(false);
  var [tab, setTab] = React.useState('overview');

  if (!pinVerified) {
    return <PinGate onSuccess={function() { setPinVerified(true); }} onCancel={onClose} />;
  }

  var navItems = [
    { id: 'overview',   label: '📊 Overview' },
    { id: 'profiles',   label: '👨‍👩‍👧 Kids' },
    { id: 'curriculum', label: '📚 Level Manager' },
    { id: 'settings',   label: '⚙️ Settings' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#F7F9FC', zIndex: 300,
      display: 'flex', fontFamily: "Nunito, system-ui, sans-serif",
    }}>
      <aside style={{
        width: 240, flexShrink: 0, background: 'white',
        borderRight: '1px solid rgba(0,0,0,0.06)', padding: 18,
        display: 'flex', flexDirection: 'column',
      }}>
        <button onClick={onClose} style={{
          background: '#F1F3F6', border: 'none', padding: '8px 12px',
          borderRadius: 8, fontWeight: 700, fontSize: 12, color: '#1F2A44',
          cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex',
          alignItems: 'center', gap: 6, width: 'fit-content', marginBottom: 20,
        }}>← Back to app</button>
        <div style={{ fontSize: 11, color: '#7C89A8', fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Parent area</div>
        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 20 }}>{profile.name}'s progress</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(function(it) {
            return (
              <button key={it.id} onClick={function() { setTab(it.id); }} style={{
                background: tab === it.id ? '#EEF1F9' : 'transparent',
                color: tab === it.id ? '#3F5FE2' : '#4B587A', border: 'none',
                padding: '10px 14px', borderRadius: 8, fontWeight: 700, fontSize: 13,
                textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
              }}>{it.label}</button>
            );
          })}
        </nav>
        {/* Active kid chip */}
        <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', alignItems: 'center', gap: 10, background: '#F7F9FC', borderRadius: 10, padding: 10 }}>
          <Avatar id={profile.avatar} size={36}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 900, fontSize: 13 }}>{profile.name}</div>
            <div style={{ fontSize: 11, color: '#7C89A8', fontWeight: 600 }}>Active profile</div>
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'overview'   && <OverviewTab profile={profile} levels={levels}/>}
        {tab === 'profiles'   && <ProfilesTab profiles={profiles} activeId={activeId} onSwitch={onSwitchProfile} onAdd={onAddProfile} onDelete={onDeleteProfile} onReset={onResetProgress}/>}
        {tab === 'curriculum' && <CurriculumTab levels={levels} setLevels={setLevels}/>}
        {tab === 'settings'   && <SettingsTab profile={profile} setProfile={setProfile} settings={settings} setSettings={setSettings}/>}
      </div>
    </div>
  );
}

function ProfilesTab({ profiles, activeId, onSwitch, onAdd, onDelete, onReset }) {
  var [showAdd, setShowAdd] = React.useState(false);
  var [newName, setNewName] = React.useState('');
  var [newAge, setNewAge] = React.useState('');
  var [newAvatar, setNewAvatar] = React.useState('fox');
  var [confirmState, setConfirmState] = React.useState(null); // { id, action: 'reset'|'delete', name }

  function handleAdd() {
    var n = newName.trim();
    if (!n) return;
    onAdd(n, parseInt(newAge) || 7, newAvatar);
    setNewName(''); setNewAge(''); setNewAvatar('fox');
    setShowAdd(false);
  }

  function handleConfirm() {
    if (!confirmState) return;
    if (confirmState.action === 'reset') onReset(confirmState.id);
    else onDelete(confirmState.id);
    setConfirmState(null);
  }

  var inputStyle = {
    border: '1px solid var(--alpha-md)', borderRadius: 8, padding: '8px 12px',
    fontSize: 14, fontFamily: 'inherit', fontWeight: 700, color: 'var(--ink)',
    outline: 'none',
  };

  return (
    <div style={{ padding: 32, maxWidth: 760 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 4px' }}>Kids profiles</h1>
          <div style={{ fontSize: 13, color: '#7C89A8', fontWeight: 600 }}>Each child has their own progress, avatar and levels.</div>
        </div>
        <button onClick={function() { setShowAdd(!showAdd); }} style={{
          background: 'var(--blue-ink)', color: 'white', border: 'none', borderRadius: 10,
          padding: '10px 18px', fontWeight: 800, fontSize: 13, cursor: 'pointer',
          fontFamily: 'inherit',
        }}>+ Add child</button>
      </div>

      {/* Add child form */}
      {showAdd && (
        <div style={Object.assign({}, webCard, { marginBottom: 20, border: '2px solid var(--blue-ink)' })}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 900 }}>New profile</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#7C89A8', marginBottom: 4 }}>Name</div>
              <input value={newName} onChange={function(e) { setNewName(e.target.value); }}
                onKeyDown={function(e) { if (e.key === 'Enter') handleAdd(); }}
                style={Object.assign({}, inputStyle, { width: '100%' })} placeholder="Child's name" autoFocus/>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#7C89A8', marginBottom: 4 }}>Age</div>
              <input value={newAge} onChange={function(e) { setNewAge(e.target.value); }}
                style={Object.assign({}, inputStyle, { width: '100%' })} placeholder="Age" type="number" min="3" max="12"/>
            </div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#7C89A8', marginBottom: 8 }}>Avatar</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            {AVATARS.map(function(av) {
              var sel = newAvatar === av.id;
              return (
                <button key={av.id} onClick={function() { setNewAvatar(av.id); }} style={{
                  border: 'none', background: sel ? 'var(--blue-soft)' : 'var(--bg)', borderRadius: 14,
                  padding: '10px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 4,
                  outline: sel ? '3px solid var(--blue-ink)' : 'none', outlineOffset: 2,
                }}>
                  <Avatar id={av.id} size={52}/>
                  <div style={{ fontSize: 11, fontWeight: 800, color: sel ? 'var(--blue-ink)' : 'var(--ink-mute)' }}>{av.name}</div>
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleAdd} style={{
              background: 'var(--blue-ink)', color: 'white', border: 'none', borderRadius: 8,
              padding: '10px 20px', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            }}>Create profile</button>
            <button onClick={function() { setShowAdd(false); }} style={Object.assign({}, btnGhost)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Inline confirm overlay */}
      {confirmState && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'rgba(31,42,68,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={Object.assign({}, webCard, { maxWidth: 380, width: '90vw', textAlign: 'center' })}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{confirmState.action === 'delete' ? '🗑️' : '↺'}</div>
            <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 8 }}>
              {confirmState.action === 'delete' ? 'Delete ' + confirmState.name + '?' : 'Reset ' + confirmState.name + '?'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 20 }}>
              {confirmState.action === 'delete'
                ? 'This profile and all their progress will be permanently removed.'
                : 'All stars, words and level progress will be cleared. This cannot be undone.'}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={function() { setConfirmState(null); }} style={Object.assign({}, btnGhost)}>Cancel</button>
              <button onClick={handleConfirm} style={{
                background: 'var(--danger-soft)', color: 'var(--danger-text)', border: '1px solid var(--danger-text)',
                borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 800,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {confirmState.action === 'delete' ? 'Yes, delete' : 'Yes, reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {profiles.map(function(p) {
          var isActive = p.id === activeId;
          return (
            <div key={p.id} style={Object.assign({}, webCard, {
              border: isActive ? '2px solid var(--blue-ink)' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: 20,
            })}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Avatar id={p.avatar} size={64}/>
                {isActive && (
                  <div style={{
                    position: 'absolute', bottom: -4, right: -4,
                    background: 'var(--blue-ink)', color: 'white', borderRadius: 999,
                    fontSize: 9, fontWeight: 900, padding: '2px 6px', whiteSpace: 'nowrap',
                  }}>ACTIVE</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 900 }}>{p.name}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 600 }}>
                  Age {p.age} &nbsp;·&nbsp; {p.words} words &nbsp;·&nbsp; {p.totalStars}⭐ &nbsp;·&nbsp; {p.streak} day streak
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {!isActive && (
                  <button onClick={function() { onSwitch(p.id); }} style={Object.assign({}, btnGhost, { fontWeight: 800 })}>
                    Switch
                  </button>
                )}
                <button onClick={function() { setConfirmState({ id: p.id, action: 'reset', name: p.name }); }} style={{
                  background: 'var(--danger-soft)', border: '1px solid var(--alpha-md)', color: 'var(--danger-text)',
                  borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 800,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>↺ Reset</button>
                {profiles.length > 1 && (
                  <button onClick={function() { setConfirmState({ id: p.id, action: 'delete', name: p.name }); }}
                    style={Object.assign({}, btnGhost, { color: 'var(--danger-text)', borderColor: 'var(--alpha-md)' })}>✕</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OverviewTab({ profile, levels }) {
  var ctx = React.useContext(window.GameContext) || {};
  var accuracy = ctx.totalClicks > 0 ? Math.round(ctx.accuracy * 100) : null;
  var doneCount = levels ? levels.filter(function(l) { return l.done; }).length : 0;
  var doneLevels = levels ? levels.filter(function(l) { return l.done; }).slice(-5).reverse() : [];
  var chapterStats = (window.CHAPTER_META || []).map(function(ch) {
    var chLevels = levels ? levels.filter(function(l) { return l.chapter === ch.id; }) : [];
    return { id: ch.id, name: ch.name, emoji: ch.emoji, done: chLevels.filter(function(l) { return l.done; }).length, total: chLevels.length };
  }).filter(function(ch) { return ch.total > 0; });

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#7C89A8', letterSpacing: 1, textTransform: 'uppercase' }}>Parent overview</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: '4px 0 0' }}>{profile.name}'s progress 🌱</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <Metric label="Words spelled" value={profile.words} delta={profile.words >= 5 ? '🏆 5+ milestone' : (5 - profile.words) + ' to next badge'} tone="#30C285"/>
        <Metric label="Total stars" value={profile.totalStars} delta={'XP: ' + (profile.totalStars * 10)} tone="#FFA000"/>
        <Metric label="Accuracy" value={accuracy !== null ? accuracy + '%' : '—'} delta={accuracy !== null ? (accuracy >= 80 ? '🎉 Excellent!' : 'Keep practising') : 'Play to track'} tone={accuracy !== null && accuracy >= 80 ? '#30C285' : '#7C89A8'}/>
        <Metric label="Streak" value={profile.streak + ' days'} delta={profile.streak >= 3 ? '🔥 On fire!' : 'Keep it up'} tone={profile.streak >= 3 ? '#FF7043' : '#FFA000'}/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Chapter progress */}
        <div style={webCard}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 900 }}>Chapter progress</h3>
          {chapterStats.map(function(ch) {
            var pct = Math.round(ch.done / ch.total * 100);
            var tone = pct === 100 ? 'var(--success)' : pct > 0 ? 'var(--blue-ink)' : 'var(--ink-mute)';
            return (
              <div key={ch.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 800 }}>{ch.emoji} {ch.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: tone }}>{ch.done}/{ch.total}</span>
                </div>
                <div style={{ height: 10, borderRadius: 5, background: 'var(--bg)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: pct + '%', background: tone, borderRadius: 5, transition: 'width 0.5s var(--ease-toy)' }}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent completed levels */}
        <div style={webCard}>
          <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 900 }}>Recent levels ({doneCount} total)</h3>
          {doneLevels.length === 0 && <div style={{ fontSize: 13, color: '#7C89A8', fontWeight: 600 }}>No levels completed yet — play some rounds!</div>}
          {doneLevels.map(function(lv, i) {
            var m = MODE_META[lv.mode] || MODE_META.click;
            return (
              <div key={lv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderTop: i === 0 ? 'none' : '1px solid var(--alpha-sm)' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900 }}>{m.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>Level {lv.id} — {lv.word}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 600 }}>Chapter {lv.chapter} · {m.label}</div>
                </div>
                <StarRow filled={lv.stars} size={14} gap={2}/>
              </div>
            );
          })}
        </div>
      </div>

      <div style={webCard}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 900 }}>Overall journey</h3>
        <div style={{ fontSize: 13, color: '#4B587A', fontWeight: 600, marginBottom: 10 }}>{doneCount} of {levels ? levels.length : 24} levels complete</div>
        <div style={{ height: 14, borderRadius: 7, background: 'var(--bg)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: (levels && levels.length ? Math.round(doneCount / levels.length * 100) : 0) + '%', background: 'var(--blue)', borderRadius: 7, transition: 'width 0.5s var(--ease-toy)' }}/>
        </div>
      </div>
    </div>
  );
}

function CurriculumTab({ levels, setLevels }) {
  var chapters = window.CHAPTER_META || [
    { id: 1, name: 'The Word Forest', emoji: '🌳' },
    { id: 2, name: 'The Word Sea', emoji: '🌊' },
    { id: 3, name: 'The Word Mountain', emoji: '⛰️' },
  ];

  function resetLevel(levelId) {
    setLevels(function(prev) {
      var idx = prev.findIndex(function(l) { return l.id === levelId; });
      if (idx < 0) return prev;
      var next = prev.map(function(l, i) {
        if (i === idx) return Object.assign({}, l, { done: false, stars: 0, current: !l.locked, locked: l.locked });
        return l;
      });
      // If no level is current, make the first unlocked non-done one current
      var hasCurrent = next.some(function(l) { return l.current; });
      if (!hasCurrent) {
        var firstUnlocked = next.findIndex(function(l) { return !l.locked && !l.done; });
        if (firstUnlocked >= 0) next[firstUnlocked] = Object.assign({}, next[firstUnlocked], { current: true });
        else if (idx > 0 && !next[idx - 1].locked) next[idx] = Object.assign({}, next[idx], { current: true });
      }
      return next;
    });
  }

  function resetChapter(chapterId) {
    if (!window.confirm('Reset all ' + (chapters.find(function(c) { return c.id === chapterId; }) || {}).name + ' levels? Stars will be cleared.')) return;
    setLevels(function(prev) {
      return prev.map(function(l, i) {
        if (l.chapter !== chapterId) return l;
        var isFirst = i === prev.findIndex(function(x) { return x.chapter === chapterId; });
        return Object.assign({}, l, { done: false, stars: 0, current: isFirst && !l.locked, locked: l.locked });
      });
    });
  }

  return (
    <div style={{ padding: 32, maxWidth: 800 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 6px' }}>Level Manager</h1>
      <p style={{ fontSize: 13, color: '#7C89A8', fontWeight: 600, margin: '0 0 24px' }}>Reset individual levels or whole chapters to let your child replay them.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {chapters.map(function(ch) {
          var chLevels = levels ? levels.filter(function(l) { return l.chapter === ch.id; }) : [];
          var doneCt = chLevels.filter(function(l) { return l.done; }).length;
          return (
            <div key={ch.id} style={webCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>{ch.emoji} {ch.name}</div>
                  <div style={{ fontSize: 12, color: '#7C89A8', fontWeight: 600 }}>{doneCt}/{chLevels.length} complete</div>
                </div>
                <button onClick={function() { resetChapter(ch.id); }} style={{
                  background: '#FFF0F0', border: '1px solid #FFB3B3', color: '#C0392B',
                  borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 800,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>↺ Reset chapter</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {chLevels.map(function(lv) {
                  var m = MODE_META[lv.mode] || MODE_META.click;
                  var statusColor = lv.done ? 'var(--success)' : lv.current ? 'var(--blue-ink)' : lv.locked ? 'var(--ink-mute)' : 'var(--warn)';
                  var statusLabel = lv.done ? (lv.stars + '★ earned') : lv.current ? 'Current' : lv.locked ? 'Locked' : 'Unlocked';
                  return (
                    <div key={lv.id} style={{
                      background: 'var(--bg)', borderRadius: 10, padding: 10,
                      border: lv.current ? '2px solid var(--blue-ink)' : '2px solid transparent',
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-mute)', marginBottom: 2 }}>Lv {lv.id} · {m.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 2 }}>{lv.word}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: statusColor, marginBottom: 6 }}>{statusLabel}</div>
                      {lv.done && (
                        <button onClick={function() { resetLevel(lv.id); }} style={{
                          background: 'white', border: '1px solid #E1E5EC', color: '#4B587A',
                          borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'inherit', width: '100%',
                        }}>↺ Replay</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SettingsTab({ profile, setProfile, settings, setSettings }) {
  var s = settings || {};
  var [nameVal, setNameVal] = React.useState(profile ? profile.name : '');
  var [ageVal, setAgeVal] = React.useState(profile ? String(profile.age) : '');
  var [elKey, setElKey]           = React.useState(function() { try { return localStorage.getItem('spelloop-el-key') || ''; } catch(e) { return ''; } });
  var [elVoice, setElVoice]       = React.useState(function() { try { return localStorage.getItem('spelloop-el-voice') || 'pNInz6obpgDQGcFmaJgB'; } catch(e) { return 'pNInz6obpgDQGcFmaJgB'; } });
  var [elKeyError, setElKeyError] = React.useState('');
  var [elKeySaved, setElKeySaved] = React.useState(false);

  var EL_VOICES = [
    { id: 'pNInz6obpgDQGcFmaJgB', label: 'Adam' },
    { id: 'EXAVITQu4vr4xnSDxMaL', label: 'Bella' },
    { id: 'VR6AewLTigWG4xSOukaG', label: 'Arnold' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', label: 'Josh' },
    { id: 'yoZ06aMxZJJ28mfd3POQ', label: 'Sam' },
    { id: 'jBpfuIE2acCys8YRkVHT', label: 'Freya' },
  ];

  function saveElKey() {
    try {
      var trimmed = elKey.trim();
      if (!trimmed) { clearElKey(); return; }
      localStorage.setItem('spelloop-el-key', trimmed);
      setElKeyError('');
      setElKeySaved(true);
      setTimeout(function() { setElKeySaved(false); }, 2000);
    } catch(e) { setElKeyError('Could not save — storage error'); }
  }

  function clearElKey() {
    try {
      localStorage.removeItem('spelloop-el-key');
      localStorage.removeItem('spelloop-el-voice');
      var toRemove = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.startsWith('spelloop-audio-')) toRemove.push(k);
      }
      toRemove.forEach(function(k) { localStorage.removeItem(k); });
      setElKey('');
      setElVoice('pNInz6obpgDQGcFmaJgB');
      setElKeyError('');
      setElKeySaved(false);
    } catch(e) {}
  }

  function handleVoiceChange(e) {
    var id = e.target.value;
    setElVoice(id);
    try { localStorage.setItem('spelloop-el-voice', id); } catch(e2) {}
  }

  function updateSetting(key, val) {
    setSettings && setSettings(function(prev) { return Object.assign({}, prev, { [key]: val }); });
  }
  function saveProfile() {
    var n = nameVal.trim();
    var a = parseInt(ageVal, 10);
    if (!n) return;
    setProfile && setProfile(function(prev) {
      return Object.assign({}, prev, { name: n, age: isNaN(a) ? prev.age : a });
    });
  }

  var diffLabel = s.difficulty === 'easy' ? 'Easy (3 letters)' : s.difficulty === 'hard' ? 'Hard (5+ letters)' : 'Medium (3–5 letters)';
  var themeLabel = { blue: 'Blue (default)', sunny: 'Sunny yellow', berry: 'Berry purple', mint: 'Mint green' }[s.theme] || 'Blue';

  var inputStyle = {
    border: '1px solid var(--alpha-md)', borderRadius: 8, padding: '8px 12px',
    fontSize: 14, fontFamily: 'inherit', fontWeight: 700, color: 'var(--ink)',
    outline: 'none', width: '100%',
    transition: 'border-color var(--dur-fast) ease',
  };

  return (
    <div style={{ padding: 32, maxWidth: 720 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 20px' }}>Settings</h1>

      {/* Child profile */}
      <div style={Object.assign({}, webCard, { marginBottom: 14 })}>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 900 }}>Child profile</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#7C89A8', marginBottom: 4 }}>Name</div>
            <input value={nameVal} onChange={function(e) { setNameVal(e.target.value); }}
              onKeyDown={function(e) { if (e.key === 'Enter') saveProfile(); }}
              style={inputStyle} placeholder="Child's name"/>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#7C89A8', marginBottom: 4 }}>Age</div>
            <input value={ageVal} onChange={function(e) { setAgeVal(e.target.value); }}
              onKeyDown={function(e) { if (e.key === 'Enter') saveProfile(); }}
              style={inputStyle} placeholder="Age" type="number" min="3" max="12"/>
          </div>
        </div>
        <button className="btn-3d" onClick={saveProfile} style={{
          background: 'var(--blue-ink)', color: 'white', border: 'none', borderRadius: 8,
          padding: '10px 20px', fontWeight: 800, fontSize: 13, cursor: 'pointer',
          fontFamily: 'inherit',
        }}>Save name &amp; age</button>
      </div>

      {/* Game settings */}
      <div style={Object.assign({}, webCard, { marginBottom: 14 })}>
        <WebSettingRow label="Difficulty" value={diffLabel} chev
          onChange={function() { updateSetting('difficulty', s.difficulty === 'easy' ? 'med' : s.difficulty === 'med' ? 'hard' : 'easy'); }}/>
        <WebSettingRow label="Colour theme" value={themeLabel} chev
          onChange={function() { var themes = ['blue','sunny','berry','mint']; updateSetting('theme', themes[(themes.indexOf(s.theme||'blue')+1)%themes.length]); }}/>
        <WebSettingRow label="Avatar style" value={s.avatarStyle === 'geo' ? 'Geometric' : 'Animal'} chev last
          onChange={function() { updateSetting('avatarStyle', s.avatarStyle === 'geo' ? 'animal' : 'geo'); }}/>
      </div>
      <div style={Object.assign({}, webCard, { marginBottom: 14 })}>
        <WebToggleRow label="Sound effects" sub="Chimes and taps" value={s.sounds !== false} onChange={function(v) { updateSetting('sounds', v); window.sfx && window.sfx.setEnabled && window.sfx.setEnabled(v); }} last/>
      </div>
      <div style={webCard}>
        <WebSettingRow label="Change parent PIN" value="••••" chev last
          onChange={function() { if(confirm('Reset your parent PIN? You will need to set a new one.')) { localStorage.removeItem('spelloop-pin'); alert('PIN removed. Reload the page to set a new one.'); } }}/>
      </div>

      <div style={Object.assign({}, webCard, { marginTop: 14 })}>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 900 }}>🔊 Voice settings</h3>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#7C89A8', marginBottom: 4 }}>ElevenLabs API Key</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="password"
              value={elKey}
              onChange={function(e) { setElKey(e.target.value); setElKeyError(''); setElKeySaved(false); }}
              onKeyDown={function(e) { if (e.key === 'Enter') saveElKey(); }}
              placeholder="Paste your API key here"
              style={inputStyle}
            />
            <button onClick={saveElKey} style={{
              flexShrink: 0, padding: '8px 14px', borderRadius: 8, border: 'none',
              background: elKeySaved ? 'var(--mint, #8EE3C3)' : 'var(--blue-ink, #3F5FE2)',
              color: 'white', fontFamily: 'inherit', fontWeight: 800, fontSize: 13, cursor: 'pointer',
              transition: 'background 200ms',
            }}>{elKeySaved ? '✓ Saved' : 'Save'}</button>
            {elKey && (
              <button onClick={clearElKey} style={{
                flexShrink: 0, padding: '8px 14px', borderRadius: 8, border: 'none',
                background: '#FFE8DF', color: '#C0392B',
                fontFamily: 'inherit', fontWeight: 800, fontSize: 13, cursor: 'pointer',
              }}>Clear</button>
            )}
          </div>
          {elKeyError && <div style={{ fontSize: 12, color: '#F07171', fontWeight: 700, marginTop: 4 }}>{elKeyError}</div>}
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#7C89A8', marginBottom: 4 }}>Voice</div>
          <select
            value={elVoice}
            onChange={handleVoiceChange}
            style={Object.assign({}, inputStyle, { width: 'auto', minWidth: 160 })}
          >
            {EL_VOICES.map(function(v) {
              return React.createElement('option', { key: v.id, value: v.id }, v.label);
            })}
          </select>
        </div>

        <div style={{ fontSize: 12, color: '#7C89A8', fontWeight: 700, lineHeight: 1.5, background: '#F7F9FC', borderRadius: 8, padding: '10px 12px' }}>
          ℹ️ Get a free key at <strong>elevenlabs.io</strong> (10,000 characters/month free).<br/>
          Without a key, the app uses your device's built-in voice.
        </div>
      </div>
    </div>
  );
}

function WebSettingRow({ label, value, chev, last, onChange }) {
  return (
    <div onClick={onChange} style={{
      display: 'flex', alignItems: 'center', padding: '14px 4px',
      borderBottom: last ? 'none' : '1px solid var(--alpha-sm)', cursor: chev ? 'pointer' : 'default',
    }}>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#7C89A8', fontWeight: 700 }}>{value}</div>
      {chev && <svg width="8" height="14" viewBox="0 0 8 14" style={{ marginLeft: 10 }}><path d="M1 1l6 6-6 6" stroke="#B0BCCF" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>}
    </div>
  );
}

function WebToggleRow({ label, sub, value, onChange, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '14px 4px',
      borderBottom: last ? 'none' : '1px solid var(--alpha-sm)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: '#7C89A8', fontWeight: 600 }}>{sub}</div>}
      </div>
      <div onClick={function() { onChange(!value); }} style={{
        width: 44, height: 26, borderRadius: 13, background: value ? 'var(--blue-ink)' : 'var(--alpha-lg)',
        position: 'relative', cursor: 'pointer', transition: 'background var(--dur-fast) ease',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: value ? 'calc(100% - 24px)' : '2px',
          width: 22, height: 22, borderRadius: '50%', background: 'white',
          boxShadow: '0 1px 4px var(--alpha-lg)', transition: 'left var(--dur-fast) var(--ease-toy)',
        }}/>
      </div>
    </div>
  );
}

function Metric({ label, value, delta, tone }) {
  return (
    <div style={webCard}>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#7C89A8', letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 900, margin: '4px 0 2px', letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 12, color: tone, fontWeight: 800 }}>{delta}</div>
    </div>
  );
}
function Focus({ word, accuracy, note }) {
  const tone = accuracy < 50 ? '#F07171' : accuracy < 70 ? '#FFA000' : '#30C285';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 900 }}>{word}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: tone }}>{accuracy}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: '#EEF1F5', overflow: 'hidden', marginBottom: 4 }}>
        <div style={{ height: '100%', width: `${accuracy}%`, background: tone }}/>
      </div>
      <div style={{ fontSize: 11, color: '#7C89A8', fontWeight: 600 }}>{note}</div>
    </div>
  );
}

const webCard = {
  background: 'var(--surface)', borderRadius: 14, padding: 18,
  boxShadow: 'var(--shadow-soft)',
};
const btnGhost = {
  background: 'var(--surface)', border: '1px solid var(--alpha-md)', borderRadius: 8,
  padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
  cursor: 'pointer', color: 'var(--ink)',
};

Object.assign(window, { WebParent });
