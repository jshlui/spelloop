# ElevenLabs High-Quality Word Pronunciation

**Date:** 2026-04-21  
**Status:** Approved

---

## Context

SpellLoop Kids currently pronounces spelling words using the browser's built-in Web Speech API (`window.speechSynthesis`), targeting an Australian English voice. Quality varies widely across devices and often sounds robotic — especially on Android. ElevenLabs provides natural, expressive human voices via a simple REST API.

The goal is to replace the `SpeakButton` word-pronunciation with ElevenLabs audio while keeping the browser speech API as a silent fallback for users without a key.

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Scope | Spelling words only | Narration/pet voices are a separate future feature |
| Key ownership | Parent-entered in Parent area | Zero cost to developer; parents who want quality opt in |
| Fallback | `window.speechSynthesis` (current behaviour) | Always works, no regression for users without a key |
| Caching | `localStorage` per word | Word list is fixed; fetch once, free forever after |

---

## Architecture

### `speakWord(word)` — new shared utility (added to `src/ui.jsx`)

The single entry point for all word pronunciation. Called by `SpeakButton`.

```
speakWord(word)
  ├── Check localStorage['spelloop-audio-{WORD}'] → play cached base64 Audio → done
  ├── Check localStorage['spelloop-el-key'] → call ElevenLabs API
  │     ├── success → cache base64 in localStorage → play → done
  │     └── failure (network / bad key) → fall through to browser speech
  └── window.speechSynthesis fallback (current code, unchanged)
```

### ElevenLabs API call

```
POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
Headers: xi-api-key: {key}
Body: { text: word, model_id: "eleven_turbo_v2" }
Response: audio/mpeg binary → convert to base64 → cache + play
```

- Model: `eleven_turbo_v2` — fastest, cheapest, great quality
- Voice: stored in `localStorage['spelloop-el-voice']`, defaults to `pNInz6obpgDQGcFmaJgB` (Adam — clear, neutral, works well for single words)

### localStorage keys

| Key | Value | Notes |
|---|---|---|
| `spelloop-el-key` | ElevenLabs API key string | Set by parent, never stored in profile JSON |
| `spelloop-el-voice` | Voice ID string | Set by parent, defaults to Adam |
| `spelloop-audio-{WORD}` | `data:audio/mpeg;base64,…` | Populated on first speak, persists indefinitely |

Cache keys use the word uppercased (`spelloop-audio-CAT`, etc.) to match the app's word format.

---

## Files to Modify

### `src/ui.jsx`

1. **Add `speakWord(word)` function** above `SpeakButton`:
   - Checks cache → ElevenLabs → browser speech (as described above)
   - Shows a loading state on the button while fetching (first-time only)
   - Plays via `new Audio(dataUrl).play()`

2. **Update `SpeakButton`**:
   - Replace the `speak()` function body with a call to `speakWord(word)`
   - Add a `[loading]` state to show a spinner while ElevenLabs fetches (first play only)
   - Keep existing button UI unchanged

### `src/web/WebParent.jsx` — `SettingsTab`

Add a new card section **"Voice settings"** below the sound effects toggle:

```
┌─ Voice settings ──────────────────────────────────┐
│ ElevenLabs API Key                                 │
│ [••••••••••••••••••••••••••••] [Save] [Clear]      │
│                                                    │
│ Voice          [Adam ▼]  (dropdown of 6 voices)    │
│                                                    │
│ ℹ️  Get a free key at elevenlabs.io (10k chars/mo) │
│    Without a key, the app uses your device's voice │
└───────────────────────────────────────────────────┘
```

Voice dropdown options (6 voices, all clear/neutral for kids):

| Voice ID | Label |
|---|---|
| `pNInz6obpgDQGcFmaJgB` | Adam (default) |
| `EXAVITQu4vr4xnSDxMaL` | Bella |
| `VR6AewLTigWG4xSOukaG` | Arnold |
| `TxGEqnHWrfWFTfGW9XjX` | Josh |
| `yoZ06aMxZJJ28mfd3POQ` | Sam |
| `jBpfuIE2acCys8YRkVHT` | Freya |

- API key input: `type="password"`, stored to `localStorage['spelloop-el-key']` on Save
- Clear button: removes the key and clears all `spelloop-audio-*` cache entries
- Voice dropdown: updates `localStorage['spelloop-el-voice']` immediately on change

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| No API key set | Silent fallback to browser speech, no error shown |
| Wrong key (401) | Show inline error "Invalid API key" in Parent settings; fall back to browser speech for this play |
| Network failure | Silent fallback to browser speech |
| Word already cached | Skip API entirely, play instantly |
| localStorage full | Catch QuotaExceededError, play without caching |

---

## Verification

1. No API key set → tap SpeakButton → browser speech plays (no regression)
2. Set a valid ElevenLabs key in Parent → close Parent area → tap SpeakButton on "CAT" → spinner shows briefly → high-quality audio plays
3. Tap SpeakButton on "CAT" again → plays instantly (no spinner, served from cache)
4. Reload page → tap SpeakButton on "CAT" → plays instantly (localStorage cache survives reload)
5. Set invalid key → tap SpeakButton → falls back to browser speech silently
6. In Parent settings → Clear → all `spelloop-audio-*` keys removed from localStorage
7. Switch voice to Bella → speak a new word → Bella's voice is used
8. No console errors throughout
