# ElevenLabs Voice Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `SpeakButton`'s browser speech with ElevenLabs high-quality audio, with localStorage caching and browser speech fallback.

**Architecture:** A new `speakWord(word)` function in `src/ui.jsx` checks localStorage for cached audio, then calls ElevenLabs if a parent-supplied API key exists, then falls back to browser `speechSynthesis`. The Parent area `SettingsTab` in `src/web/WebParent.jsx` gets a "Voice settings" card where parents enter their API key and pick a voice.

**Tech Stack:** Vanilla JS, React 18 (CDN), ElevenLabs REST API (`eleven_turbo_v2`), Web Audio, localStorage for caching.

---

## File Map

| File | Change |
|---|---|
| `src/ui.jsx` | Add `speakWord(word)` above `SpeakButton`; update `SpeakButton` to call it; add loading state |
| `src/web/WebParent.jsx` | Add "Voice settings" card to `SettingsTab` with key input, voice picker, clear button |

No new files. No other files touched.

---

### Task 1: Add `speakWord(word)` to `src/ui.jsx`

**Files:**
- Modify: `src/ui.jsx` — insert `speakWord` function directly above the `SpeakButton` function (currently line ~141)

**localStorage keys used:**
- `spelloop-el-key` — ElevenLabs API key (string, set by parent)
- `spelloop-el-voice` — voice ID (string, defaults to `pNInz6obpgDQGcFmaJgB`)
- `spelloop-audio-{WORD}` — base64 data URL per uppercased word (e.g. `spelloop-audio-CAT`)

- [ ] **Step 1: Insert `speakWord` above `SpeakButton` in `src/ui.jsx`**

Add this entire function immediately before the line `function SpeakButton(`:

```js
var EL_DEFAULT_VOICE = 'pNInz6obpgDQGcFmaJgB'; // Adam

function speakWord(word, onStart, onEnd) {
  // onStart() called when audio begins, onEnd() when it finishes
  var key = (word || '').toUpperCase();
  var cacheKey = 'spelloop-audio-' + key;

  function playDataUrl(dataUrl) {
    try {
      var audio = new Audio(dataUrl);
      audio.onplay  = function() { onStart && onStart(); };
      audio.onended = function() { onEnd   && onEnd();   };
      audio.onerror = function() { onEnd   && onEnd();   };
      audio.play();
    } catch(e) { onEnd && onEnd(); }
  }

  function browserFallback() {
    onStart && onStart();
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(word.toLowerCase());
        u.lang = 'en-AU';
        u.rate = 0.72;
        u.pitch = 1.05;
        u.volume = 1;
        var voices = window.speechSynthesis.getVoices();
        var auVoice = voices.find(function(v) { return v.lang === 'en-AU'; })
          || voices.find(function(v) { return v.lang.startsWith('en-AU'); })
          || voices.find(function(v) { return v.lang.startsWith('en-GB'); })
          || null;
        if (auVoice) u.voice = auVoice;
        u.onend = function() { onEnd && onEnd(); };
        window.speechSynthesis.speak(u);
      } else {
        onEnd && onEnd();
      }
    } catch(e) { onEnd && onEnd(); }
  }

  // 1. Check cache
  try {
    var cached = localStorage.getItem(cacheKey);
    if (cached) { playDataUrl(cached); return; }
  } catch(e) {}

  // 2. Try ElevenLabs
  var elKey = '';
  try { elKey = localStorage.getItem('spelloop-el-key') || ''; } catch(e) {}

  if (!elKey) { browserFallback(); return; }

  var voiceId = '';
  try { voiceId = localStorage.getItem('spelloop-el-voice') || EL_DEFAULT_VOICE; } catch(e) {}
  if (!voiceId) voiceId = EL_DEFAULT_VOICE;

  onStart && onStart(); // show loading state immediately

  fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': elKey,
    },
    body: JSON.stringify({ text: word.toLowerCase(), model_id: 'eleven_turbo_v2' }),
  })
  .then(function(res) {
    if (!res.ok) throw new Error('EL ' + res.status);
    return res.blob();
  })
  .then(function(blob) {
    var reader = new FileReader();
    reader.onload = function() {
      var dataUrl = reader.result;
      // Cache it
      try { localStorage.setItem(cacheKey, dataUrl); } catch(e) {} // ignore QuotaExceededError
      playDataUrl(dataUrl);
    };
    reader.readAsDataURL(blob);
  })
  .catch(function() {
    // Network error or bad key — fall back silently
    browserFallback();
  });
}
```

