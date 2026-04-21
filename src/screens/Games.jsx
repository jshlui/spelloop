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
  const { distractorCount, recordClick, recordTaskComplete } = React.useContext(window.GameContext);
  const taskStartRef = React.useRef(Date.now());
  const [idx, setIdx] = React.useState(0);
  const [feedback, setFeedback] = React.useState(null); // {letter, correct}
  const [wrongCount, setWrongCount] = React.useState(0);
  const [burst, setBurst] = React.useState(false);

  const target = word[idx];
  const choices = React.useMemo(() => {
    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(c => c !== target);
    const others = pool.sort(() => Math.random() - 0.5).slice(0, distractorCount - 1);
    return [...others, target].sort(() => Math.random() - 0.5);
  }, [idx, word, distractorCount]);

  function pick(letter) {
    if (feedback?.correct) return;
    if (letter === target) {
      recordClick(true, 'click', Date.now() - taskStartRef.current);
      window.sfx?.playCorrect();
      setFeedback({ letter, correct: true });
      setTimeout(() => {
        if (idx + 1 >= word.length) {
          recordTaskComplete('click', Date.now() - taskStartRef.current);
          taskStartRef.current = Date.now();
          setBurst(true);
          window.sfx?.complete();
          setTimeout(() => onDone(wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1), 1000);
        } else {
          setIdx(idx + 1);
          setFeedback(null);
        }
      }, 500);
    } else {
      recordClick(false, 'click', Date.now() - taskStartRef.current);
      window.sfx?.playWrong();
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
              border: i === idx ? '2px dashed var(--blue-ink)' : (i < idx ? 'none' : '2px dashed var(--alpha-md)'),
              boxShadow: 'none',
            }}>{i < idx ? l : '?'}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, width: '100%', maxWidth: 340 }}>
          {choices.map((c, i) => {
            const isPicked = feedback && feedback.letter === c;
            const cls = isPicked ? (feedback.correct ? 'tile correct' : 'tile wrong') : 'tile';
            const color = c.charCodeAt(0) % 5;
            const colorCls = ['blue', 'pink', 'mint', 'coral', 'lilac'][color];
            return (
              <button key={c} onClick={() => pick(c)} className={cls + ' ' + colorCls + ' tile-entry' + (isPicked && feedback.correct ? ' tile-correct' : isPicked && !feedback.correct ? ' tile-wrong' : '')} style={{
                width: 'auto', height: 88, fontSize: 42, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                animationDelay: `${i * 50}ms`
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
        window.sfx?.playWrong();
        setWrongCount(w => w + 1);
        // clear ALL tiles so player starts fresh — avoids stranded-tile deadlock
        setTimeout(() => {
          setSlots(Array(word.length).fill(null));
          setTiles(function(prev) { return prev.map(function(t) { return Object.assign({}, t, { placed: false }); }); });
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
    if (!slots[slotIdx]) return;
    window.sfx?.tap();
    const newSlots = [...slots];
    const freedKeys = [];
    for (var i = slotIdx; i < newSlots.length; i++) {
      if (newSlots[i]) { freedKeys.push(newSlots[i].key); newSlots[i] = null; }
    }
    const newTiles = tiles.map(function(x) { return freedKeys.includes(x.key) ? Object.assign({}, x, { placed: false }) : x; });
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
        window.sfx?.playCorrect();
      }
    } else {
      window.sfx?.playWrong();
      setWrongCount(w => w + 1);
      setShake(true);
      setTimeout(() => setShake(false), 300);
    }
  }

  React.useEffect(function() {
    function onKey(e) {
      if (e.key === 'Backspace') { setTyped(function(t) { return t.slice(0, -1); }); return; }
      if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) press(e.key.toUpperCase());
    }
    window.addEventListener('keydown', onKey);
    return function() { window.removeEventListener('keydown', onKey); };
  }, [typed, wrongCount]);

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
              border: i === typed.length ? '2px dashed var(--coral-ink)' : (i < typed.length ? 'none' : '2px dashed var(--alpha-md)'),
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
              transition: 'background var(--dur-fast), transform var(--dur-fast)',
            }}
            onMouseEnter={function(e) { e.currentTarget.style.background = 'var(--blue-soft)'; }}
            onMouseLeave={function(e) { e.currentTarget.style.background = 'var(--surface)'; }}
            onMouseDown={function(e) { e.currentTarget.style.transform = 'scale(0.92)'; }}
            onMouseUp={function(e) { e.currentTarget.style.transform = 'scale(1)'; }}
            >{l}</button>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── 4. MISSING letter — fill the _ with the right letter ──
function MissingGame({ word, onDone, onClose }) {
  const { distractorCount, recordClick, recordTaskComplete } = React.useContext(window.GameContext);
  const taskStartRef = React.useRef(Date.now());
  // pick a middle letter as missing (index > 0 and < length-1 if possible)
  const missingIdx = React.useMemo(() => {
    if (word.length <= 3) return 1;
    return 1 + Math.floor(Math.random() * (word.length - 2));
  }, [word]);
  const target = word[missingIdx];
  const choices = React.useMemo(() => {
    const choiceCount = Math.min(distractorCount, 4);
    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(c => c !== target);
    const others = pool.sort(() => Math.random() - 0.5).slice(0, choiceCount - 1);
    return [...others, target].sort(() => Math.random() - 0.5);
  }, [target, distractorCount]);
  const [picked, setPicked] = React.useState(null);
  const [wrongCount, setWrongCount] = React.useState(0);
  const [burst, setBurst] = React.useState(false);

  function pick(c) {
    setPicked(c);
    if (c === target) {
      recordClick(true, 'missing', Date.now() - taskStartRef.current);
      window.sfx?.playCorrect();
      setBurst(true); window.sfx?.complete();
      recordTaskComplete('missing', Date.now() - taskStartRef.current);
      setTimeout(() => onDone(wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1), 1000);
    } else {
      recordClick(false, 'missing', Date.now() - taskStartRef.current);
      window.sfx?.playWrong();
      setWrongCount(w => w + 1);
      setTimeout(() => setPicked(null), 400);
    }
  }

  React.useEffect(function() {
    function onKey(e) {
      if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        const k = e.key.toUpperCase();
        if (choices.includes(k)) pick(k);
      }
    }
    window.addEventListener('keydown', onKey);
    return function() { window.removeEventListener('keydown', onKey); };
  }, [choices, target, picked, wrongCount]);

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
              background: i === missingIdx ? (picked === target ? 'var(--success)' : 'var(--alpha-sm)') : 'var(--mint)',
              color: i === missingIdx ? (picked === target ? 'white' : 'var(--disabled)') : 'var(--mint-ink)',
              border: i === missingIdx && picked !== target ? '2px dashed var(--mint-ink)' : 'none',
              boxShadow: i === missingIdx ? 'none' : 'var(--shadow-tile)',
            }}>{i === missingIdx ? (picked === target ? target : '?') : l}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, width: '100%', maxWidth: 340 }}>
          {choices.map((c, i) => {
            const isPicked = picked === c;
            const cls = isPicked ? (c === target ? 'tile correct' : 'tile wrong') : 'tile';
            const color = ['blue', 'pink', 'mint', 'coral'][c.charCodeAt(0) % 4];
            return (
              <button key={c} onClick={() => pick(c)} className={cls + ' ' + color + ' tile-entry'} style={{
                width: 'auto', height: 80, fontSize: 38, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                animationDelay: `${i * 50}ms`
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
      window.sfx?.playCorrect();
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
      window.sfx?.playWrong();
      setWrongCount(w => w + 1);
      setTimeout(() => setFlash(null), 250);
    }
  }

  React.useEffect(function() {
    function onKey(e) {
      if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) press(e.key.toUpperCase());
    }
    window.addEventListener('keydown', onKey);
    return function() { window.removeEventListener('keydown', onKey); };
  }, [idx, wrongCount]);

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
                transition: 'background var(--dur-fast), transform var(--dur-fast)',
              }}
              onMouseEnter={function(e) { e.currentTarget.style.background = isFlash ? bg : 'var(--blue-soft)'; }}
              onMouseLeave={function(e) { e.currentTarget.style.background = bg; }}
              onMouseDown={function(e) { e.currentTarget.style.transform = 'scale(0.92)'; }}
              onMouseUp={function(e) { e.currentTarget.style.transform = 'scale(1)'; }}
              >{l}</button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── 6. PRECISION click — tile teleports, click it while still ──
var PRECISION_POSITIONS = [
  { left: '20%', top: '30%' },
  { left: '60%', top: '25%' },
  { left: '42%', top: '60%' },
];
var TILE_COLORS = ['var(--blue)', 'var(--coral)', 'var(--mint)', 'var(--yellow)', 'var(--lilac)'];

function PrecisionGame({ word, onDone, onClose }) {
  const { recordClick, recordTaskComplete } = React.useContext(window.GameContext);
  const [posIdx, setPosIdx] = React.useState(0);
  const [transitioning, setTransitioning] = React.useState(false);
  const [wrongCount, setWrongCount] = React.useState(0);
  const [letterIdx, setLetterIdx] = React.useState(0);
  const [burst, setBurst] = React.useState(false);
  const taskStartRef = React.useRef(Date.now());

  const letter = word[letterIdx];
  const pos = PRECISION_POSITIONS[posIdx];
  const color = TILE_COLORS[letterIdx % TILE_COLORS.length];

  // Teleport tile every 2.5s
  React.useEffect(function() {
    var interval = setInterval(function() {
      setTransitioning(true);
      setTimeout(function() {
        setPosIdx(function(p) { return (p + 1) % PRECISION_POSITIONS.length; });
        setTransitioning(false);
      }, 300);
    }, 2500);
    return function() { clearInterval(interval); };
  }, [letterIdx]);

  function handleClick() {
    if (burst) return;
    if (transitioning) {
      setWrongCount(function(w) { return w + 1; });
      recordClick(false, 'precision', 0);
      window.sfx && window.sfx.playWrong && window.sfx.playWrong();
      return;
    }
    recordClick(true, 'precision', Date.now() - taskStartRef.current);
    window.sfx && window.sfx.playCorrect && window.sfx.playCorrect();
    if (letterIdx + 1 >= word.length) {
      recordTaskComplete('precision', Date.now() - taskStartRef.current);
      window.sfx && window.sfx.playComplete && window.sfx.playComplete();
      setBurst(true);
      var stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;
      setTimeout(function() { onDone(stars); }, 1000);
    } else {
      setLetterIdx(function(l) { return l + 1; });
      taskStartRef.current = Date.now();
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <GameHeader mode="precision" progress={letterIdx / word.length} onClose={onClose}/>
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '8%', left: 0, right: 0, textAlign: 'center',
          fontSize: 'clamp(24px, 5vw, 34px)', fontWeight: 800, color: 'var(--ink, #1F2A44)',
          fontFamily: 'inherit',
        }}>
          Click when still! ({letterIdx + 1}/{word.length})
        </div>
        <div
          onClick={handleClick}
          style={{
            position: 'absolute',
            left: pos.left,
            top: pos.top,
            width: 96, height: 96,
            background: color,
            borderRadius: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 48, fontWeight: 900, color: '#fff',
            cursor: 'none',
            transition: 'left 0.28s cubic-bezier(0.34,1.1,0.64,1), top 0.28s cubic-bezier(0.34,1.1,0.64,1)',
            opacity: transitioning ? 0.45 : 1,
            boxShadow: transitioning ? 'none' : '0 6px 20px rgba(0,0,0,0.18)',
            userSelect: 'none',
          }}
        >
          {letter}
        </div>
      </div>
      <Burst show={burst}/>
    </div>
  );
}

