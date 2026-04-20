// Game data — words, levels, mode metadata.

const WORDS_EASY = [
  { word: 'CAT', theme: 'animal' },  { word: 'DOG', theme: 'animal' },
  { word: 'SUN', theme: 'space' },   { word: 'BEE', theme: 'animal' },
  { word: 'HAT', theme: 'object' },  { word: 'COW', theme: 'animal' },
  { word: 'PIG', theme: 'animal' },  { word: 'OWL', theme: 'animal' },
  { word: 'ANT', theme: 'animal' },  { word: 'HEN', theme: 'animal' },
  { word: 'EGG', theme: 'food' },    { word: 'JAM', theme: 'food' },
  { word: 'CUP', theme: 'object' },  { word: 'BOX', theme: 'object' },
  { word: 'NET', theme: 'object' },  { word: 'MAP', theme: 'object' },
  { word: 'PEN', theme: 'object' },  { word: 'KEY', theme: 'object' },
  { word: 'JET', theme: 'object' },  { word: 'POT', theme: 'object' },
];

const WORDS_MED = [
  { word: 'FISH', theme: 'animal' }, { word: 'MOON', theme: 'space' },
  { word: 'STAR', theme: 'space' },  { word: 'FROG', theme: 'animal' },
  { word: 'BIRD', theme: 'animal' }, { word: 'BEAR', theme: 'animal' },
  { word: 'CRAB', theme: 'animal' }, { word: 'DUCK', theme: 'animal' },
  { word: 'WOLF', theme: 'animal' }, { word: 'DEER', theme: 'animal' },
  { word: 'KITE', theme: 'object' }, { word: 'RAIN', theme: 'weather' },
  { word: 'SNOW', theme: 'weather' }, { word: 'WIND', theme: 'weather' },
  { word: 'TREE', theme: 'nature' }, { word: 'LEAF', theme: 'nature' },
  { word: 'LAKE', theme: 'nature' }, { word: 'HILL', theme: 'nature' },
  { word: 'CAKE', theme: 'food' },   { word: 'MILK', theme: 'food' },
];

const WORDS_HARD = [
  { word: 'APPLE', theme: 'fruit' },  { word: 'PANDA', theme: 'animal' },
  { word: 'HOUSE', theme: 'object' }, { word: 'CLOUD', theme: 'weather' },
  { word: 'PIZZA', theme: 'food' },   { word: 'SHARK', theme: 'animal' },
  { word: 'TIGER', theme: 'animal' }, { word: 'EAGLE', theme: 'animal' },
  { word: 'HORSE', theme: 'animal' }, { word: 'BUNNY', theme: 'animal' },
  { word: 'OCEAN', theme: 'nature' }, { word: 'RIVER', theme: 'nature' },
  { word: 'STORM', theme: 'weather' },{ word: 'PLANT', theme: 'nature' },
  { word: 'BEACH', theme: 'nature' }, { word: 'GRAPE', theme: 'fruit' },
  { word: 'LEMON', theme: 'fruit' },  { word: 'MANGO', theme: 'fruit' },
  { word: 'FLAME', theme: 'nature' }, { word: 'GLOBE', theme: 'object' },
];

function getWordsForDifficulty(d) {
  if (d === 'easy') return WORDS_EASY;
  if (d === 'hard') return WORDS_HARD;
  return WORDS_MED;
}

