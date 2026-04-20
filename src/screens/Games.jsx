// Game modes — all 5. Each exposes a component (word, onDone(stars)).

// ── Shared: header with speak, progress, close ─────────
function GameHeader({ mode, progress, onClose }) {
  const m = MODE_META[mode];
  return (
    <div style={{ padding: '60px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <button onClick={onClose} aria-label="Close" style={{
        width: 40, height: 40, borderRadius: '50%', border: 'none',
        background: 'var(--surface)', cursor: 'pointer',
        boxShadow: 'var(--shadow-soft)', fontSize: 18, fontWeight: 900,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>
      <div style={{ flex: 1 }}>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress*100}%`, background: `var(--${m.color})` }}/>
        </div>
      </div>
      <ModeBadge mode={mode}/>
    </div>
  );
}

// ── 1. CLICK spelling — pick the correct letter from choices ──
function ClickGame({ word, onDone, onClose }) {
  const [idx, setIdx] = React.useState(0);
  const [feedback, setFeedback] = React.useState(null); // {letter, correct}
  const [wrongCount, setWrongCount] = React.useState(0);
  const [burst, setBurst] = React.useState(false);

  const target = word[idx];
  const choices = React.useMemo(() => {
    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(c => c !== target);
    const others = pool.sort(() => Math.random() - 0.5).slice(0, 3);
    return [...others, target].sort(() => Math.random() - 0.5);
  }, [idx, word]);

  function pick(letter) {
    if (feedback?.correct) return;
    window.sfx?.tap();
    if (letter === target) {
      window.sfx?.success();
      setFeedback({ letter, correct: true });
      setTimeout(() => {
        if (idx + 1 >= word.length) {
          setBurst(true);
          window.sfx?.complete();
          setTimeout(() => onDone(wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1), 1000);
        } else {
          setIdx(idx + 1);
          setFeedback(null);
        }
      }, 500);
    } else {
      window.sfx?.wrong();
      setWrongCount(w => w + 1);
      setFeedback({ letter, correct: false });
      setTimeout(() => setFeedback(null), 400);
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <GameHeader mode="click" progress={idx / word.length} onClose={onClose}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '20px 16px 32px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Tap the next letter</div>
          <SpeakButton word={word} big/>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', padding: '20px 0' }}>
          {word.split('').map((l, i) => (
            <div key={i} className={`tile small ${i < idx ? 'correct' : i === idx ? 'hint' : 'slot'} ${i < idx ? '' : 'slot'} ${i < idx ? 'filled' : ''}`} style={{
              background: i < idx ? 'var(--success)' : 'rgba(31,42,68,0.06)',
              color: i < idx ? 'white' : 'transparent',
              border: i === idx ? '3px dashed var(--blue-ink)' : (i < idx ? 'none' : '3px dashed rgba(31,42,68,0.15)'),
              boxShadow: 'none',
            }}>{i < idx ? l : '?'}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, width: '100%', maxWidth: 340 }}>
          {choices.map(c => {
            const isPicked = feedback && feedback.letter === c;
            const cls = isPicked ? (feedback.correct ? 'tile correct' : 'tile wrong') : 'tile';
            const color = c.charCodeAt(0) % 5;
            const colorCls = ['blue', 'pink', 'mint', 'coral', 'lilac'][color];
            return (
              <button key={c} onClick={() => pick(c)} className={cls + ' ' + colorCls} style={{
                width: 'auto', height: 88, fontSize: 42, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}>{c}</button>
            );
          })}
        </div>
      </div>
      <Burst show={burst}/>
    </div>
  );
}

// ── 2. DRAG spelling — drag tiles into slots in order ──
function DragGame({ word, onDone, onClose }) {
  const scrambled = React.useMemo(() => {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.map((l, i) => ({ letter: l, key: i, placed: false }));
  }, [word]);
  const [tiles, setTiles] = React.useState(scrambled);
  const [slots, setSlots] = React.useState(Array(word.length).fill(null));
  const [wrongCount, setWrongCount] = React.useState(0);
  const [burst, setBurst] = React.useState(false);
  const [dragging, setDragging] = React.useState(null);

  const filledCount = slots.filter(x => x !== null).length;
  const progress = filledCount / word.length;

  // auto-check when all filled
  React.useEffect(() => {
    if (filledCount === word.length) {
      const attempt = slots.map(s => s.letter).join('');
      if (attempt === word) {
        setBurst(true); window.sfx?.complete();
        setTimeout(() => onDone(wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1), 1000);
      } else {
        window.sfx?.wrong();
        // find first wrong and kick it back
        setTimeout(() => {
          const newSlots = [...slots];
          const newTiles = [...tiles];
          for (let i = 0; i < word.length; i++) {
            if (newSlots[i] && newSlots[i].letter !== word[i]) {
              const t = newTiles.find(x => x.key === newSlots[i].key);
              if (t) t.placed = false;
              newSlots[i] = null;
              setWrongCount(w => w + 1);
              break;
            }
          }
          setSlots(newSlots);
          setTiles(newTiles);
        }, 400);
      }
    }
  }, [filledCount]);

  function placeTile(tileKey) {
    // find first empty slot
    const slotIdx = slots.findIndex(s => s === null);
    if (slotIdx < 0) return;
    const t = tiles.find(x => x.key === tileKey);
    if (!t || t.placed) return;
    const newTiles = tiles.map(x => x.key === tileKey ? { ...x, placed: true } : x);
    const newSlots = [...slots]; newSlots[slotIdx] = { letter: t.letter, key: tileKey };
    setTiles(newTiles); setSlots(newSlots);
    if (t.letter === word[slotIdx]) window.sfx?.tap();
  }

  function unplace(slotIdx) {
    const s = slots[slotIdx]; if (!s) return;
    window.sfx?.tap();
    const newSlots = [...slots]; newSlots[slotIdx] = null;
    const newTiles = tiles.map(x => x.key === s.key ? { ...x, placed: false } : x);
    setSlots(newSlots); setTiles(newTiles);
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <GameHeader mode="drag" progress={progress} onClose={onClose}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '20px 16px 32px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Drop letters in order</div>
          <SpeakButton word={word} big/>
        </div>

        {/* slots */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {slots.map((s, i) => (
            <div key={i}
              onClick={() => s && unplace(i)}
              className={`tile ${s ? 'slot filled' : 'slot'}`}
              style={{
                width: 64, height: 80,
                animation: s ? 'pop 280ms ease' : 'none',
              }}>
              {s ? s.letter : ''}
            </div>
          ))}
        </div>

        {/* tile tray */}
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--r-lg)',
          padding: 14, boxShadow: 'var(--shadow-soft)', width: '100%', maxWidth: 340,
        }}>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, textAlign: 'center' }}>Letters</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {tiles.map(t => {
              const color = ['blue', 'pink', 'mint', 'coral', 'lilac'][t.key % 5];
              return (
                <button key={t.key} onClick={() => placeTile(t.key)}
                  disabled={t.placed}
                  className={`tile ${color}`}
                  style={{
                    width: 58, height: 68, fontSize: 32, border: 'none',
                    cursor: t.placed ? 'default' : 'grab', fontFamily: 'inherit',
                    opacity: t.placed ? 0.2 : 1,
                    transition: 'opacity 200ms',
                  }}>{t.letter}</button>
              );
            })}
          </div>
        </div>
      </div>
      <Burst show={burst}/>
    </div>
  );
}

// ── 3. TYPE spelling — use the keyboard to type the word ──
function TypeGame({ word, onDone, onClose, device }) {
  const [typed, setTyped] = React.useState('');
  const [wrongCount, setWrongCount] = React.useState(0);
  const [shake, setShake] = React.useState(false);
  const [burst, setBurst] = React.useState(false);
  const progress = typed.length / word.length;

  function press(letter) {
    if (typed.length >= word.length) return;
    const expected = word[typed.length];
    window.sfx?.type();
    if (letter === expected) {
      const nt = typed + letter;
      setTyped(nt);
      if (nt === word) {
        window.sfx?.complete(); setBurst(true);
        setTimeout(() => onDone(wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1), 1000);
      } else {
        window.sfx?.tap();
      }
    } else {
      window.sfx?.wrong();
      setWrongCount(w => w + 1);
      setShake(true);
      setTimeout(() => setShake(false), 300);
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <GameHeader mode="type" progress={progress} onClose={onClose}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 16px 12px', gap: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Type the word</div>
          <SpeakButton word={word}/>
        </div>
        <div className={shake ? 'shake-wrap' : ''} style={{
          display: 'flex', gap: 10, justifyContent: 'center',
          animation: shake ? 'shake 300ms' : 'none',
        }}>
          {word.split('').map((l, i) => (
            <div key={i} className={`tile ${i < typed.length ? 'slot filled correct' : 'slot'}`} style={{
              width: 54, height: 68, fontSize: 36,
              background: i < typed.length ? 'var(--success)' : 'rgba(31,42,68,0.06)',
              color: i < typed.length ? 'white' : 'transparent',
              border: i === typed.length ? '3px dashed var(--coral-ink)' : (i < typed.length ? 'none' : '3px dashed rgba(31,42,68,0.15)'),
              boxShadow: 'none',
            }}>{i < typed.length ? l : '?'}</div>
          ))}
        </div>

        <KidKeyboard onPress={press} device={device}/>
      </div>
      <Burst show={burst}/>
    </div>
  );
}

// Custom kid-friendly on-screen keyboard (big keys)
function KidKeyboard({ onPress, device }) {
  const rows = [
    'QWERTYUIOP'.split(''),
    'ASDFGHJKL'.split(''),
    'ZXCVBNM'.split(''),
  ];
  return (
    <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 8, padding: '0 4px' }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', gap: 5, justifyContent: 'center', paddingLeft: i === 1 ? 14 : i === 2 ? 30 : 0, paddingRight: i === 1 ? 14 : i === 2 ? 30 : 0 }}>
          {r.map(l => (
            <button key={l} onClick={() => onPress(l)} style={{
              flex: 1, maxWidth: 38, height: 52,
              border: 'none', background: 'var(--surface)',
              color: 'var(--ink)', fontWeight: 900, fontSize: 20,
              borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 2px 0 rgba(31,42,68,0.12)',
            }}>{l}</button>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── 4. MISSING letter — fill the _ with the right letter ──
function MissingGame({ word, onDone, onClose }) {
  // pick a middle letter as missing (index > 0 and < length-1 if possible)
  const missingIdx = React.useMemo(() => {
    if (word.length <= 3) return 1;
    return 1 + Math.floor(Math.random() * (word.length - 2));
  }, [word]);
  const target = word[missingIdx];
  const choices = React.useMemo(() => {
    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(c => c !== target);
    const others = pool.sort(() => Math.random() - 0.5).slice(0, 3);
    return [...others, target].sort(() => Math.random() - 0.5);
  }, [target]);
  const [picked, setPicked] = React.useState(null);
  const [wrongCount, setWrongCount] = React.useState(0);
  const [burst, setBurst] = React.useState(false);

  function pick(c) {
    window.sfx?.tap();
    setPicked(c);
    if (c === target) {
      window.sfx?.success(); setBurst(true); window.sfx?.complete();
      setTimeout(() => onDone(wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1), 1000);
    } else {
      window.sfx?.wrong();
      setWrongCount(w => w + 1);
      setTimeout(() => setPicked(null), 400);
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <GameHeader mode="missing" progress={picked === target ? 1 : 0.5} onClose={onClose}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '20px 16px 32px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Which letter is missing?</div>
          <SpeakButton word={word} big/>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {word.split('').map((l, i) => (
            <div key={i} className={`tile ${i === missingIdx ? 'slot' : ''}`} style={{
              width: 58, height: 72, fontSize: 40,
              background: i === missingIdx ? (picked === target ? 'var(--success)' : 'rgba(31,42,68,0.06)') : 'var(--mint)',
              color: i === missingIdx ? (picked === target ? 'white' : 'rgba(31,42,68,0.35)') : '#0f5c42',
              border: i === missingIdx && picked !== target ? '3px dashed var(--mint-ink)' : 'none',
              boxShadow: i === missingIdx ? 'none' : 'var(--shadow-tile)',
            }}>{i === missingIdx ? (picked === target ? target : '?') : l}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, width: '100%', maxWidth: 340 }}>
          {choices.map(c => {
            const isPicked = picked === c;
            const cls = isPicked ? (c === target ? 'tile correct' : 'tile wrong') : 'tile';
            const color = ['blue', 'pink', 'mint', 'coral'][c.charCodeAt(0) % 4];
            return (
              <button key={c} onClick={() => pick(c)} className={cls + ' ' + color} style={{
                width: 'auto', height: 80, fontSize: 38, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}>{c}</button>
            );
          })}
        </div>
      </div>
      <Burst show={burst}/>
    </div>
  );
}

// ── 5. KEYBOARD SEQUENCE — find each letter on the keyboard fast ──
function KeyboardGame({ word, onDone, onClose }) {
  const [idx, setIdx] = React.useState(0);
  const [wrongCount, setWrongCount] = React.useState(0);
  const [flash, setFlash] = React.useState(null);
  const [burst, setBurst] = React.useState(false);
  const target = word[idx];

  function press(l) {
    window.sfx?.type();
    if (l === target) {
      setFlash({ l, ok: true });
      window.sfx?.tap();
      setTimeout(() => {
        setFlash(null);
        if (idx + 1 >= word.length) {
          setBurst(true); window.sfx?.complete();
          setTimeout(() => onDone(wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1), 1000);
        } else {
          setIdx(idx + 1);
        }
      }, 150);
    } else {
      setFlash({ l, ok: false });
      window.sfx?.wrong();
      setWrongCount(w => w + 1);
      setTimeout(() => setFlash(null), 250);
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <GameHeader mode="keyboard" progress={idx / word.length} onClose={onClose}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 16px 12px', gap: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Find this letter on the keyboard</div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{
            width: 120, height: 140, borderRadius: 'var(--r-lg)',
            background: 'var(--lilac)', color: 'white', fontWeight: 900,
            fontSize: 90, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-pop)', animation: 'floatUp 400ms',
            key: target,
          }}>{target}</div>
        </div>

        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 2 }}>
          {word.split('').map((l, i) => (
            <div key={i} style={{
              width: 26, height: 6, borderRadius: 3,
              background: i < idx ? 'var(--lilac)' : 'rgba(31,42,68,0.12)',
            }}/>
          ))}
        </div>

        <SequenceKeyboard onPress={press} target={target} flash={flash}/>
      </div>
      <Burst show={burst}/>
    </div>
  );
}

function SequenceKeyboard({ onPress, target, flash }) {
  const rows = [
    'QWERTYUIOP'.split(''),
    'ASDFGHJKL'.split(''),
    'ZXCVBNM'.split(''),
  ];
  return (
    <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', gap: 4, justifyContent: 'center', paddingLeft: i === 1 ? 14 : i === 2 ? 30 : 0, paddingRight: i === 1 ? 14 : i === 2 ? 30 : 0 }}>
          {r.map(l => {
            const isFlash = flash && flash.l === l;
            const bg = isFlash ? (flash.ok ? 'var(--success)' : 'var(--danger)') : 'var(--surface)';
            const col = isFlash ? 'white' : 'var(--ink)';
            return (
              <button key={l} onClick={() => onPress(l)} style={{
                flex: 1, maxWidth: 36, height: 48,
                border: 'none', background: bg,
                color: col, fontWeight: 900, fontSize: 18,
                borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 2px 0 rgba(31,42,68,0.12)',
                transition: 'background 80ms',
              }}>{l}</button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { ClickGame, DragGame, TypeGame, MissingGame, KeyboardGame });