// ── 7. SCRAMBLE — tap the scrambled letters in correct order ──
function ScrambleGame({ word, onDone, onClose }) {
  const scrambled = React.useMemo(function() {
    var arr = word.split('').map(function(l, i) { return { letter: l, key: i, used: false }; });
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }, [word]);
  const [tiles, setTiles] = React.useState(scrambled);
  const [typed, setTyped] = React.useState('');
  const [wrongKey, setWrongKey] = React.useState(null);
  const [wrongCount, setWrongCount] = React.useState(0);
  const [burst, setBurst] = React.useState(false);
  const progress = typed.length / word.length;

  function pick(key) {
    const tile = tiles.find(function(t) { return t.key === key; });
    if (!tile || tile.used) return;
    const expected = word[typed.length];
    if (tile.letter === expected) {
      window.sfx?.playCorrect();
      const nt = typed + tile.letter;
      setTiles(function(prev) { return prev.map(function(t) { return t.key === key ? Object.assign({}, t, { used: true }) : t; }); });
      setTyped(nt);
      if (nt === word) {
        setBurst(true); window.sfx?.complete();
        setTimeout(function() { onDone(wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1); }, 1000);
      }
    } else {
      window.sfx?.playWrong();
      setWrongCount(function(w) { return w + 1; });
      setWrongKey(key);
      setTimeout(function() { setWrongKey(null); }, 350);
    }
  }

  const colors = ['blue','pink','coral','mint','lilac'];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <GameHeader mode="scramble" progress={progress} onClose={onClose}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '20px 16px 32px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Tap letters in the right order</div>
          <SpeakButton word={word} big/>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {word.split('').map(function(l, i) {
            return (
              <div key={i} style={{
                width: 58, height: 72, borderRadius: 14, fontSize: 36, fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i < typed.length ? 'var(--mint)' : 'var(--alpha-sm)',
                color: i < typed.length ? 'var(--mint-ink)' : 'transparent',
                border: i === typed.length ? '2px dashed var(--mint-ink)' : i < typed.length ? 'none' : '2px dashed var(--alpha-md)',
                boxShadow: 'none',
              }}>{i < typed.length ? typed[i] : ''}</div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {tiles.map(function(t) {
            return (
              <button key={t.key} onClick={function() { pick(t.key); }}
                disabled={t.used}
                className={'tile ' + colors[t.key % colors.length]}
                style={{
                  width: 68, height: 80, fontSize: 36, border: 'none',
                  cursor: t.used ? 'default' : 'pointer', fontFamily: 'inherit',
                  opacity: t.used ? 0.15 : 1, transition: 'opacity 200ms',
                  animation: wrongKey === t.key ? 'tileWrong 350ms ease' : 'none',
                }}>{t.letter}</button>
            );
          })}
        </div>
      </div>
      <Burst show={burst}/>
    </div>
  );
}

// ── 8. SPEED SPELL — type the word before the timer runs out ──
function SpeedGame({ word, onDone, onClose }) {
  const TIME = 15;
  const [timeLeft, setTimeLeft] = React.useState(TIME);
  const [typed, setTyped] = React.useState('');
  const [wrongCount, setWrongCount] = React.useState(0);
  const [shake, setShake] = React.useState(false);
  const [burst, setBurst] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const progress = typed.length / word.length;

  React.useEffect(function() {
    if (done || timeLeft <= 0) {
      if (timeLeft <= 0 && !done) { window.sfx?.playWrong(); onDone(0); }
      return;
    }
    const t = setTimeout(function() { setTimeLeft(function(p) { return p - 1; }); }, 1000);
    return function() { clearTimeout(t); };
  }, [timeLeft, done]);

  function press(letter) {
    if (done || typed.length >= word.length) return;
    const expected = word[typed.length];
    if (letter === expected) {
      window.sfx?.playCorrect();
      const nt = typed + letter;
      setTyped(nt);
      if (nt === word) {
        setDone(true); setBurst(true); window.sfx?.complete();
        const stars = timeLeft >= 10 ? 3 : timeLeft >= 5 ? 2 : 1;
        setTimeout(function() { onDone(stars); }, 1000);
      }
    } else {
      window.sfx?.playWrong();
      setWrongCount(function(w) { return w + 1; });
      setShake(true);
      setTimeout(function() { setShake(false); }, 300);
    }
  }

  React.useEffect(function() {
    function onKey(e) {
      if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) press(e.key.toUpperCase());
      if (e.key === 'Backspace') setTyped(function(t) { return t.slice(0, -1); });
    }
    window.addEventListener('keydown', onKey);
    return function() { window.removeEventListener('keydown', onKey); };
  }, [typed, done, timeLeft]);

  const pct = timeLeft / TIME;
  const timerColor = pct > 0.6 ? 'var(--success)' : pct > 0.3 ? 'var(--warn)' : 'var(--danger)';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <GameHeader mode="speed" progress={progress} onClose={onClose}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 16px 12px', gap: 14 }}>
        <div style={{ width: '100%', height: 12, borderRadius: 6, background: 'rgba(31,42,68,0.08)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: (pct * 100) + '%', background: timerColor, borderRadius: 6, transition: 'width 1s linear, background 0.3s' }}/>
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, color: timerColor, lineHeight: 1 }}>{timeLeft}s</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Type before time runs out!</div>
          <SpeakButton word={word}/>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', animation: shake ? 'shake 300ms' : 'none' }}>
          {word.split('').map(function(l, i) {
            return (
              <div key={i} style={{
                width: 54, height: 68, fontSize: 36, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900,
                background: i < typed.length ? 'var(--success)' : 'rgba(31,42,68,0.06)',
                color: i < typed.length ? 'white' : 'transparent',
                border: i === typed.length ? '2px dashed var(--coral-ink)' : i < typed.length ? 'none' : '2px dashed var(--alpha-md)',
                boxShadow: 'none',
              }}>{i < typed.length ? l : ''}</div>
            );
          })}
        </div>
        <KidKeyboard onPress={press}/>
      </div>
      <Burst show={burst}/>
    </div>
  );
}

// ── 9. ECHO — hear the word, spell it without seeing it ──
function EchoGame({ word, onDone, onClose }) {
  const { recordClick, recordTaskComplete } = React.useContext(window.GameContext);
  const [typed, setTyped] = React.useState('');
  const [wrongCount, setWrongCount] = React.useState(0);
  const [shake, setShake] = React.useState(false);
  const [burst, setBurst] = React.useState(false);
  const taskStartRef = React.useRef(Date.now());

  function speak() {
    window.sfx?.tap();
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(word.toLowerCase());
      u.lang = 'en-AU'; u.rate = 0.65; u.pitch = 1.05; u.volume = 1;
      var voices = window.speechSynthesis.getVoices();
      var auVoice = voices.find(function(v) { return v.lang === 'en-AU'; })
        || voices.find(function(v) { return v.lang.startsWith('en-'); })
        || null;
      if (auVoice) u.voice = auVoice;
      window.speechSynthesis.speak(u);
    } catch(e) {}
  }

  React.useEffect(function() {
    var t = setTimeout(speak, 500);
    return function() { clearTimeout(t); };
  }, []);

  function press(letter) {
    if (typed.length >= word.length) return;
    var expected = word[typed.length];
    if (letter === expected) {
      window.sfx?.playCorrect();
      recordClick(true, 'echo', Date.now() - taskStartRef.current);
      var nt = typed + letter;
      setTyped(nt);
      if (nt === word) {
        recordTaskComplete('echo', Date.now() - taskStartRef.current);
        setBurst(true); window.sfx?.complete();
        setTimeout(function() { onDone(wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1); }, 1000);
      }
    } else {
      window.sfx?.playWrong();
      recordClick(false, 'echo', Date.now() - taskStartRef.current);
      setWrongCount(function(w) { return w + 1; });
      setShake(true);
      setTimeout(function() { setShake(false); }, 300);
    }
  }

  React.useEffect(function() {
    function onKey(e) {
      if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) press(e.key.toUpperCase());
      if (e.key === 'Backspace') setTyped(function(t) { return t.slice(0, -1); });
    }
    window.addEventListener('keydown', onKey);
    return function() { window.removeEventListener('keydown', onKey); };
  }, [typed, wrongCount, word]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <GameHeader mode="echo" progress={typed.length / word.length} onClose={onClose}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '24px 16px 32px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>
            Listen, then spell!
          </div>
          <button onClick={speak} style={{
            width: 100, height: 100, borderRadius: '50%',
            background: 'var(--lilac)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-toy)',
            transition: 'transform var(--dur-fast) var(--ease-toy)',
          }}
          onMouseEnter={function(e) { e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={function(e) { e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseDown={function(e) { e.currentTarget.style.transform = 'scale(0.94)'; }}
          onMouseUp={function(e) { e.currentTarget.style.transform = 'scale(1.08)'; }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
              <path d="M3 9v6h4l5 5V4L7 9H3z"/>
              <path d="M15 8 Q18 12 15 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M18 5 Q23 12 18 19" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </button>
          <div style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 700, marginTop: 12 }}>Tap to hear again</div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', animation: shake ? 'shake 300ms' : 'none' }}>
          {word.split('').map(function(l, i) {
            return (
              <div key={i} style={{
                width: 54, height: 68, borderRadius: 14, fontSize: 36, fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i < typed.length ? 'var(--success)' : 'var(--alpha-sm)',
                color: i < typed.length ? 'white' : 'var(--ink-mute)',
                border: i === typed.length ? '2px dashed var(--lilac-ink)' : i < typed.length ? 'none' : '2px dashed var(--alpha-md)',
                fontSize: i < typed.length ? 36 : 24,
              }}>{i < typed.length ? typed[i] : '–'}</div>
            );
          })}
        </div>

        <KidKeyboard onPress={press}/>
      </div>
      <Burst show={burst}/>
    </div>
  );
}

// ── 10. FLASH — see the word briefly, then spell from memory ──
function FlashGame({ word, onDone, onClose }) {
  const { recordClick, recordTaskComplete } = React.useContext(window.GameContext);
  const [phase, setPhase] = React.useState('flash'); // 'flash' | 'spell'
  const [typed, setTyped] = React.useState('');
  const [wrongCount, setWrongCount] = React.useState(0);
  const [peeksLeft, setPeeksLeft] = React.useState(1);
  const [peeking, setPeeking] = React.useState(false);
  const [shake, setShake] = React.useState(false);
  const [burst, setBurst] = React.useState(false);
  const [flashProgress, setFlashProgress] = React.useState(0);
  const taskStartRef = React.useRef(Date.now());
  const FLASH_DURATION = 2500;

  React.useEffect(function() {
    if (phase !== 'flash' && !peeking) return;
    var start = Date.now();
    var raf;
    var duration = peeking ? 800 : FLASH_DURATION;
    function tick() {
      var p = Math.min((Date.now() - start) / duration, 1);
      setFlashProgress(p);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        if (peeking) { setPeeking(false); }
        else { setPhase('spell'); taskStartRef.current = Date.now(); }
      }
    }
    raf = requestAnimationFrame(tick);
    return function() { cancelAnimationFrame(raf); };
  }, [phase, peeking]);

  function peek() {
    if (peeksLeft <= 0 || peeking) return;
    setPeeksLeft(0); setPeeking(true); setFlashProgress(0);
  }

  function press(letter) {
    if (phase !== 'spell' || peeking || typed.length >= word.length) return;
    var expected = word[typed.length];
    if (letter === expected) {
      window.sfx?.playCorrect();
      recordClick(true, 'flash', Date.now() - taskStartRef.current);
      var nt = typed + letter;
      setTyped(nt);
      if (nt === word) {
        recordTaskComplete('flash', Date.now() - taskStartRef.current);
        setBurst(true); window.sfx?.complete();
        setTimeout(function() { onDone(wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1); }, 1000);
      }
    } else {
      window.sfx?.playWrong();
      recordClick(false, 'flash', Date.now() - taskStartRef.current);
      setWrongCount(function(w) { return w + 1; });
      setShake(true);
      setTimeout(function() { setShake(false); }, 300);
    }
  }

  React.useEffect(function() {
    if (phase !== 'spell') return;
    function onKey(e) {
      if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) press(e.key.toUpperCase());
      if (e.key === 'Backspace') setTyped(function(t) { return t.slice(0, -1); });
    }
    window.addEventListener('keydown', onKey);
    return function() { window.removeEventListener('keydown', onKey); };
  }, [phase, typed, wrongCount, word]);

  var showWord = phase === 'flash' || peeking;
  var trackLen = word.length <= 4 ? 300 : word.length <= 6 ? 400 : 500;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <GameHeader mode="flash" progress={typed.length / word.length} onClose={onClose}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '24px 16px 32px' }}>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
            {showWord ? 'Remember it!' : 'Now spell it!'}
          </div>
          <div style={{ position: 'relative', display: 'inline-block', padding: '16px 24px' }}>
            {(phase === 'flash' || peeking) && (
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox={'0 0 ' + (trackLen + 32) + ' 96'}>
                <rect x="4" y="4" width={trackLen + 24} height="88" rx="18" fill="none" stroke="var(--yellow)" strokeWidth="4" strokeOpacity="0.2"/>
                <rect x="4" y="4" width={trackLen + 24} height="88" rx="18" fill="none" stroke="var(--yellow)" strokeWidth="4"
                  strokeDasharray={2 * (trackLen + 24) + 2 * 88}
                  strokeDashoffset={(2 * (trackLen + 24) + 2 * 88) * (1 - flashProgress)}/>
              </svg>
            )}
            <div style={{
              fontFamily: "'Grandstander','Nunito',system-ui,sans-serif",
              fontSize: 'clamp(40px,7vw,72px)', fontWeight: 900,
              color: 'var(--yellow-ink)', letterSpacing: 6,
              opacity: showWord ? 1 : 0,
              transition: 'opacity 200ms',
              minWidth: 80, textAlign: 'center',
            }}>{word}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', animation: shake ? 'shake 300ms' : 'none' }}>
            {word.split('').map(function(l, i) {
              return (
                <div key={i} style={{
                  width: 54, height: 68, borderRadius: 14, fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: i < typed.length ? 'var(--success)' : 'var(--alpha-sm)',
                  color: i < typed.length ? 'white' : 'transparent',
                  border: i === typed.length ? '2px dashed var(--yellow-ink)' : i < typed.length ? 'none' : '2px dashed var(--alpha-md)',
                  fontSize: i < typed.length ? 36 : 0,
                }}>{i < typed.length ? typed[i] : ''}</div>
              );
            })}
          </div>
          {phase === 'spell' && peeksLeft > 0 && !peeking && (
            <button onClick={peek} style={{
              background: 'var(--yellow-soft)', color: 'var(--yellow-ink)',
              border: '1px solid var(--alpha-md)', borderRadius: 999,
              padding: '8px 20px', fontWeight: 800, fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'transform var(--dur-fast)',
            }}
            onMouseEnter={function(e) { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={function(e) { e.currentTarget.style.transform = 'scale(1)'; }}
            >👁 Peek ({peeksLeft} left)</button>
          )}
        </div>

        {phase === 'spell' ? <KidKeyboard onPress={press}/> : <div style={{ height: 200 }}/>}
      </div>
      <Burst show={burst}/>
    </div>
  );
}

