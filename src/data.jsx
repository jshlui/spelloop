// Game data + session state.
// Words for MVP (mixed easy 3–5 letters, kid-safe)
const WORDS_EASY = [
  { word: 'CAT', theme: 'animal' },
  { word: 'DOG', theme: 'animal' },
  { word: 'SUN', theme: 'space' },
  { word: 'BEE', theme: 'animal' },
  { word: 'HAT', theme: 'object' },
];
const WORDS_MED = [
  { word: 'FISH', theme: 'animal' },
  { word: 'MOON', theme: 'space' },
  { word: 'STAR', theme: 'space' },
  { word: 'FROG', theme: 'animal' },
  { word: 'BIRD', theme: 'animal' },
];
const WORDS_HARD = [
  { word: 'APPLE', theme: 'fruit' },
  { word: 'PANDA', theme: 'animal' },
  { word: 'HOUSE', theme: 'object' },
  { word: 'CLOUD', theme: 'weather' },
  { word: 'PIZZA', theme: 'food' },
];

function getWordsForDifficulty(d) {
  if (d === 'easy') return WORDS_EASY;
  if (d === 'hard') return WORDS_HARD;
  return WORDS_MED;
}

// Progression — chapter 1 levels. Mode per level.
const LEVELS = [
  { id: 1, mode: 'click',   word: 'CAT',  stars: 3, done: true  },
  { id: 2, mode: 'missing', word: 'DOG',  stars: 3, done: true  },
  { id: 3, mode: 'drag',    word: 'SUN',  stars: 2, done: true  },
  { id: 4, mode: 'type',    word: 'HAT',  stars: 0, done: false, current: true },
  { id: 5, mode: 'keyboard',word: 'BEE',  stars: 0, done: false, locked: true },
  { id: 6, mode: 'click',   word: 'MOON', stars: 0, done: false, locked: true },
  { id: 7, mode: 'drag',    word: 'STAR', stars: 0, done: false, locked: true },
  { id: 8, mode: 'boss',    word: 'FROG', stars: 0, done: false, locked: true },
];

const MODE_META = {
  click:    { label: 'Click',     color: 'blue',  ink: 'var(--blue-ink)',  soft: 'var(--blue-soft)',  icon: '◉' },
  drag:     { label: 'Drag',      color: 'pink',  ink: 'var(--pink-ink)',  soft: 'var(--pink-soft)',  icon: '↔' },
  type:     { label: 'Type',      color: 'coral', ink: 'var(--coral-ink)', soft: 'var(--coral-soft)', icon: '⌨' },
  missing:  { label: 'Missing',   color: 'mint',  ink: 'var(--mint-ink)',  soft: 'var(--mint-soft)',  icon: '_' },
  keyboard: { label: 'Sequence',  color: 'lilac', ink: 'var(--lilac-ink)', soft: 'var(--lilac-soft)', icon: '⌘' },
  boss:     { label: 'Boss',      color: 'coral', ink: 'var(--coral-ink)', soft: 'var(--coral-soft)', icon: '★' },
};

Object.assign(window, { WORDS_EASY, WORDS_MED, WORDS_HARD, getWordsForDifficulty, LEVELS, MODE_META });
