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

function WebParent({ profile, levels, settings, setSettings, onClose }) {
  var [pinVerified, setPinVerified] = React.useState(false);
  var [tab, setTab] = React.useState('overview');

  if (!pinVerified) {
    return <PinGate onSuccess={function() { setPinVerified(true); }} onCancel={onClose} />;
  }
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#F7F9FC', zIndex: 300,
      display: 'flex', fontFamily: "Nunito, system-ui, sans-serif",
    }}>
      {/* sidebar */}
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
        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>Sam's progress</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'reports', label: 'Reports' },
            { id: 'curriculum', label: 'Curriculum' },
            { id: 'settings', label: 'Settings' },
          ].map(it => (
            <button key={it.id} onClick={() => setTab(it.id)} style={{
              background: tab === it.id ? '#EEF1F9' : 'transparent',
              color: tab === it.id ? '#3F5FE2' : '#4B587A', border: 'none',
              padding: '10px 14px', borderRadius: 8, fontWeight: 700, fontSize: 13,
              textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
            }}>{it.label}</button>
          ))}
        </nav>
        <div style={{ flex: 1 }}/>
        <div style={{
          background: '#F1F3F6', padding: 12, borderRadius: 10,
          fontSize: 12, color: '#4B587A', lineHeight: 1.4,
        }}>
          <div style={{ fontWeight: 800, marginBottom: 2 }}>Weekly email</div>
          Next report Sunday, Apr 26
        </div>
      </aside>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'overview' && <OverviewTab profile={profile}/>}
        {tab === 'reports' && <ReportsTab/>}
        {tab === 'curriculum' && <CurriculumTab/>}
        {tab === 'settings' && <SettingsTab settings={settings} setSettings={setSettings}/>}
      </div>
    </div>
  );
}

