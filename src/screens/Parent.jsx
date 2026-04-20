// Parent dashboard — clean, grown-up styling. Not kid-themed.

function ParentDashboard({ profile, onClose }) {
  const [tab, setTab] = React.useState('overview');

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#FAFBFC', zIndex: 300,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* top bar */}
      <div style={{
        padding: '60px 20px 14px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'white',
      }}>
        <button onClick={onClose} style={{
          width: 36, height: 36, borderRadius: 10, border: 'none',
          background: '#F1F3F6', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M10 2L4 8l6 6" stroke="#1F2A44" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: '#7C89A8', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Parent</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Sam's progress</div>
        </div>
      </div>

      {/* tabs */}
      <div style={{ display: 'flex', padding: '10px 16px 0', gap: 4, borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'white' }}>
        {['overview', 'reports', 'settings'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: 'transparent', border: 'none',
            padding: '10px 14px', fontFamily: 'inherit',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            color: tab === t ? '#1F2A44' : '#7C89A8',
            borderBottom: tab === t ? '2.5px solid #3F5FE2' : '2.5px solid transparent',
            textTransform: 'capitalize', marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'overview' && <ParentOverview profile={profile}/>}
        {tab === 'reports' && <ParentReports/>}
        {tab === 'settings' && <ParentSettings/>}
      </div>
    </div>
  );
}

function ParentOverview({ profile }) {
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
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* this week */}
      <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#7C89A8', letterSpacing: 0.5, textTransform: 'uppercase' }}>This week</span>
          <span style={{ fontSize: 12, color: '#30C285', fontWeight: 700 }}>▲ +18% vs last</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 2 }}>65 <span style={{ fontSize: 14, color: '#7C89A8', fontWeight: 700 }}>min played</span></div>
        {/* bar chart */}
        <div style={{ display: 'flex', gap: 6, height: 80, alignItems: 'flex-end', marginTop: 14 }}>
          {week.map((w, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: '100%', height: `${(w.m / maxM) * 60 + (w.done ? 4 : 2)}px`,
                background: w.today ? '#3F5FE2' : w.done ? '#A9BDFF' : '#E8ECF3',
                borderRadius: 4,
              }}/>
              <div style={{ fontSize: 10, fontWeight: 700, color: w.today ? '#3F5FE2' : '#7C89A8' }}>{w.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <MetricCard label="Words mastered" value="14" delta="+3" tone="#30C285"/>
        <MetricCard label="Accuracy" value="86%" delta="+4%" tone="#30C285"/>
        <MetricCard label="Streak" value={`${profile.streak} days`} delta="Keep going!" tone="#FFA000"/>
        <MetricCard label="Avg. session" value="11 min" delta="Target: 10m" tone="#7C89A8"/>
      </div>

      {/* areas needing work */}
      <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#7C89A8', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Focus areas</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <FocusRow word="FISH" accuracy={40} note="Mixed up S and H"/>
          <FocusRow word="MOON" accuracy={60} note="Double letter trouble"/>
          <FocusRow word="BIRD" accuracy={70} note="Strong, almost there"/>
        </div>
      </div>

      {/* recent activity */}
      <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#7C89A8', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Recent sessions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            {t: 'Today · 3:42 PM', l: 'Level 3 — SUN', s: 2, m: 'drag'},
            {t: 'Yesterday · 4:10 PM', l: 'Level 2 — DOG', s: 3, m: 'missing'},
            {t: 'Apr 18 · 5:25 PM', l: 'Level 1 — CAT', s: 3, m: 'click'},
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F1F3F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#3F5FE2', fontWeight: 900 }}>{MODE_META[r.m].icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{r.l}</div>
                <div style={{ fontSize: 11, color: '#7C89A8', fontWeight: 600 }}>{r.t}</div>
              </div>
              <StarRow filled={r.s} size={14} gap={2}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, delta, tone }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#7C89A8', letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{value}</div>
      <div style={{ fontSize: 11, color: tone, fontWeight: 700, marginTop: 2 }}>{delta}</div>
    </div>
  );
}

function FocusRow({ word, accuracy, note }) {
  const tone = accuracy < 50 ? '#F07171' : accuracy < 70 ? '#FFA000' : '#30C285';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 800 }}>{word}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: tone }}>{accuracy}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: '#EEF1F5', overflow: 'hidden', marginBottom: 4 }}>
        <div style={{ height: '100%', width: `${accuracy}%`, background: tone, borderRadius: 3 }}/>
      </div>
      <div style={{ fontSize: 11, color: '#7C89A8', fontWeight: 600 }}>{note}</div>
    </div>
  );
}

