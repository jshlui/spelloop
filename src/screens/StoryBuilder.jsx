// StoryBuilder — 3-panel comic strip after chapter completion

var STORY_TEMPLATES = [
  // Chapter 1 — Forest
  { chapter: 1, bg: '#D7F5E8', panels: [
    { text: 'One day a [word0] walked into the forest.', slots: ['word0'] },
    { text: 'The [word0] found a big [word1] under a tree!', slots: ['word0', 'word1'] },
    { text: '"Wow!" said the [word0]. "What a [word2] adventure!"', slots: ['word0', 'word2'] },
  ]},
  // Chapter 2 — Sea
  { chapter: 2, bg: '#D7F0FF', panels: [
    { text: 'A [word0] went diving in the deep blue sea.', slots: ['word0'] },
    { text: 'It found a magical [word1] glowing underwater.', slots: ['word1'] },
    { text: 'The [word0] and the [word1] became best friends forever!', slots: ['word0', 'word1'] },
  ]},
  // Chapter 3 — Mountain
  { chapter: 3, bg: '#FFF6EA', panels: [
    { text: 'A brave [word0] climbed the tallest mountain.', slots: ['word0'] },
    { text: 'At the top sat a giant [word1] blocking the path.', slots: ['word1'] },
    { text: 'The [word0] spelled [word2] and the path opened!', slots: ['word0', 'word2'] },
  ]},
  // Chapter 4 — Jungle
  { chapter: 4, bg: '#E0F7E9', panels: [
    { text: 'Deep in the jungle lived a sneaky [word0].', slots: ['word0'] },
    { text: 'Every day it searched for a shiny [word1].', slots: ['word1'] },
    { text: 'One morning it found [word2] hidden in a tree!', slots: ['word2'] },
  ]},
  // Chapter 5 — Sky
  { chapter: 5, bg: '#EEF4FF', panels: [
    { text: 'A tiny [word0] dreamed of flying through the sky.', slots: ['word0'] },
    { text: 'It spotted a floating [word1] drifting on the wind.', slots: ['word1'] },
    { text: 'The [word0] grabbed the [word1] and soared away!', slots: ['word0', 'word1'] },
  ]},
  // Chapter 6 — Castle
  { chapter: 6, bg: '#EDE4FF', panels: [
    { text: 'Inside the great castle lived a wise [word0].', slots: ['word0'] },
    { text: 'The [word0] guarded a precious [word1] in the tower.', slots: ['word0', 'word1'] },
    { text: 'Only the one who could spell [word2] could enter!', slots: ['word2'] },
  ]},
  // Chapter 7 — Galaxy
  { chapter: 7, bg: '#1A1A3E', dark: true, panels: [
    { text: 'A [word0] zoomed through the Word Galaxy in a rocket.', slots: ['word0'] },
    { text: 'It crashed into a planet made of [word1].', slots: ['word1'] },
    { text: 'The [word0] used [word2] to fix the rocket and fly home!', slots: ['word0', 'word2'] },
  ]},
  // Chapter 8 — Island
  { chapter: 8, bg: '#D7F0FF', panels: [
    { text: 'A [word0] sailed to a secret island at sunrise.', slots: ['word0'] },
    { text: 'Under the palm trees, it found a whispering [word1].', slots: ['word1'] },
    { text: 'The map glowed when everyone spelled [word2] together!', slots: ['word2'] },
  ]},
  // Chapter 9 — Tower
  { chapter: 9, bg: '#EDE4FF', panels: [
    { text: 'At the top of the tall tower waited a brave [word0].', slots: ['word0'] },
    { text: 'A silver [word1] opened the hidden door.', slots: ['word1'] },
    { text: 'The final word was [word2], and the whole tower sparkled!', slots: ['word2'] },
  ]},
  // Chapter 10 — Code Lab
  { chapter: 10, bg: '#D7F5E8', panels: [
    { text: 'In the Code Lab, a [word0] built a clever robot.', slots: ['word0'] },
    { text: 'The robot loved to eat [word1] for energy.', slots: ['word1'] },
    { text: 'Together they invented [word2] and changed the world!', slots: ['word2'] },
  ]},
];
window.STORY_TEMPLATES = STORY_TEMPLATES;

