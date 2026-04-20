var TUTORIAL_EMOJIS = ['🐱', '🐶', '☀️', '🐟', '🌳'];
var POSITIONS = [
  { left: '15%', top: '20%' },
  { left: '70%', top: '15%' },
  { left: '40%', top: '55%' },
  { left: '80%', top: '65%' },
  { left: '10%', top: '70%' },
];

function EmojiTarget({ emoji, position, onCollected }) {
  const { ref, dwelling, progress } = window.useDwell(700);
  const [collected, setCollected] = React.useState(false);
  const circumference = 2 * Math.PI * 38;

  React.useEffect(function() {
    if (dwelling && !collected) {
      setCollected(true);
      window.sfx && window.sfx.playCorrect && window.sfx.playCorrect();
      onCollected();
    }
  }, [dwelling]);

  // Play rising tone as dwell progresses (throttled to ~10 calls)
  var lastProgressRef = React.useRef(0);
  React.useEffect(function() {
    var rounded = Math.round(progress * 10) / 10;
    if (progress > 0 && progress < 1 && rounded !== lastProgressRef.current) {
      lastProgressRef.current = rounded;
      window.sfx && window.sfx.playDwell && window.sfx.playDwell(progress);
    }
  }, [Math.round(progress * 10)]);

  return (
    <div ref={ref} style={{
      position: 'absolute',
      left: position.left,
      top: position.top,
      width: 96,
      height: 96,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 48,
    }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(108,142,255,0.2)" strokeWidth="5"/>
        <circle cx="48" cy="48" r="38" fill="none"
          stroke={collected ? '#30C285' : '#6C8EFF'} strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - circumference * (collected ? 1 : progress)}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
          style={{ transition: 'stroke-dashoffset 0.05s linear, stroke 0.2s' }}
        />
      </svg>
      <span style={{
        position: 'relative', zIndex: 1,
        opacity: collected ? 0.4 : 1,
        display: 'inline-block',
        animation: collected ? 'emojiCollect 0.4s cubic-bezier(0.34,1.56,0.64,1) both' : 'none',
      }}>
        {emoji}
      </span>
    </div>
  );
}

function HoverTutorial({ onComplete }) {
  const [collected, setCollected] = React.useState(0);
  const [done, setDone] = React.useState(false);

  const handleCollected = React.useCallback(function() {
    setCollected(function(c) {
      var next = c + 1;
      if (next >= TUTORIAL_EMOJIS.length) {
        setTimeout(function() { setDone(true); }, 500);
      }
      return next;
    });
  }, []);

  React.useEffect(function() {
    if (done) {
      window.sfx && window.sfx.playComplete && window.sfx.playComplete();
      setTimeout(onComplete, 900);
    }
  }, [done]);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg, #F3F6FA)',
      zIndex: 100,
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '8%', left: 0, right: 0,
        textAlign: 'center',
        fontSize: 'clamp(24px, 5vw, 34px)',
        fontWeight: 800,
        color: 'var(--ink, #1F2A44)',
        fontFamily: 'inherit',
      }}>
        {done
          ? React.createElement('span', { style: { color: '#30C285' } }, 'Ready! 🎉')
          : 'Hover over each! (' + collected + '/' + TUTORIAL_EMOJIS.length + ')'}
      </div>

      {TUTORIAL_EMOJIS.map(function(emoji, i) {
        return React.createElement(EmojiTarget, {
          key: emoji,
          emoji: emoji,
          position: POSITIONS[i],
          onCollected: handleCollected,
        });
      })}

      <button
        onClick={onComplete}
        style={{
          position: 'absolute', bottom: 24, right: 24,
          background: 'none',
          border: '2px solid var(--ink-soft, #4B587A)',
          borderRadius: 20, padding: '8px 18px',
          fontSize: 14, color: 'var(--ink-soft, #4B587A)',
          fontFamily: 'inherit',
        }}
      >
        Skip
      </button>
    </div>
  );
}

Object.assign(window, { HoverTutorial: HoverTutorial });