function ParentReports() {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* progress over time chart */}
      <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#7C89A8', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Accuracy · 30 days</div>
        <div style={{ fontSize: 26, fontWeight: 800 }}>86%</div>
        <svg width="100%" height="120" viewBox="0 0 300 120" style={{ marginTop: 8 }}>
          <defs>
            <linearGradient id="acc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6C8EFF" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#6C8EFF" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d="M0 80 L25 75 L50 78 L75 65 L100 70 L125 55 L150 60 L175 45 L200 48 L225 38 L250 42 L275 30 L300 28 L300 120 L0 120 Z" fill="url(#acc)"/>
          <path d="M0 80 L25 75 L50 78 L75 65 L100 70 L125 55 L150 60 L175 45 L200 48 L225 38 L250 42 L275 30 L300 28" stroke="#3F5FE2" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          {[0, 75, 150, 225, 300].map(x => <line key={x} x1={x} y1="0" x2={x} y2="120" stroke="#EEF1F5" strokeWidth="1"/>)}
        </svg>
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#7C89A8', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Mode breakdown</div>
        {[
          { m: 'click', v: 92 }, { m: 'missing', v: 88 }, { m: 'drag', v: 82 },
          { m: 'type', v: 68 }, { m: 'keyboard', v: 74 },
        ].map(r => (
          <div key={r.m} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 40px', gap: 10, alignItems: 'center', padding: '6px 0' }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'capitalize' }}>{MODE_META[r.m].label}</div>
            <div style={{ height: 8, borderRadius: 4, background: '#EEF1F5', overflow: 'hidden' }}>
              <div style={{ width: `${r.v}%`, height: '100%', background: '#3F5FE2' }}/>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, textAlign: 'right' }}>{r.v}%</div>
          </div>
        ))}
      </div>

      <button style={{
        background: 'white', border: '1px solid #E1E5EC', borderRadius: 10, padding: 14,
        fontFamily: 'inherit', fontWeight: 700, fontSize: 13, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v9m0 0l-3-3m3 3l3-3M1 13h12" stroke="#1F2A44" strokeWidth="1.8" strokeLinecap="round"/></svg>
        Email me a weekly PDF report
      </button>
    </div>
  );
}

function ParentSettings() {
  const [notif, setNotif] = React.useState(true);
  const [dailyGoal, setDailyGoal] = React.useState(10);
  const [sounds, setSounds] = React.useState(true);
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <SettingRow label="Daily goal" value={`${dailyGoal} min`} onChange={() => setDailyGoal(dailyGoal === 10 ? 15 : dailyGoal === 15 ? 20 : 10)}/>
        <SettingRow label="Difficulty" value="Medium (3–5 letters)" chev/>
        <SettingRow label="Word themes" value="Animals, Space" chev/>
        <SettingRow label="Allowed modes" value="All 5" chev last/>
      </div>
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <ToggleRow label="Reminder notifications" sub="Daily at 4:30 PM" value={notif} onChange={setNotif}/>
        <ToggleRow label="Sound effects" sub="Chimes and taps" value={sounds} onChange={(v) => { setSounds(v); window.sfx?.setEnabled(v); }} last/>
      </div>
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <SettingRow label="Screen-time cap" value="30 min/day" chev/>
        <SettingRow label="Bedtime lock" value="After 8:00 PM" chev last/>
      </div>
      <button style={{
        background: 'transparent', color: '#F07171', border: 'none',
        padding: 14, fontFamily: 'inherit', fontWeight: 700, fontSize: 13, cursor: 'pointer',
      }}>Sign out of parent area</button>
    </div>
  );
}

function SettingRow({ label, value, chev, last, onChange }) {
  return (
    <div onClick={onChange} style={{
      display: 'flex', alignItems: 'center', padding: '12px 14px',
      borderBottom: last ? 'none' : '1px solid #F1F3F6', cursor: onChange ? 'pointer' : 'default',
    }}>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#7C89A8', fontWeight: 600 }}>{value}</div>
      {chev && <svg width="8" height="14" viewBox="0 0 8 14" style={{ marginLeft: 8 }}><path d="M1 1l6 6-6 6" stroke="#B0BCCF" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>}
    </div>
  );
}

function ToggleRow({ label, sub, value, onChange, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '12px 14px',
      borderBottom: last ? 'none' : '1px solid #F1F3F6',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
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

Object.assign(window, { ParentDashboard });