- [ ] **Step 2: Open the app in a browser and verify no JS errors on load**

Open `http://localhost:8765/SpellLoop%20Kids.html`. Check browser console — should be 0 errors (favicon 404 is fine).

---

### Task 2: Update `SpeakButton` to use `speakWord`

**Files:**
- Modify: `src/ui.jsx` — replace the `speak()` function body inside `SpeakButton`; rename `playing` state to `loading` for clarity

- [ ] **Step 1: Replace the `SpeakButton` function body**

Find the existing `SpeakButton` function (starts at `function SpeakButton({ word, size = 56, big = false }) {`) and replace it entirely with:

```js
function SpeakButton({ word, size = 56, big = false }) {
  var [loading, setLoading] = React.useState(false);

  function speak() {
    if (loading) return; // prevent double-tap during fetch
    window.sfx?.tap();
    speakWord(
      word,
      function() { setLoading(true);  },  // onStart
      function() { setLoading(false); }   // onEnd
    );
  }

  var s = big ? 88 : size;
  return (
    <button onClick={speak} style={{
      width: s, height: s, borderRadius: '50%',
      background: loading ? 'var(--blue-ink, #3F5FE2)' : 'var(--blue)',
      border: 'none', cursor: loading ? 'wait' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: 'var(--shadow-toy)',
      position: 'relative',
      transition: 'transform var(--dur-fast) var(--ease-toy), box-shadow var(--dur-fast) var(--ease-toy), background var(--dur-fast) ease',
    }}
    onMouseEnter={function(e) { if (!loading) { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; } }}
    onMouseLeave={function(e) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'var(--shadow-toy)'; }}
    onMouseDown={function(e) { if (!loading) e.currentTarget.style.transform = 'scale(0.94)'; }}
    onMouseUp={function(e)   { if (!loading) e.currentTarget.style.transform = 'scale(1.08)'; }}
    >
      {loading ? (
        <div style={{
          width: s * 0.38, height: s * 0.38, border: '3px solid rgba(255,255,255,0.3)',
          borderTopColor: 'white', borderRadius: '50%',
          animation: 'elSpin 700ms linear infinite',
        }}/>
      ) : (
        <svg width={s * 0.45} height={s * 0.45} viewBox="0 0 24 24" fill="white">
          <path d="M3 9v6h4l5 5V4L7 9H3z"/>
          <path d="M15 8 Q18 12 15 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M18 5 Q23 12 18 19" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
        </svg>
      )}
      {!loading && (
        <div style={{
          position: 'absolute', inset: -8, borderRadius: '50%',
          border: '3px solid var(--blue)', opacity: 0,
          animation: 'none',
        }}/>
      )}
      <style>{`
        @keyframes ping { from { transform: scale(1); opacity: 0.6 } to { transform: scale(1.4); opacity: 0 } }
        @keyframes elSpin { to { transform: rotate(360deg); } }
      `}</style>
    </button>
  );
}
```

- [ ] **Step 2: Verify in browser — no key scenario**

