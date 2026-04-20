// Tweaks panel — floating bottom-right. Host-sync via postMessage.

function TweaksPanel({ tweaks, setTweaks, visible }) {
  if (!visible) return null;
  function update(key, val) {
    const next = { ...tweaks, [key]: val };
    setTweaks(next);
    try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: val } }, '*'); } catch (e) {}
  }
  return (
    <div style={{
      position: 'fixed', right: 16, bottom: 16, width: 280, zIndex: 10000,
      background: 'white', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
      padding: 14, fontFamily: 'Nunito, system-ui', fontSize: 13, color: '#1F2A44',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: 4, background: '#3F5FE2' }}/>
        <span style={{ fontWeight: 900 }}>Tweaks</span>
      </div>
      <TweakRow label="Platform">
        <Segmented v={tweaks.platform} onChange={v => update('platform', v)} opts={[['web','Web'],['mobile','Mobile']]}/>
      </TweakRow>
      <TweakRow label="Age skew">
        <Segmented v={tweaks.age} onChange={v => update('age', v)} opts={[['young','4-6'],['mid','6-8'],['old','8-10']]}/>
      </TweakRow>
      <TweakRow label="Theme color">
        <Segmented v={tweaks.theme} onChange={v => update('theme', v)} opts={[['blue','Blue'],['sunny','Sun'],['berry','Berry'],['mint','Mint']]}/>
      </TweakRow>
      <TweakRow label="Avatar style">
        <Segmented v={tweaks.avatarStyle} onChange={v => update('avatarStyle', v)} opts={[['animal','Animal'],['geo','Geo']]}/>
      </TweakRow>
      <TweakRow label="Difficulty">
        <Segmented v={tweaks.difficulty} onChange={v => update('difficulty', v)} opts={[['easy','3L'],['med','3-5L'],['hard','5L']]}/>
      </TweakRow>
      <TweakRow label="Device">
        <Segmented v={tweaks.device} onChange={v => update('device', v)} opts={[['ios','iOS'],['android','Android']]}/>
      </TweakRow>
      <TweakRow label="Parent dash">
        <Segmented v={tweaks.parentOpen ? 'on' : 'off'} onChange={v => update('parentOpen', v === 'on')} opts={[['off','Off'],['on','On']]}/>
      </TweakRow>
      <TweakRow label="Sounds">
        <Segmented v={tweaks.sounds ? 'on' : 'off'} onChange={v => { update('sounds', v === 'on'); window.sfx?.setEnabled(v === 'on'); }} opts={[['on','On'],['off','Off']]}/>
      </TweakRow>
    </div>
  );
}

function TweakRow({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <div style={{ width: 90, fontSize: 12, fontWeight: 700, color: '#4B587A' }}>{label}</div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function Segmented({ v, onChange, opts }) {
  return (
    <div style={{ display: 'flex', background: '#F1F3F6', borderRadius: 7, padding: 2 }}>
      {opts.map(([k, l]) => (
        <button key={k} onClick={() => onChange(k)} style={{
          flex: 1, border: 'none', background: v === k ? 'white' : 'transparent',
          color: v === k ? '#1F2A44' : '#7C89A8', fontWeight: 800,
          padding: '5px 4px', fontSize: 11, borderRadius: 5, cursor: 'pointer',
          boxShadow: v === k ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
          fontFamily: 'inherit',
        }}>{l}</button>
      ))}
    </div>
  );
}

Object.assign(window, { TweaksPanel });
