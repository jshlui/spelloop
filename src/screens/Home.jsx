// Home screen — greeting, streak, continue card, quick modes.

function HomeScreen({ profile, onContinue, onPickMode, onOpenParent }) {
  const avatarStyle = window.__tweaks?.avatarStyle || 'animal';
  const modes = ['click', 'drag', 'type', 'missing', 'keyboard'];

  const { ref: dwellRef, dwelling, progress } = window.useDwell(800);

  React.useEffect(() => {
    if (dwelling) {
      window.sfx && window.sfx.tap && window.sfx.tap();
      onContinue && onContinue();
    }
  }, [dwelling]);

  return (
    <div style={{
      padding: '70px 20px 110px', minHeight: '100%',
      background: 'linear-gradient(180deg, #FFF6EA 0%, #F3F6FA 40%)',
    }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 56, height: 56 }}>
          <Avatar id={profile.avatar} size={56} style={avatarStyle}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Hi there</div>
          <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 900, lineHeight: 1.1 }}>{profile.name}!</div>
        </div>
        <button onClick={onOpenParent} aria-label="Parent" style={{
          width: 44, height: 44, borderRadius: '50%', border: 'none',
          background: 'var(--surface)', boxShadow: 'var(--shadow-soft)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="var(--ink-soft)" strokeWidth="2"/>
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="var(--ink-soft)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* streak + stars stat row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <StatCard value={profile.streak} sub="day streak" icon={
          <svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 2 C13 6 18 8 15 13 C18 13 20 16 18 19 C17 22 14 22 12 22 C8 22 5 19 6 15 C4 15 4 12 6 11 C7 8 9 8 9 5 C11 6 11 4 12 2Z" fill="var(--coral)"/></svg>
        } color="var(--coral-soft)"/>
        <StatCard value={profile.totalStars} sub="stars" icon={<Star filled size={22}/>} color="var(--yellow-soft)"/>
        <StatCard value={profile.words} sub="words" icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v16H4z M4 9h16 M8 4v16" stroke="var(--blue-ink)" strokeWidth="2"/></svg>
        } color="var(--blue-soft)"/>
      </div>

      {/* Continue — the big hero card */}
      <div style={{
        background: 'var(--blue)', color: 'white',
        borderRadius: 'var(--r-xl)', padding: 22,
        boxShadow: 'var(--shadow-pop)', position: 'relative',
        overflow: 'hidden', marginBottom: 24,
      }}>
        {/* decorative shapes */}
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute', right: -20, top: -20, opacity: 0.22 }}>
          <circle cx="80" cy="40" r="28" fill="#FFD166"/>
          <circle cx="30" cy="90" r="18" fill="#FF9ECD"/>
          <rect x="70" y="80" width="24" height="24" rx="6" fill="#8EE3C3"/>
        </svg>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.9 }}>Chapter 1 · Level 4</div>
        <div style={{ fontSize: 'var(--fs-2xl)', fontWeight: 900, lineHeight: 1.05, marginTop: 4, marginBottom: 6 }}>Type the word</div>
        <div style={{ fontSize: 'var(--fs-md)', opacity: 0.9, fontWeight: 700 }}>Today's word: HAT</div>
        <div style={{ marginTop: 14 }}>
          <div style={{ position: 'relative', display: 'inline-block' }} ref={dwellRef}>
            <svg
              style={{
                position: 'absolute',
                inset: '-8px',
                width: 'calc(100% + 16px)',
                height: 'calc(100% + 16px)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
              viewBox="0 0 200 60"
              preserveAspectRatio="none"
            >
              <rect x="4" y="4" width="192" height="52" rx="26" ry="26"
                    fill="none" stroke="rgba(108,142,255,0.2)" strokeWidth="4"/>
              <rect x="4" y="4" width="192" height="52" rx="26" ry="26"
                    fill="none" stroke="#6C8EFF" strokeWidth="4"
                    strokeDasharray="480"
                    strokeDashoffset={480 - 480 * progress}
                    style={{ transition: 'stroke-dashoffset 0.05s linear' }}/>
            </svg>
            <button onClick={onContinue} style={{
              background: 'white', color: 'var(--blue-ink)', border: 'none',
              padding: '14px 22px', borderRadius: 999, fontSize: 16, fontWeight: 900,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 3px 0 rgba(0,0,0,0.15)',
            }}>▶ Continue</button>
          </div>
        </div>
      </div>

      {/* Mode picker grid */}
      <div style={{ fontSize: 'var(--fs-lg)', fontWeight: 900, marginBottom: 10 }}>Practice a mode</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {modes.map(m => <ModeCard key={m} mode={m} onClick={() => onPickMode(m)} />)}
      </div>
    </div>
  );
}

function StatCard({ value, sub, icon, color }) {
  return (
    <div style={{
      flex: 1, background: color, borderRadius: 'var(--r-lg)',
      padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 2,
      boxShadow: 'var(--shadow-soft)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{icon}
        <span style={{ fontSize: 22, fontWeight: 900 }}>{value}</span></div>
      <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{sub}</div>
    </div>
  );
}

function ModeCard({ mode, onClick }) {
  const m = MODE_META[mode];
  return (
    <button onClick={onClick} style={{
      background: 'var(--surface)', border: 'none', cursor: 'pointer',
      borderRadius: 'var(--r-lg)', padding: 14, textAlign: 'left',
      boxShadow: 'var(--shadow-soft)', fontFamily: 'inherit',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: m.soft, color: m.ink,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, fontWeight: 900,
      }}>{m.icon}</div>
      <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--ink)' }}>{m.label}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 700 }}>Tap to play</div>
    </button>
  );
}

Object.assign(window, { HomeScreen });