Open `http://localhost:8765/SpellLoop%20Kids.html`. Start any game (e.g. Click mode on level 1 — "CAT"). Tap the blue speaker button. Should hear browser speech (Australian accent). Console: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/ui.jsx
git commit -m "feat: add speakWord with ElevenLabs + localStorage cache, update SpeakButton"
```

---

### Task 3: Add Voice Settings to Parent Area

**Files:**
- Modify: `src/web/WebParent.jsx` — add "Voice settings" card to the end of `SettingsTab`, before the closing `</div>`

- [ ] **Step 1: Add voice state variables to `SettingsTab`**

Find `function SettingsTab({ profile, setProfile, settings, setSettings }) {` and add these lines immediately after the existing `var [ageVal, ...]` line:

```js
var [elKey, setElKey]       = React.useState(function() { try { return localStorage.getItem('spelloop-el-key') || ''; } catch(e) { return ''; } });
var [elVoice, setElVoice]   = React.useState(function() { try { return localStorage.getItem('spelloop-el-voice') || 'pNInz6obpgDQGcFmaJgB'; } catch(e) { return 'pNInz6obpgDQGcFmaJgB'; } });
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
    // Clear all cached audio
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
```

- [ ] **Step 2: Add "Voice settings" card to the JSX in `SettingsTab`**

Find the last `</div>` that closes the settings section (after the "Change parent PIN" card, i.e. after `</div>` on the line containing `webCard`). Insert this new card immediately before the final `</div>` that closes the whole return:

```jsx
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
          background: 'var(--coral-soft, #FFE8DF)', color: 'var(--coral-ink, #C0392B)',
          fontFamily: 'inherit', fontWeight: 800, fontSize: 13, cursor: 'pointer',
        }}>Clear</button>
      )}
    </div>
    {elKeyError && <div style={{ fontSize: 12, color: 'var(--danger, #F07171)', fontWeight: 700, marginTop: 4 }}>{elKeyError}</div>}
  </div>

  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: '#7C89A8', marginBottom: 4 }}>Voice</div>
    <select
      value={elVoice}
      onChange={handleVoiceChange}
      style={Object.assign({}, inputStyle, { width: 'auto', minWidth: 160 })}
    >
      {EL_VOICES.map(function(v) {
        return <option key={v.id} value={v.id}>{v.label}</option>;
      })}
    </select>
  </div>

  <div style={{ fontSize: 12, color: '#7C89A8', fontWeight: 700, lineHeight: 1.5, background: '#F7F9FC', borderRadius: 8, padding: '10px 12px' }}>
    ℹ️ Get a free key at <strong>elevenlabs.io</strong> (10,000 characters/month free).<br/>
    Without a key, the app uses your device's built-in voice.
  </div>
</div>
```

- [ ] **Step 3: Verify in browser — Parent area voice card renders**

Open the app, click "Parent area", enter PIN. Go to Settings tab. Scroll to bottom — should see "🔊 Voice settings" card with password input, Save button, and voice dropdown. No console errors.

- [ ] **Step 4: Commit**

```bash
git add src/web/WebParent.jsx
git commit -m "feat: add ElevenLabs API key + voice picker to Parent settings"
```

---

### Task 4: End-to-End Verification

- [ ] **Step 1: Verify fallback (no key)**

In browser console: `localStorage.removeItem('spelloop-el-key')`. Reload. Start a game, tap speaker on any word. Confirm browser speech plays. No errors.

- [ ] **Step 2: Verify ElevenLabs with a real key**

Enter a valid ElevenLabs API key in Parent → Settings → Voice settings → Save. Close Parent. Start a game on level 1 (word: "CAT"). Tap the speaker. Button goes darker briefly (loading spinner shows). High-quality audio plays. No errors.

- [ ] **Step 3: Verify cache (second play is instant)**

Tap the speaker on "CAT" again. Should play with NO spinner — instant. Confirm in DevTools → Application → localStorage that `spelloop-audio-CAT` exists as a `data:audio/mpeg;base64,...` string.

- [ ] **Step 4: Verify cache survives reload**

Reload the page. Tap speaker on "CAT". Plays instantly, no spinner, no network call.

- [ ] **Step 5: Verify Clear wipes cache**

Go to Parent → Settings → Voice settings → Clear button. Confirm in DevTools → localStorage that all `spelloop-audio-*` keys are gone. Tap speaker on "CAT" → spinner appears → fetches fresh from ElevenLabs.

- [ ] **Step 6: Verify voice switching**

Change voice dropdown from Adam to Bella. Tap speaker on a word not yet cached (e.g. "DOG"). Bella's voice plays.

- [ ] **Step 7: Final commit**

```bash
git add -p
git commit -m "feat: ElevenLabs high-quality word pronunciation with localStorage cache"
```
