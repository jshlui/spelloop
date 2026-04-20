// Me / Profile tab — avatar, stats, achievements, settings.

function MeScreen({ profile, onOpenParent }) {
  const avatarStyle = window.__tweaks?.avatarStyle || 'animal';
  const badges = [
    { id: 'streak3', name: '3-day streak', unlocked: true, icon: '🔥' },
    { id: 'firstword', name: 'First word', unlocked: true, icon: '📝' },
    { id: 'spell5', name: '5 spellings', unlocked: true, icon: '✏️' },
    { id: 'perfect', name: 'Perfect run', unlocked: false, icon: '⭐' },
    { id: 'speed', name: 'Speed champ', unlocked: false, icon: '⚡' },
    { id: 'ch1', name: 'Ch. 1 king', unlocked: false, icon: '👑' },
  ];

  return (
    <div style={{
      padding: '70px 20px 120px', minHeight: '100%',
      background: 'linear-gradient(180deg, #EDE4FF 0%, #F3F6FA 40%)',
    }}>
      {/* avatar + name */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ position: 'relative' }}>
          <Avatar id={profile.avatar} size={120} style={avatarStyle}/>
          <div style={{
            position: 'absolute', bottom: 0, right: -4,
            background: 'var(--coral)', color: 'white', fontWeight: 900,
            fontSize: 14, padding: '4px 10px', borderRadius: 999,
            boxShadow: 'var(--shadow-tile)',
          }}>Lv {profile.level}</div>
        </div>
        <div style={{ fontSize: 'var(--fs-2xl)', fontWeight: 900, lineHeight: 1 }}>{profile.name}</div>
        <div style={{ fontSize: 14, color: 'var(--ink-mute)', fontWeight: 700 }}>Age {profile.age} · Started Apr 12</div>
      </div>

      {/* XP */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 800 }}>XP this week</span>
          <span style={{ fontWeight: 900, color: 'var(--blue-ink)' }}>240 / 500</span>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: '48%' }}/></div>
      </div>

      {/* Badges */}
      <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 900, color: 'var(--ink-soft)', letterSpacing: 0.5, textTransform: 'uppercase' }}>Badges</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
        {badges.map(b => (
          <div key={b.id} style={{
            background: b.unlocked ? 'var(--surface)' : 'rgba(31,42,68,0.04)',
            borderRadius: 'var(--r-lg)', padding: 12,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            boxShadow: b.unlocked ? 'var(--shadow-soft)' : 'none',
            opacity: b.unlocked ? 1 : 0.4,
            filter: b.unlocked ? 'none' : 'grayscale(1)',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: b.unlocked ? 'var(--yellow-soft)' : 'rgba(31,42,68,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
            }}>{b.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 800, textAlign: 'center', lineHeight: 1.2 }}>{b.name}</div>
          </div>
        ))}
      </div>

      {/* Parent button */}
      <button onClick={onOpenParent} style={{
        width: '100%', background: 'var(--surface)', border: 'none',
        padding: 16, borderRadius: 'var(--r-lg)', fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
        boxShadow: 'var(--shadow-soft)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: 'var(--blue-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="var(--blue-ink)" strokeWidth="2.2"/><path d="M4 20c0-5 4-6 8-6s8 1 8 6" stroke="var(--blue-ink)" strokeWidth="2.2" strokeLinecap="round"/></svg>
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontWeight: 900 }}>Parent area</div>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 700 }}>Reports, settings, screen time</div>
        </div>
        <svg width="10" height="16" viewBox="0 0 10 16"><path d="M1 1l8 7-8 7" stroke="var(--ink-mute)" strokeWidth="2.4" fill="none" strokeLinecap="round"/></svg>
      </button>
    </div>
  );
}

Object.assign(window, { MeScreen });