function OverviewTab({ profile }) {
  const week = [
    { d: 'Mon', m: 12, done: true },
    { d: 'Tue', m: 8, done: true },
    { d: 'Wed', m: 0, done: false },
    { d: 'Thu', m: 15, done: true },
    { d: 'Fri', m: 10, done: true },
    { d: 'Sat', m: 6, done: true },
    { d: 'Sun', m: 14, done: true, today: true },
  ];
  const maxM = Math.max(...week.map(w => w.m));
  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#7C89A8', letterSpacing: 1, textTransform: 'uppercase' }}>This week · Apr 14–20</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: '4px 0 0' }}>Sam is doing great 🌱</h1>
          <div style={{ fontSize: 14, color: '#4B587A', fontWeight: 600 }}>+18% play time vs last week · 14 new words</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btnGhost}>📧 Email me</button>
          <button style={btnGhost}>📄 Export PDF</button>
        </div>
      </div>

      {/* metric row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <Metric label="Play time" value="65 min" delta="▲ +18%" tone="#30C285"/>
        <Metric label="Words mastered" value="14" delta="+3 new" tone="#30C285"/>
        <Metric label="Accuracy" value="86%" delta="▲ +4%" tone="#30C285"/>
        <Metric label="Streak" value={profile.streak + ' days'} delta="On track" tone="#FFA000"/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* play-time chart */}
        <div style={webCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Play time this week</h3>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#7C89A8' }}>minutes per day</span>
          </div>
          <div style={{ display: 'flex', gap: 10, height: 180, alignItems: 'flex-end' }}>
            {week.map((w, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#4B587A' }}>{w.m || '-'}</div>
                <div style={{
                  width: '100%',
                  height: `${(w.m / maxM) * 140 + (w.done ? 4 : 2)}px`,
                  background: w.today ? '#3F5FE2' : w.done ? '#A9BDFF' : '#E8ECF3',
                  borderRadius: 6,
                }}/>
                <div style={{ fontSize: 11, fontWeight: 700, color: w.today ? '#3F5FE2' : '#7C89A8' }}>{w.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* focus areas */}
        <div style={webCard}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 900 }}>Focus words</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Focus word="FISH" accuracy={40} note="Mixed up S and H"/>
            <Focus word="MOON" accuracy={60} note="Double letters"/>
            <Focus word="BIRD" accuracy={70} note="Close, just needs repetition"/>
          </div>
        </div>
      </div>

      {/* recent + mode breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={webCard}>
          <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 900 }}>Recent sessions</h3>
          {[
            { t: 'Today · 3:42 PM', l: 'Level 3 — SUN', s: 2, m: 'drag', dur: '6 min' },
            { t: 'Yesterday · 4:10 PM', l: 'Level 2 — DOG', s: 3, m: 'missing', dur: '4 min' },
            { t: 'Apr 18 · 5:25 PM', l: 'Level 1 — CAT', s: 3, m: 'click', dur: '5 min' },
            { t: 'Apr 17 · 4:02 PM', l: 'Free play — BEE', s: 2, m: 'type', dur: '3 min' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid #F1F3F6' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#F1F3F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#3F5FE2', fontWeight: 900 }}>{MODE_META[r.m].icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{r.l}</div>
                <div style={{ fontSize: 11, color: '#7C89A8', fontWeight: 600 }}>{r.t} · {r.dur}</div>
              </div>
              <StarRow filled={r.s} size={14} gap={2}/>
            </div>
          ))}
        </div>
        <div style={webCard}>
          <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 900 }}>Accuracy by mode</h3>
          {[
            { m: 'click', v: 92 }, { m: 'missing', v: 88 }, { m: 'drag', v: 82 },
            { m: 'keyboard', v: 74 }, { m: 'type', v: 68 },
          ].map(r => (
            <div key={r.m} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 48px', gap: 12, alignItems: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>{MODE_META[r.m].label}</div>
              <div style={{ height: 10, borderRadius: 5, background: '#EEF1F5', overflow: 'hidden' }}>
                <div style={{ width: `${r.v}%`, height: '100%', background: '#3F5FE2', borderRadius: 5 }}/>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, textAlign: 'right' }}>{r.v}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportsTab() {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 20px' }}>Reports</h1>
      <div style={webCard}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#7C89A8', letterSpacing: 0.5, textTransform: 'uppercase' }}>Accuracy · 30 days</div>
        <div style={{ fontSize: 28, fontWeight: 900 }}>86%</div>
        <svg width="100%" height="200" viewBox="0 0 800 200" style={{ marginTop: 12 }}>
          <defs>
            <linearGradient id="acc2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6C8EFF" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#6C8EFF" stopOpacity="0"/>
            </linearGradient>
          </defs>
          {[0, 50, 100, 150, 200].map(y => <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#EEF1F5"/>)}
          <path d="M0 150 L60 140 L120 145 L180 125 L240 130 L300 105 L360 110 L420 85 L480 90 L540 70 L600 75 L660 55 L720 50 L800 45 L800 200 L0 200 Z" fill="url(#acc2)"/>
          <path d="M0 150 L60 140 L120 145 L180 125 L240 130 L300 105 L360 110 L420 85 L480 90 L540 70 L600 75 L660 55 L720 50 L800 45" stroke="#3F5FE2" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}

function CurriculumTab() {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 20px' }}>Curriculum</h1>
      <div style={webCard}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Word themes</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
          {[
            { n: 'Animals', on: true }, { n: 'Space', on: true }, { n: 'Fruit', on: false },
            { n: 'Weather', on: false }, { n: 'Food', on: false }, { n: 'Transport', on: false },
          ].map(t => (
            <div key={t.n} style={{
              padding: '10px 16px', borderRadius: 999,
              background: t.on ? '#E3EAFF' : '#F7F9FC',
              color: t.on ? '#3F5FE2' : '#7C89A8',
              fontWeight: 800, fontSize: 13,
              border: `2px solid ${t.on ? '#3F5FE2' : '#E8ECF3'}`,
              cursor: 'pointer',
            }}>{t.on ? '✓ ' : '+ '}{t.n}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ settings, setSettings }) {
  var s = settings || {};
  function update(key, val) {
    setSettings && setSettings(function(prev) { return Object.assign({}, prev, { [key]: val }); });
  }
  var diffLabel = s.difficulty === 'easy' ? 'Easy (3 letters)' : s.difficulty === 'hard' ? 'Hard (5+ letters)' : 'Medium (3–5 letters)';
  var themeLabel = { blue: 'Blue (default)', sunny: 'Sunny yellow', berry: 'Berry purple', mint: 'Mint green' }[s.theme] || 'Blue';

  return (
    <div style={{ padding: 32, maxWidth: 720 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 20px' }}>Settings</h1>
      <div style={webCard}>
        <WebSettingRow label="Difficulty" value={diffLabel} chev
          onChange={function() { update('difficulty', s.difficulty === 'easy' ? 'med' : s.difficulty === 'med' ? 'hard' : 'easy'); }}/>
        <WebSettingRow label="Colour theme" value={themeLabel} chev
          onChange={function() { var themes = ['blue','sunny','berry','mint']; update('theme', themes[(themes.indexOf(s.theme||'blue')+1)%themes.length]); }}/>
        <WebSettingRow label="Avatar style" value={s.avatarStyle === 'geo' ? 'Geometric' : 'Animal'} chev last
          onChange={function() { update('avatarStyle', s.avatarStyle === 'geo' ? 'animal' : 'geo'); }}/>
      </div>
      <div style={{ height: 14 }}/>
      <div style={webCard}>
        <WebToggleRow label="Sound effects" sub="Chimes and taps" value={s.sounds !== false} onChange={function(v) { update('sounds', v); window.sfx && window.sfx.setEnabled && window.sfx.setEnabled(v); }} last/>
      </div>
      <div style={{ height: 14 }}/>
      <div style={webCard}>
        <WebSettingRow label="Change parent PIN" value="••••" chev last
          onChange={function() { if(confirm('Reset your parent PIN? You will need to set a new one.')) { localStorage.removeItem('spelloop-pin'); alert('PIN removed. You will be asked to set a new one next time.'); } }}/>
      </div>
    </div>
  );
}

function WebSettingRow({ label, value, chev, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '14px 4px',
      borderBottom: last ? 'none' : '1px solid #F1F3F6', cursor: chev ? 'pointer' : 'default',
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
      borderBottom: last ? 'none' : '1px solid #F1F3F6',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: '#7C89A8', fontWeight: 600 }}>{sub}</div>}
      </div>
      <div onClick={() => onChange(!value)} style={{
        width: 44, height: 26, borderRadius: 13, background: value ? '#3F5FE2' : '#D4DAE5',
        position: 'relative', cursor: 'pointer', transition: 'background 150ms',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: value ? 20 : 2,
          width: 22, height: 22, borderRadius: '50%', background: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 150ms',
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
  background: 'white', borderRadius: 14, padding: 18,
  boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04)',
};
const btnGhost = {
  background: 'white', border: '1px solid #E1E5EC', borderRadius: 8,
  padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
  cursor: 'pointer', color: '#1F2A44',
};

Object.assign(window, { WebParent });