function StoryBuilder({ chapter, chapterWords, onDone }) {
  var template = STORY_TEMPLATES.find(function(t) { return t.chapter === chapter; }) || STORY_TEMPLATES[0];
  var isDark = !!template.dark;
  var inkColor = isDark ? 'rgba(255,255,255,0.92)' : '#0F172A';
  var softInk = isDark ? 'rgba(255,255,255,0.55)' : '#64748B';

  // word slots — fill with selected words from chapter collection
  var [slots, setSlots] = React.useState({ word0: '', word1: '', word2: '' });
  var [saved, setSaved] = React.useState(false);
  var [reading, setReading] = React.useState(false);

  // Available words — from chapterWords (2+ star completions for this chapter)
  var wordPool = (chapterWords || []).filter(function(w) { return w && w.length > 0; });

  function fillSlot(key, word) {
    setSlots(function(prev) { return Object.assign({}, prev, { [key]: word }); });
  }

  function renderText(text) {
    return text.replace(/\[word(\d)\]/g, function(_, i) {
      var val = slots['word' + i];
      return val ? '[' + val + ']' : '[___]';
    });
  }

  function readAloud() {
    if (!window.speechSynthesis) return;
    setReading(true);
    var fullText = template.panels.map(function(p) { return renderText(p.text); }).join(' ');
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(fullText);
    u.rate = 0.85; u.pitch = 1.05; u.lang = 'en-AU';
    u.onend = function() { setReading(false); };
    window.speechSynthesis.speak(u);
  }

  function saveStory() {
    var key = 'spelloop-stories-' + (window.__currentProfileId || 'p0');
    var stories = [];
    try { stories = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) {}
    stories.unshift({ chapter: chapter, slots: slots, template: template.chapter, createdAt: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(stories.slice(0, 20)));
    setSaved(true);
  }

  var allFilled = template.panels.every(function(p) {
    return p.slots.every(function(s) { return slots[s]; });
  });

  var PANEL_BG = isDark
    ? ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.09)', 'rgba(255,255,255,0.06)']
    : ['#fff8f0', '#f0f9ff', '#f5f0ff'];
  var PANEL_EMOJI = ['📖', '✨', '🎉'];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: template.bg,
      display: 'flex', flexDirection: 'column', overflow: 'auto',
      zIndex: 900, padding: '24px 20px 32px',
      fontFamily: "'Nunito',system-ui,sans-serif",
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', color: softInk, marginBottom: 4 }}>
          Chapter {chapter} Story
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: inkColor, fontFamily: "'Fredoka','Nunito',sans-serif" }}>
          Build Your Story! 📚
        </div>
        <div style={{ fontSize: 13, color: softInk, marginTop: 4 }}>
          Pick words from your collection to fill the panels
        </div>
      </div>

      {/* Word picker */}
      {wordPool.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: softInk, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Your words:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {wordPool.map(function(w, i) {
              var emoji = window.WORD_HINTS && window.WORD_HINTS[w] ? window.WORD_HINTS[w] : '📖';
              var usedAs = Object.entries(slots).find(function(e) { return e[1] === w; });
              return (
                <button key={i} onClick={function() {
                  // Fill next empty slot
                  var slotKeys = ['word0', 'word1', 'word2'];
                  var next = slotKeys.find(function(k) { return !slots[k]; });
                  if (next) fillSlot(next, w);
                  else fillSlot(slotKeys[0], w); // cycle back
                }} style={{
                  background: usedAs ? 'var(--brand)' : (isDark ? 'rgba(255,255,255,0.12)' : 'var(--surface)'),
                  color: usedAs ? 'white' : inkColor,
                  border: '2px solid ' + (usedAs ? 'var(--brand)' : (isDark ? 'rgba(255,255,255,0.2)' : 'var(--brand-light)')),
                  borderRadius: 999, padding: '5px 12px',
                  fontSize: 13, fontWeight: 800, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  {emoji} {w}
                </button>
              );
            })}
          </div>
          {Object.values(slots).some(Boolean) && (
            <button onClick={function() { setSlots({ word0: '', word1: '', word2: '' }); }}
              style={{ marginTop: 8, fontSize: 12, color: softInk, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Comic panels */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        {template.panels.map(function(panel, i) {
          return (
            <div key={i} style={{
              flex: '1 1 200px', minWidth: 160, maxWidth: 280,
              background: PANEL_BG[i], borderRadius: 16,
              border: '2px solid ' + (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'),
              padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ fontSize: 22, textAlign: 'center' }}>{PANEL_EMOJI[i]}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: inkColor, lineHeight: 1.5, textAlign: 'center' }}>
                {panel.text.split(/(\[word\d\])/).map(function(part, j) {
                  var match = part.match(/\[word(\d)\]/);
                  if (!match) return React.createElement('span', { key: j }, part);
                  var key = 'word' + match[1];
                  var val = slots[key];
                  return React.createElement('span', { key: j, style: {
                    display: 'inline-block',
                    background: val ? 'var(--gold)' : (isDark ? 'rgba(255,255,255,0.15)' : 'var(--brand-light)'),
                    color: val ? '#451A03' : softInk,
                    borderRadius: 6, padding: '0 5px', fontWeight: 900,
                    minWidth: 40, textAlign: 'center',
                    cursor: val ? 'pointer' : 'default',
                  }, onClick: val ? function() { fillSlot(key, ''); } : undefined }, val || '___');
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={readAloud} disabled={!allFilled || reading} style={{
          background: 'var(--brand)', color: 'white', border: 'none', borderRadius: 999,
          padding: '12px 24px', fontWeight: 900, fontSize: 14, cursor: allFilled ? 'pointer' : 'default',
          opacity: allFilled ? 1 : 0.4, fontFamily: "'Fredoka','Nunito',sans-serif",
          boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
        }}>{reading ? '🔊 Reading...' : '🔊 Read my story!'}</button>

        <button onClick={function() { saveStory(); setTimeout(onDone, 800); }} style={{
          background: saved ? 'var(--emerald)' : 'var(--gold)', color: saved ? 'white' : '#451A03',
          border: 'none', borderRadius: 999, padding: '12px 24px',
          fontWeight: 900, fontSize: 14, cursor: 'pointer',
          fontFamily: "'Fredoka','Nunito',sans-serif", boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
        }}>{saved ? '✓ Saved!' : '💾 Save & continue'}</button>
      </div>
    </div>
  );
}
window.StoryBuilder = StoryBuilder;