// ── 11. CODING — Build the Path (sequence builder) ──
var CODING_LEVEL_CONFIGS = {
  'L1': { start: [2,1], goal: [2,3], minSteps: 2 },
  'L2': { start: [2,0], goal: [1,2], minSteps: 3 },
  'L3': { start: [4,0], goal: [2,3], minSteps: 5 },
};

var CODING_DIRS = [
  { label: 'Move Right', icon: '→', key: 'R', dr: 0,  dc: 1  },
  { label: 'Move Left',  icon: '←', key: 'L', dr: 0,  dc: -1 },
  { label: 'Move Up',    icon: '↑', key: 'U', dr: -1, dc: 0  },
  { label: 'Move Down',  icon: '↓', key: 'D', dr: 1,  dc: 0  },
];

function CodingGame({ word, onDone, onClose }) {
  var GRID = 5;
  var level = CODING_LEVEL_CONFIGS[word] || CODING_LEVEL_CONFIGS['L1'];

  var [sequence, setSequence] = React.useState([]);
  var [playerPos, setPlayerPos] = React.useState(level.start.slice());
  var [running, setRunning] = React.useState(false);
  var [activeStep, setActiveStep] = React.useState(-1);
  var [result, setResult] = React.useState(null);
  var [wrongRuns, setWrongRuns] = React.useState(0);
  var [burst, setBurst] = React.useState(false);

  function addStep(dir) {
    if (running || result === 'success') return;
    window.sfx?.tap();
    setSequence(function(s) { return s.concat(dir); });
  }

  function clearSequence() {
    if (running) return;
    window.sfx?.tap();
    setSequence([]);
    setPlayerPos(level.start.slice());
    setResult(null);
    setActiveStep(-1);
  }

  function runSequence() {
    if (running || sequence.length === 0 || result === 'success') return;
    setResult(null);
    setActiveStep(-1);
    setRunning(true);

    // Compute full path upfront
    var path = [level.start.slice()];
    var cur = level.start.slice();
    var success = false;
    for (var i = 0; i < sequence.length; i++) {
      var d = sequence[i];
      var nr = Math.max(0, Math.min(GRID - 1, cur[0] + d.dr));
      var nc = Math.max(0, Math.min(GRID - 1, cur[1] + d.dc));
      cur = [nr, nc];
      path.push(cur.slice());
      if (nr === level.goal[0] && nc === level.goal[1]) { success = true; break; }
    }

    var STEP_MS = 420;
    for (var step = 1; step < path.length; step++) {
      (function(s, p) {
        setTimeout(function() {
          setPlayerPos(p);
          setActiveStep(s - 1);
        }, s * STEP_MS);
      })(step, path[step]);
    }

    setTimeout(function() {
      setRunning(false);
      if (success) {
        setBurst(true);
        window.sfx?.complete();
        var stars = wrongRuns === 0 ? 3 : wrongRuns === 1 ? 2 : 1;
        setTimeout(function() { onDone(stars); }, 1000);
      } else {
        setResult('fail');
        setWrongRuns(function(w) { return w + 1; });
        window.sfx?.playWrong();
      }
    }, path.length * STEP_MS);
  }

  var progress = result === 'success' ? 1 : running && sequence.length > 0 ? (activeStep + 1) / sequence.length : 0;
  var CELL = 48;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <GameHeader mode="coding" progress={progress} onClose={onClose}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 20px', overflowY: 'auto' }}>

        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
          Build the path to the ⭐
        </div>

        {/* Grid Board */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + GRID + ', ' + CELL + 'px)', gap: 4 }}>
          {Array.from({ length: GRID * GRID }).map(function(_, idx) {
            var r = Math.floor(idx / GRID);
            var c = idx % GRID;
            var isPlayer = playerPos[0] === r && playerPos[1] === c;
            var isGoal = level.goal[0] === r && level.goal[1] === c;
            var isStart = !running && result === null && level.start[0] === r && level.start[1] === c && !isPlayer;
            return (
              <div key={idx} style={{
                width: CELL, height: CELL, borderRadius: 10,
                background: isPlayer ? 'var(--blue)' : isGoal ? 'var(--yellow-soft)' : 'var(--alpha-sm)',
                border: isPlayer ? 'none' : isGoal ? '2px dashed var(--yellow-ink)' : '1px solid var(--alpha-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 200ms',
              }}>
                {isPlayer && isGoal && <span style={{ fontSize: 22 }}>🎉</span>}
                {isPlayer && !isGoal && <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}/>}
                {!isPlayer && isGoal && <span style={{ fontSize: 22 }}>⭐</span>}
              </div>
            );
          })}
        </div>

        {/* Sequence display */}
        <div style={{
          display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center',
          minHeight: 48, padding: '8px 12px', background: 'var(--alpha-sm)',
          borderRadius: 14, width: '100%', alignItems: 'center',
        }}>
          {sequence.length === 0 ? (
            <span style={{ color: 'var(--ink-mute)', fontSize: 13, fontWeight: 700 }}>Tap buttons to build your sequence…</span>
          ) : sequence.map(function(step, i) {
            var isActive = activeStep === i;
            var isPast = activeStep > i;
            return (
              <div key={i} style={{
                width: 36, height: 36, borderRadius: 8,
                background: isPast ? 'var(--success)' : isActive ? 'var(--coral)' : 'var(--blue)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 900,
                transform: isActive ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform 200ms, background 200ms',
                opacity: isPast ? 0.5 : 1,
              }}>{step.icon}</div>
            );
          })}
        </div>

        {/* Result feedback */}
        {result && (
          <div style={{
            padding: '10px 20px', borderRadius: 12, textAlign: 'center',
            background: result === 'success' ? 'var(--success)' : 'var(--coral-soft)',
            color: result === 'success' ? 'white' : 'var(--coral-ink)',
            fontWeight: 800, fontSize: 14,
          }}>
            {result === 'fail' ? '❌ Not quite — adjust your sequence and try again!' : '🎉 You made it!'}
          </div>
        )}

        {/* Direction buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
          {CODING_DIRS.map(function(dir) {
            var disabled = running || result === 'success';
            return (
              <button key={dir.key} onClick={function() { addStep(dir); }} disabled={disabled}
                style={{
                  padding: '11px 8px', borderRadius: 14, border: 'none',
                  background: disabled ? 'var(--alpha-sm)' : 'var(--blue-soft)',
                  color: disabled ? 'var(--ink-mute)' : 'var(--blue-ink)',
                  fontFamily: 'inherit', fontWeight: 800, fontSize: 14,
                  cursor: disabled ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'background 150ms, color 150ms',
                }}
                onMouseEnter={function(e) { if (!disabled) { e.currentTarget.style.background = 'var(--blue)'; e.currentTarget.style.color = 'white'; } }}
                onMouseLeave={function(e) { if (!disabled) { e.currentTarget.style.background = 'var(--blue-soft)'; e.currentTarget.style.color = 'var(--blue-ink)'; } }}
              >
                <span style={{ fontSize: 20 }}>{dir.icon}</span>
                <span>{dir.label}</span>
              </button>
            );
          })}
        </div>

        {/* Clear + Run */}
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={clearSequence} disabled={running}
            style={{
              flex: 1, padding: '12px', borderRadius: 14,
              border: '2px solid var(--alpha-md)', background: 'var(--surface)',
              color: running ? 'var(--ink-mute)' : 'var(--ink-soft)',
              fontFamily: 'inherit', fontWeight: 800, fontSize: 14,
              cursor: running ? 'default' : 'pointer',
            }}>🗑 Clear</button>
          <button onClick={runSequence} disabled={running || sequence.length === 0}
            style={{
              flex: 2, padding: '12px', borderRadius: 14, border: 'none',
              background: running || sequence.length === 0 ? 'var(--alpha-sm)' : 'var(--coral)',
              color: running || sequence.length === 0 ? 'var(--ink-mute)' : 'white',
              fontFamily: 'inherit', fontWeight: 900, fontSize: 15,
              cursor: running || sequence.length === 0 ? 'default' : 'pointer',
              transition: 'background 150ms',
            }}>
            {running ? '⏳ Running…' : '▶ Run'}
          </button>
        </div>
      </div>
      <Burst show={burst}/>
    </div>
  );
}

Object.assign(window, { ClickGame, DragGame, TypeGame, MissingGame, KeyboardGame, PrecisionGame, ScrambleGame, SpeedGame, EchoGame, FlashGame, CodingGame });