// 3 chapters × 8 levels = 24 levels total
// Modes cycle: click → missing → drag → type → keyboard → missing → drag → boss
const LEVELS = [
  // ── Chapter 1: The Word Forest (easy, 3-letter words) ─────────────────────
  { id: 1,  chapter: 1, mode: 'click',    word: 'CAT',   stars: 0, done: false, current: true  },
  { id: 2,  chapter: 1, mode: 'missing',  word: 'DOG',   stars: 0, done: false, locked: true  },
  { id: 3,  chapter: 1, mode: 'drag',     word: 'SUN',   stars: 0, done: false, locked: true  },
  { id: 4,  chapter: 1, mode: 'type',     word: 'HAT',   stars: 0, done: false, locked: true  },
  { id: 5,  chapter: 1, mode: 'keyboard', word: 'COW',   stars: 0, done: false, locked: true  },
  { id: 6,  chapter: 1, mode: 'missing',  word: 'PIG',   stars: 0, done: false, locked: true  },
  { id: 7,  chapter: 1, mode: 'drag',     word: 'OWL',   stars: 0, done: false, locked: true  },
  { id: 8,  chapter: 1, mode: 'boss',     word: 'ANT',   stars: 0, done: false, locked: true  },
  // ── Chapter 2: The Word Sea (medium, 4-letter words) ──────────────────────
  { id: 9,  chapter: 2, mode: 'click',    word: 'FISH',  stars: 0, done: false, locked: true  },
  { id: 10, chapter: 2, mode: 'missing',  word: 'MOON',  stars: 0, done: false, locked: true  },
  { id: 11, chapter: 2, mode: 'drag',     word: 'STAR',  stars: 0, done: false, locked: true  },
  { id: 12, chapter: 2, mode: 'type',     word: 'FROG',  stars: 0, done: false, locked: true  },
  { id: 13, chapter: 2, mode: 'keyboard', word: 'BIRD',  stars: 0, done: false, locked: true  },
  { id: 14, chapter: 2, mode: 'missing',  word: 'BEAR',  stars: 0, done: false, locked: true  },
  { id: 15, chapter: 2, mode: 'drag',     word: 'DUCK',  stars: 0, done: false, locked: true  },
  { id: 16, chapter: 2, mode: 'boss',     word: 'KITE',  stars: 0, done: false, locked: true  },
  // ── Chapter 3: The Word Mountain (hard, 5-letter words) ───────────────────
  { id: 17, chapter: 3, mode: 'click',    word: 'APPLE', stars: 0, done: false, locked: true  },
  { id: 18, chapter: 3, mode: 'missing',  word: 'PANDA', stars: 0, done: false, locked: true  },
  { id: 19, chapter: 3, mode: 'drag',     word: 'HOUSE', stars: 0, done: false, locked: true  },
  { id: 20, chapter: 3, mode: 'type',     word: 'CLOUD', stars: 0, done: false, locked: true  },
  { id: 21, chapter: 3, mode: 'keyboard', word: 'PIZZA', stars: 0, done: false, locked: true  },
  { id: 22, chapter: 3, mode: 'missing',  word: 'SHARK', stars: 0, done: false, locked: true  },
  { id: 23, chapter: 3, mode: 'drag',     word: 'TIGER', stars: 0, done: false, locked: true  },
  { id: 24, chapter: 3, mode: 'boss',     word: 'EAGLE', stars: 0, done: false, locked: true  },
];

var CHAPTER_META = [
  { id: 1, name: 'The Word Forest', theme: 'animal/object', bg: 'linear-gradient(180deg, #D7F5E8 0%, #E3EAFF 100%)', emoji: '🌳' },
  { id: 2, name: 'The Word Sea',    theme: 'nature/weather', bg: 'linear-gradient(180deg, #E3EAFF 0%, #FFF6EA 100%)', emoji: '🌊' },
  { id: 3, name: 'The Word Mountain', theme: 'animals/food', bg: 'linear-gradient(180deg, #FFF6EA 0%, #EDE4FF 100%)', emoji: '⛰️' },
];

const MODE_META = {
  click:    { label: 'Click',    color: 'blue',  ink: 'var(--blue-ink)',  soft: 'var(--blue-soft)',  icon: '◉' },
  drag:     { label: 'Drag',     color: 'pink',  ink: 'var(--pink-ink)',  soft: 'var(--pink-soft)',  icon: '↔' },
  type:     { label: 'Type',     color: 'coral', ink: 'var(--coral-ink)', soft: 'var(--coral-soft)', icon: '⌨' },
  missing:  { label: 'Missing',  color: 'mint',  ink: 'var(--mint-ink)',  soft: 'var(--mint-soft)',  icon: '_' },
  keyboard: { label: 'Sequence', color: 'lilac', ink: 'var(--lilac-ink)', soft: 'var(--lilac-soft)', icon: '⌘' },
  boss:     { label: 'Boss',     color: 'coral', ink: 'var(--coral-ink)', soft: 'var(--coral-soft)', icon: '★' },
};

var PRECISION_TASKS = [
  { id: 'p1', mode: 'precision', word: 'GO',  stars: 0, done: false },
  { id: 'p2', mode: 'precision', word: 'UP',  stars: 0, done: false },
  { id: 'p3', mode: 'precision', word: 'FLY', stars: 0, done: false },
];
window.PRECISION_TASKS = PRECISION_TASKS;

window.MODE_META['precision'] = {
  label: 'Precision', color: 'coral', ink: '#fff', soft: 'rgba(255,160,122,0.15)', icon: '🎯'
};

Object.assign(window, { WORDS_EASY, WORDS_MED, WORDS_HARD, getWordsForDifficulty, LEVELS, CHAPTER_META, MODE_META, PRECISION_TASKS });
