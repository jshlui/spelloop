// Game data — words, levels, mode metadata.

const WORDS_EASY = [
  { word: 'CAT', theme: 'animal',  phonemes: ['CVC', 'short-a'] },
  { word: 'DOG', theme: 'animal',  phonemes: ['CVC', 'short-o'] },
  { word: 'SUN', theme: 'space',   phonemes: ['CVC', 'short-u'] },
  { word: 'BEE', theme: 'animal',  phonemes: ['long-e', 'double-vowel'] },
  { word: 'HAT', theme: 'object',  phonemes: ['CVC', 'short-a'] },
  { word: 'COW', theme: 'animal',  phonemes: ['CVC', 'ow-diphthong'] },
  { word: 'PIG', theme: 'animal',  phonemes: ['CVC', 'short-i'] },
  { word: 'OWL', theme: 'animal',  phonemes: ['ow-diphthong', 'blend-l'] },
  { word: 'ANT', theme: 'animal',  phonemes: ['CVC', 'short-a', 'blend-nt'] },
  { word: 'HEN', theme: 'animal',  phonemes: ['CVC', 'short-e'] },
  { word: 'EGG', theme: 'food',    phonemes: ['CVC', 'short-e', 'double-consonant'] },
  { word: 'JAM', theme: 'food',    phonemes: ['CVC', 'short-a'] },
  { word: 'CUP', theme: 'object',  phonemes: ['CVC', 'short-u'] },
  { word: 'BOX', theme: 'object',  phonemes: ['CVC', 'short-o'] },
  { word: 'NET', theme: 'object',  phonemes: ['CVC', 'short-e'] },
  { word: 'MAP', theme: 'object',  phonemes: ['CVC', 'short-a'] },
  { word: 'PEN', theme: 'object',  phonemes: ['CVC', 'short-e'] },
  { word: 'KEY', theme: 'object',  phonemes: ['long-e', 'silent-y'] },
  { word: 'JET', theme: 'object',  phonemes: ['CVC', 'short-e'] },
  { word: 'POT', theme: 'object',  phonemes: ['CVC', 'short-o'] },
];

const WORDS_MED = [
  { word: 'FISH', theme: 'animal',  phonemes: ['digraph-sh', 'short-i'] },
  { word: 'MOON', theme: 'space',   phonemes: ['long-oo', 'double-vowel'] },
  { word: 'STAR', theme: 'space',   phonemes: ['blend-st', 'r-controlled'] },
  { word: 'FROG', theme: 'animal',  phonemes: ['blend-fr', 'short-o'] },
  { word: 'BIRD', theme: 'animal',  phonemes: ['r-controlled', 'blend-rd'] },
  { word: 'BEAR', theme: 'animal',  phonemes: ['ea-digraph', 'r-controlled'] },
  { word: 'CRAB', theme: 'animal',  phonemes: ['blend-cr', 'short-a'] },
  { word: 'DUCK', theme: 'animal',  phonemes: ['digraph-ck', 'short-u'] },
  { word: 'WOLF', theme: 'animal',  phonemes: ['blend-lf', 'short-o'] },
  { word: 'DEER', theme: 'animal',  phonemes: ['long-e', 'double-vowel', 'r-controlled'] },
  { word: 'KITE', theme: 'object',  phonemes: ['long-i', 'silent-e'] },
  { word: 'RAIN', theme: 'weather', phonemes: ['ai-digraph', 'long-a'] },
  { word: 'SNOW', theme: 'weather', phonemes: ['blend-sn', 'ow-diphthong'] },
  { word: 'WIND', theme: 'weather', phonemes: ['blend-nd', 'short-i'] },
  { word: 'TREE', theme: 'nature',  phonemes: ['blend-tr', 'long-e', 'double-vowel'] },
  { word: 'LEAF', theme: 'nature',  phonemes: ['ea-digraph', 'long-e'] },
  { word: 'LAKE', theme: 'nature',  phonemes: ['long-a', 'silent-e'] },
  { word: 'HILL', theme: 'nature',  phonemes: ['short-i', 'double-consonant'] },
  { word: 'CAKE', theme: 'food',    phonemes: ['long-a', 'silent-e'] },
  { word: 'MILK', theme: 'food',    phonemes: ['blend-lk', 'short-i'] },
];

const WORDS_HARD = [
  { word: 'APPLE', theme: 'fruit',   phonemes: ['short-a', 'double-consonant', 'silent-e'] },
  { word: 'PANDA', theme: 'animal',  phonemes: ['short-a', 'blend-nd'] },
  { word: 'HOUSE', theme: 'object',  phonemes: ['ou-diphthong', 'silent-e'] },
  { word: 'CLOUD', theme: 'weather', phonemes: ['blend-cl', 'ou-diphthong'] },
  { word: 'PIZZA', theme: 'food',    phonemes: ['double-consonant', 'short-a'] },
  { word: 'SHARK', theme: 'animal',  phonemes: ['digraph-sh', 'r-controlled'] },
  { word: 'TIGER', theme: 'animal',  phonemes: ['long-i', 'r-controlled'] },
  { word: 'EAGLE', theme: 'animal',  phonemes: ['ea-digraph', 'long-e', 'silent-e'] },
  { word: 'HORSE', theme: 'animal',  phonemes: ['r-controlled', 'silent-e'] },
  { word: 'BUNNY', theme: 'animal',  phonemes: ['short-u', 'double-consonant', 'silent-y'] },
  { word: 'OCEAN', theme: 'nature',  phonemes: ['long-o', 'ea-digraph'] },
  { word: 'RIVER', theme: 'nature',  phonemes: ['short-i', 'r-controlled'] },
  { word: 'STORM', theme: 'weather', phonemes: ['blend-st', 'r-controlled'] },
  { word: 'PLANT', theme: 'nature',  phonemes: ['blend-pl', 'blend-nt', 'short-a'] },
  { word: 'BEACH', theme: 'nature',  phonemes: ['ea-digraph', 'ch-digraph', 'long-e'] },
  { word: 'GRAPE', theme: 'fruit',   phonemes: ['blend-gr', 'long-a', 'silent-e'] },
  { word: 'LEMON', theme: 'fruit',   phonemes: ['short-e', 'short-o'] },
  { word: 'MANGO', theme: 'fruit',   phonemes: ['short-a', 'long-o'] },
  { word: 'FLAME', theme: 'nature',  phonemes: ['blend-fl', 'long-a', 'silent-e'] },
  { word: 'GLOBE', theme: 'object',  phonemes: ['blend-gl', 'long-o', 'silent-e'] },
];

function getWordsForDifficulty(d) {
  if (d === 'easy') return WORDS_EASY;
  if (d === 'hard') return WORDS_HARD;
  return WORDS_MED;
}

// Returns words prioritised by the child's weak phonemes (from letterErrors),
// sorted by spaced-repetition due date. Falls back to the full pool if no data.
function getAdaptiveWordPool(letterErrors, difficulty) {
  var allWords = [].concat(WORDS_EASY, WORDS_MED, WORDS_HARD, WORDS_XLHARD);
  if (!letterErrors || Object.keys(letterErrors).length < 3) {
    return getWordsForDifficulty(difficulty || 'med');
  }

  // Tally error counts per phoneme
  var phonemeCounts = {};
  Object.values(letterErrors).forEach(function(e) {
    // Look up the word's phonemes from the pool
    var wordEntry = allWords.find(function(w) { return w.word === e.word; });
    if (!wordEntry || !wordEntry.phonemes) return;
    wordEntry.phonemes.forEach(function(ph) {
      phonemeCounts[ph] = (phonemeCounts[ph] || 0) + (e.count || 1);
    });
  });

  // Top 3 weak phonemes
  var weakPhonemes = Object.keys(phonemeCounts)
    .sort(function(a, b) { return phonemeCounts[b] - phonemeCounts[a]; })
    .slice(0, 3);

  if (!weakPhonemes.length) return getWordsForDifficulty(difficulty || 'med');

  // Find words that practise weak phonemes, sorted by due date
  var today = new Date().toISOString().slice(0, 10);
  var matched = allWords.filter(function(w) {
    return w.phonemes && w.phonemes.some(function(ph) { return weakPhonemes.indexOf(ph) !== -1; });
  });

  // Sort: overdue/due-today first, then by phoneme match count descending
  matched.sort(function(a, b) {
    var keyA = Object.keys(letterErrors).find(function(k) { return k.startsWith(a.word + ':'); });
    var keyB = Object.keys(letterErrors).find(function(k) { return k.startsWith(b.word + ':'); });
    var dueA = keyA ? (letterErrors[keyA].dueDate || '9999') : '9999';
    var dueB = keyB ? (letterErrors[keyB].dueDate || '9999') : '9999';
    if (dueA <= today && dueB > today) return -1;
    if (dueB <= today && dueA > today) return 1;
    var matchA = (a.phonemes || []).filter(function(ph) { return weakPhonemes.indexOf(ph) !== -1; }).length;
    var matchB = (b.phonemes || []).filter(function(ph) { return weakPhonemes.indexOf(ph) !== -1; }).length;
    return matchB - matchA;
  });

  return matched.length ? matched : getWordsForDifficulty(difficulty || 'med');
}

window.WORDS_BY_LENGTH = { 3: WORDS_EASY, 4: WORDS_MED, 5: WORDS_HARD };

// Main journey + Code Lab. Chapters unlock in LEVELS order.
// Modes cycle: click → missing → drag → type → keyboard → missing → drag → boss
const LEVELS = [
  // ── Chapter 1: The Word Forest (easy, 3-letter CVC phonics) ─────────────
  { id: 1,  chapter: 1, mode: 'click',    word: 'CAT',   stars: 0, done: false, current: true  },
  { id: 2,  chapter: 1, mode: 'missing',  word: 'HAT',   stars: 0, done: false, locked: true  },
  { id: 3,  chapter: 1, mode: 'drag',     word: 'MAP',   stars: 0, done: false, locked: true  },
  { id: 4,  chapter: 1, mode: 'type',     word: 'PEN',   stars: 0, done: false, locked: true  },
  { id: 5,  chapter: 1, mode: 'keyboard', word: 'DOG',   stars: 0, done: false, locked: true  },
  { id: 6,  chapter: 1, mode: 'missing',  word: 'PIG',   stars: 0, done: false, locked: true  },
  { id: 7,  chapter: 1, mode: 'drag',     word: 'ANT',   stars: 0, done: false, locked: true  },
  { id: 8,  chapter: 1, mode: 'boss',     word: 'OWL',   stars: 0, done: false, locked: true  },
  // ── Chapter 2: The Word Sea (4-letter regular) ────────────────────────────
  { id: 9,  chapter: 2, mode: 'click',    word: 'FISH',  stars: 0, done: false, locked: true  },
  { id: 10, chapter: 2, mode: 'missing',  word: 'FROG',  stars: 0, done: false, locked: true  },
  { id: 11, chapter: 2, mode: 'drag',     word: 'DUCK',  stars: 0, done: false, locked: true  },
  { id: 12, chapter: 2, mode: 'type',     word: 'BIRD',  stars: 0, done: false, locked: true  },
  { id: 13, chapter: 2, mode: 'keyboard', word: 'RAIN',  stars: 0, done: false, locked: true  },
  { id: 14, chapter: 2, mode: 'missing',  word: 'SNOW',  stars: 0, done: false, locked: true  },
  { id: 15, chapter: 2, mode: 'drag',     word: 'CAKE',  stars: 0, done: false, locked: true  },
  { id: 16, chapter: 2, mode: 'boss',     word: 'MILK',  stars: 0, done: false, locked: true  },
  // ── Chapter 3: The Word Mountain (4-letter harder) ────────────────────────
  { id: 17, chapter: 3, mode: 'click',    word: 'BEAR',  stars: 0, done: false, locked: true  },
  { id: 18, chapter: 3, mode: 'missing',  word: 'WOLF',  stars: 0, done: false, locked: true  },
  { id: 19, chapter: 3, mode: 'drag',     word: 'DEER',  stars: 0, done: false, locked: true  },
  { id: 20, chapter: 3, mode: 'type',     word: 'KITE',  stars: 0, done: false, locked: true  },
  { id: 21, chapter: 3, mode: 'keyboard', word: 'WIND',  stars: 0, done: false, locked: true  },
  { id: 22, chapter: 3, mode: 'missing',  word: 'LEAF',  stars: 0, done: false, locked: true  },
  { id: 23, chapter: 3, mode: 'drag',     word: 'HILL',  stars: 0, done: false, locked: true  },
  { id: 24, chapter: 3, mode: 'boss',     word: 'MOON',  stars: 0, done: false, locked: true  },
  // ── Chapter 4: The Word Jungle (5-letter, steady step up) ────────────────
  { id: 25, chapter: 4, mode: 'scramble', word: 'APPLE', stars: 0, done: false, locked: true  },
  { id: 26, chapter: 4, mode: 'type',     word: 'SHARK', stars: 0, done: false, locked: true  },
  { id: 27, chapter: 4, mode: 'click',    word: 'TIGER', stars: 0, done: false, locked: true  },
  { id: 28, chapter: 4, mode: 'speed',    word: 'HORSE', stars: 0, done: false, locked: true  },
  { id: 29, chapter: 4, mode: 'drag',     word: 'GRAPE', stars: 0, done: false, locked: true  },
  { id: 30, chapter: 4, mode: 'missing',  word: 'BEACH', stars: 0, done: false, locked: true  },
  { id: 31, chapter: 4, mode: 'echo',     word: 'PLANT', stars: 0, done: false, locked: true  },
  { id: 32, chapter: 4, mode: 'boss',     word: 'RIVER', stars: 0, done: false, locked: true  },
  // ── Chapter 5: The Word Sky (5-letter harder) ────────────────────────────
  { id: 33, chapter: 5, mode: 'speed',    word: 'PANDA', stars: 0, done: false, locked: true  },
  { id: 34, chapter: 5, mode: 'click',    word: 'HOUSE', stars: 0, done: false, locked: true  },
  { id: 35, chapter: 5, mode: 'scramble', word: 'CLOUD', stars: 0, done: false, locked: true  },
  { id: 36, chapter: 5, mode: 'drag',     word: 'PIZZA', stars: 0, done: false, locked: true  },
  { id: 37, chapter: 5, mode: 'echo',     word: 'BUNNY', stars: 0, done: false, locked: true  },
  { id: 38, chapter: 5, mode: 'missing',  word: 'OCEAN', stars: 0, done: false, locked: true  },
  { id: 39, chapter: 5, mode: 'type',     word: 'STORM', stars: 0, done: false, locked: true  },
  { id: 40, chapter: 5, mode: 'boss',     word: 'EAGLE', stars: 0, done: false, locked: true  },
  // ── Chapter 6: The Word Castle (5→6 letter transition) ───────────────────
  { id: 41, chapter: 6, mode: 'flash',    word: 'LEMON',  stars: 0, done: false, locked: true  },
  { id: 42, chapter: 6, mode: 'click',    word: 'MANGO',  stars: 0, done: false, locked: true  },
  { id: 43, chapter: 6, mode: 'scramble', word: 'FLAME',  stars: 0, done: false, locked: true  },
  { id: 44, chapter: 6, mode: 'drag',     word: 'GLOBE',  stars: 0, done: false, locked: true  },
  { id: 45, chapter: 6, mode: 'echo',     word: 'RABBIT', stars: 0, done: false, locked: true  },
  { id: 46, chapter: 6, mode: 'type',     word: 'CASTLE', stars: 0, done: false, locked: true  },
  { id: 47, chapter: 6, mode: 'flash',    word: 'GARDEN', stars: 0, done: false, locked: true  },
  { id: 48, chapter: 6, mode: 'boss',     word: 'BRIDGE', stars: 0, done: false, locked: true  },
  // ── Chapter 7: The Word Galaxy (6-letter adventure) ──────────────────────
  { id: 49, chapter: 7, mode: 'echo',     word: 'FLOWER', stars: 0, done: false, locked: true  },
  { id: 50, chapter: 7, mode: 'flash',    word: 'SUMMER', stars: 0, done: false, locked: true  },
  { id: 51, chapter: 7, mode: 'scramble', word: 'ORANGE', stars: 0, done: false, locked: true  },
  { id: 52, chapter: 7, mode: 'type',     word: 'BUTTER', stars: 0, done: false, locked: true  },
  { id: 53, chapter: 7, mode: 'click',    word: 'ROCKET', stars: 0, done: false, locked: true  },
  { id: 54, chapter: 7, mode: 'flash',    word: 'WIZARD', stars: 0, done: false, locked: true  },
  { id: 55, chapter: 7, mode: 'echo',     word: 'DRAGON', stars: 0, done: false, locked: true  },
  { id: 56, chapter: 7, mode: 'boss',     word: 'PLANET', stars: 0, done: false, locked: true  },
  // ── Chapter 8: The Word Island (6-letter harder) ─────────────────────────
  { id: 57, chapter: 8, mode: 'speed',    word: 'PIRATE', stars: 0, done: false, locked: true  },
  { id: 58, chapter: 8, mode: 'click',    word: 'JUNGLE', stars: 0, done: false, locked: true  },
  { id: 59, chapter: 8, mode: 'scramble', word: 'MONKEY', stars: 0, done: false, locked: true  },
  { id: 60, chapter: 8, mode: 'drag',     word: 'TURTLE', stars: 0, done: false, locked: true  },
  { id: 61, chapter: 8, mode: 'echo',     word: 'PARROT', stars: 0, done: false, locked: true  },
  { id: 62, chapter: 8, mode: 'missing',  word: 'ISLAND', stars: 0, done: false, locked: true  },
  { id: 63, chapter: 8, mode: 'type',     word: 'SUNSET', stars: 0, done: false, locked: true  },
  { id: 64, chapter: 8, mode: 'boss',     word: 'FOREST', stars: 0, done: false, locked: true  },
  // ── Chapter 9: The Word Tower (6–7 letter endgame) ───────────────────────
  { id: 65, chapter: 9, mode: 'flash',    word: 'MIRROR',  stars: 0, done: false, locked: true  },
  { id: 66, chapter: 9, mode: 'click',    word: 'SPIDER',  stars: 0, done: false, locked: true  },
  { id: 67, chapter: 9, mode: 'scramble', word: 'SCHOOL',  stars: 0, done: false, locked: true  },
  { id: 68, chapter: 9, mode: 'drag',     word: 'KITTEN',  stars: 0, done: false, locked: true  },
  { id: 69, chapter: 9, mode: 'echo',     word: 'PENGUIN', stars: 0, done: false, locked: true  },
  { id: 70, chapter: 9, mode: 'missing',  word: 'LANTERN', stars: 0, done: false, locked: true  },
  { id: 71, chapter: 9, mode: 'type',     word: 'THUNDER', stars: 0, done: false, locked: true  },
  { id: 72, chapter: 9, mode: 'boss',     word: 'CRYSTAL', stars: 0, done: false, locked: true  },
  // ── Chapter 10: The Code Lab (sequence builder) ───────────────────────────
  { id: 73, chapter: 10, mode: 'coding',  word: 'L1',    stars: 0, done: false, locked: true  },
  { id: 74, chapter: 10, mode: 'coding',  word: 'L2',    stars: 0, done: false, locked: true  },
  { id: 75, chapter: 10, mode: 'coding',  word: 'L3',    stars: 0, done: false, locked: true  },
  { id: 76, chapter: 10, mode: 'coding',  word: 'L4',    stars: 0, done: false, locked: true  },
  { id: 77, chapter: 10, mode: 'coding',  word: 'L5',    stars: 0, done: false, locked: true  },
  { id: 78, chapter: 10, mode: 'coding',  word: 'L6',    stars: 0, done: false, locked: true  },
  { id: 79, chapter: 10, mode: 'coding',  word: 'L7',    stars: 0, done: false, locked: true  },
  { id: 80, chapter: 10, mode: 'coding',  word: 'L8',    stars: 0, done: false, locked: true  },
];

var WORDS_XLHARD = [
  { word: 'RABBIT', theme: 'animal',  phonemes: ['short-a', 'double-consonant'] },
  { word: 'GARDEN', theme: 'nature',  phonemes: ['r-controlled', 'blend-nd'] },
  { word: 'BRIDGE', theme: 'object',  phonemes: ['blend-br', 'digraph-dge'] },
  { word: 'CANDLE', theme: 'object',  phonemes: ['blend-nd', 'silent-e'] },
  { word: 'WINTER', theme: 'weather', phonemes: ['blend-nt', 'r-controlled'] },
  { word: 'CASTLE', theme: 'object',  phonemes: ['blend-st', 'silent-e'] },
  { word: 'CHEESE', theme: 'food',    phonemes: ['ch-digraph', 'long-e', 'double-vowel'] },
  { word: 'FLOWER', theme: 'nature',  phonemes: ['blend-fl', 'ow-diphthong', 'r-controlled'] },
  { word: 'SUMMER', theme: 'weather', phonemes: ['short-u', 'double-consonant', 'r-controlled'] },
  { word: 'ORANGE', theme: 'fruit',   phonemes: ['r-controlled', 'long-a', 'silent-e'] },
  { word: 'BUTTER', theme: 'food',    phonemes: ['short-u', 'double-consonant', 'r-controlled'] },
  { word: 'PLANET', theme: 'space',   phonemes: ['blend-pl', 'short-a', 'blend-nt'] },
  { word: 'ROCKET', theme: 'space',   phonemes: ['digraph-ck', 'short-o'] },
  { word: 'WIZARD', theme: 'fantasy', phonemes: ['short-i', 'r-controlled'] },
  { word: 'DRAGON', theme: 'fantasy', phonemes: ['blend-dr', 'short-a'] },
  { word: 'PIRATE', theme: 'fantasy', phonemes: ['long-i', 'r-controlled', 'silent-e'] },
  { word: 'JUNGLE', theme: 'nature',  phonemes: ['blend-ng', 'silent-e'] },
  { word: 'MONKEY', theme: 'animal',  phonemes: ['blend-nk', 'long-e', 'silent-y'] },
  { word: 'TURTLE', theme: 'animal',  phonemes: ['r-controlled', 'silent-e'] },
  { word: 'PARROT', theme: 'animal',  phonemes: ['r-controlled', 'double-consonant'] },
  { word: 'ISLAND', theme: 'nature',  phonemes: ['long-i', 'blend-nd'] },
  { word: 'SUNSET', theme: 'nature',  phonemes: ['short-u', 'blend-nd', 'blend-st'] },
  { word: 'FOREST', theme: 'nature',  phonemes: ['r-controlled', 'blend-st'] },
  { word: 'KITTEN', theme: 'animal',  phonemes: ['short-i', 'double-consonant'] },
  { word: 'MIRROR', theme: 'object',  phonemes: ['short-i', 'double-consonant', 'r-controlled'] },
  { word: 'SCHOOL', theme: 'object',  phonemes: ['digraph-sch', 'long-oo'] },
  { word: 'SPIDER', theme: 'animal',  phonemes: ['blend-sp', 'long-i', 'r-controlled'] },
  { word: 'TOWER',  theme: 'object',  phonemes: ['ow-diphthong', 'r-controlled'] },
  { word: 'SNAKE',  theme: 'animal',  phonemes: ['blend-sn', 'long-a', 'silent-e'] },
  { word: 'SWORD',  theme: 'fantasy', phonemes: ['blend-sw', 'r-controlled'] },
  { word: 'ZEBRA',  theme: 'animal',  phonemes: ['long-e', 'r-controlled'] },
  { word: 'PENGUIN', theme: 'animal', phonemes: ['blend-ng', 'short-i'] },
  { word: 'LANTERN', theme: 'object', phonemes: ['blend-nt', 'r-controlled'] },
  { word: 'THUNDER', theme: 'weather',phonemes: ['digraph-th', 'blend-nd', 'r-controlled'] },
  { word: 'CRYSTAL', theme: 'object', phonemes: ['blend-cr', 'blend-st', 'short-i'] },
];

// Spoken after a word is spelled — hearing the word in context turns
// spelling practice into vocabulary. Keep sentences short and concrete.
var WORD_SENTENCES = {
  CAT: 'The cat sat on the mat.',
  DOG: 'The dog wags its tail.',
  SUN: 'The sun is hot and bright.',
  BEE: 'A bee buzzes by the flower.',
  HAT: 'I put the hat on my head.',
  COW: 'The cow says moo.',
  PIG: 'The pig rolls in the mud.',
  OWL: 'The owl hoots at night.',
  ANT: 'A tiny ant carries a crumb.',
  HEN: 'The hen sits on her eggs.',
  EGG: 'The egg cracked open.',
  JAM: 'I spread jam on my toast.',
  CUP: 'My cup is full of juice.',
  BOX: 'The toy is inside the box.',
  NET: 'We catch fish with a net.',
  MAP: 'The map shows us the way.',
  PEN: 'I write with a blue pen.',
  KEY: 'The key opens the door.',
  JET: 'The jet flies very fast.',
  POT: 'Soup cooks in the pot.',
  FISH: 'The fish swims in the sea.',
  MOON: 'The moon glows at night.',
  STAR: 'I see a bright star in the sky.',
  FROG: 'The frog jumps on the log.',
  BIRD: 'The bird sings in the tree.',
  BEAR: 'The bear sleeps all winter.',
  CRAB: 'The crab walks on the sand.',
  DUCK: 'The duck swims in the pond.',
  WOLF: 'The wolf howls at the moon.',
  DEER: 'A deer ran through the trees.',
  KITE: 'My kite flies high in the wind.',
  RAIN: 'The rain falls on my umbrella.',
  SNOW: 'We made a man out of snow.',
  WIND: 'The wind blows the leaves around.',
  TREE: 'The bird built a nest in the tree.',
  LEAF: 'A green leaf fell from the branch.',
  LAKE: 'We swim in the lake in summer.',
  HILL: 'We rolled down the grassy hill.',
  CAKE: 'We ate cake at the party.',
  MILK: 'I drink milk with my breakfast.',
  APPLE: 'I ate a red apple for lunch.',
  PANDA: 'The panda munches on bamboo.',
  HOUSE: 'My house has a red door.',
  CLOUD: 'A fluffy cloud floats in the sky.',
  PIZZA: 'We shared a cheesy pizza.',
  SHARK: 'The shark has sharp teeth.',
  TIGER: 'The tiger has orange stripes.',
  EAGLE: 'The eagle soars above the mountains.',
  HORSE: 'The horse gallops in the field.',
  BUNNY: 'The bunny hops through the garden.',
  OCEAN: 'Whales live deep in the ocean.',
  RIVER: 'The river flows down to the sea.',
  STORM: 'The storm brought loud thunder.',
  PLANT: 'I water my plant every day.',
  BEACH: 'We built sandcastles at the beach.',
  GRAPE: 'A grape is small and sweet.',
  LEMON: 'The lemon is sour and yellow.',
  MANGO: 'The mango is juicy and sweet.',
  FLAME: 'The candle flame flickers.',
  GLOBE: 'I found our country on the globe.',
  RABBIT: 'The rabbit has long soft ears.',
  GARDEN: 'Flowers grow in the garden.',
  BRIDGE: 'We crossed the bridge over the river.',
  CANDLE: 'I blew out the candle on my cake.',
  WINTER: 'In winter we wear warm coats.',
  CASTLE: 'The king lives in a castle.',
  CHEESE: 'The mouse nibbled the cheese.',
  FLOWER: 'The flower smells lovely.',
  SUMMER: 'In summer we swim outside.',
  ORANGE: 'I peeled an orange for a snack.',
  BUTTER: 'I spread butter on warm bread.',
  PLANET: 'Earth is our home planet.',
  ROCKET: 'The rocket zoomed into space.',
  WIZARD: 'The wizard waved his magic wand.',
  DRAGON: 'The dragon breathes fire.',
  PIRATE: 'The pirate found buried treasure.',
  JUNGLE: 'Monkeys swing through the jungle.',
  MONKEY: 'The monkey eats a banana.',
  TURTLE: 'The turtle walks very slowly.',
  PARROT: 'The parrot can copy what I say.',
  ISLAND: 'The boat sailed to a small island.',
  SUNSET: 'The sunset turned the sky orange.',
  FOREST: 'Tall trees grow in the forest.',
  KITTEN: 'The kitten chases the ball of wool.',
  MIRROR: 'I see myself in the mirror.',
  SCHOOL: 'We learn to read at school.',
  SPIDER: 'The spider spins a silky web.',
  TOWER: 'The tower is very tall.',
  SNAKE: 'The snake slides through the grass.',
  SWORD: 'The knight raised his shiny sword.',
  ZEBRA: 'The zebra has black and white stripes.',
  PENGUIN: 'The penguin waddles on the ice.',
  LANTERN: 'The lantern lights up the dark.',
  THUNDER: 'Thunder boomed during the storm.',
  CRYSTAL: 'The crystal sparkled in the light.',
};
window.WORD_SENTENCES = WORD_SENTENCES;

var PET_SPECIES = [
  // ── Starters ───────────────────────────────────────────────────────
  { id: 'pebble', name: 'Pebble', type: 'Balanced', typeIcon: '💜',
    isStarter: true,  cost: 0, starterCost: 50,
    color: '#C7B4FF', bg: '#EDE4FF',
    shinyKey: 'happyDays', shinyTarget: 7, shinyLabel: '7 happy days in a row',
    tagline: "The companion who's always there for you.",
    unlockLevelId: 24 },
  { id: 'ember', name: 'Ember', type: 'Speed', typeIcon: '🔥',
    isStarter: true,  cost: 0, starterCost: 60,
    color: '#FF8C42', bg: '#FFE8D0',
    shinyKey: 'speedPlays', shinyTarget: 20, shinyLabel: '20 Speed mode plays',
    tagline: 'A fierce friend who loves a challenge.',
    unlockLevelId: 24 },
  { id: 'aqua', name: 'Aqua', type: 'Precision', typeIcon: '💧',
    isStarter: true,  cost: 0, starterCost: 70,
    color: '#38BDF8', bg: '#E0F7FF',
    shinyKey: 'precisionLevels', shinyTarget: 30, shinyLabel: '90%+ accuracy, 30 levels',
    tagline: 'Patient and wise — grows through care.',
    unlockLevelId: 24 },
  // ── Premium ────────────────────────────────────────────────────────
  { id: 'sprout', name: 'Sprout', type: 'Scholar', typeIcon: '🌿',
    isStarter: false, cost: 150, starterCost: null,
    color: '#4ADE80', bg: '#DCFCE7',
    shinyKey: 'uniqueLevelsDone', shinyTarget: 30, shinyLabel: '30 levels completed',
    tagline: 'Grows smarter with every new word.',
    unlockLevelId: 40 },
  { id: 'petal', name: 'Petal', type: 'Care', typeIcon: '🌸',
    isStarter: false, cost: 200, starterCost: null,
    color: '#F472B6', bg: '#FDF2F8',
    shinyKey: 'feedCount', shinyTarget: 15, shinyLabel: 'Feed your pet 15 times',
    tagline: 'Blooms brightest when you show it love.',
    unlockLevelId: 48 },
  { id: 'cosmo', name: 'Cosmo', type: 'Logic', typeIcon: '🌌',
    isStarter: false, cost: 250, starterCost: null,
    color: '#818CF8', bg: '#EEF2FF',
    shinyKey: null, shinyTarget: 3, shinyLabel: 'All Code Lab levels done',
    tagline: 'A logic-loving alien from beyond the stars.',
    unlockLevelId: null, unlockCodeLab: true },
  // ── Rare ───────────────────────────────────────────────────────────
  { id: 'blaze', name: 'Blaze', type: 'Wild', typeIcon: '⚡',
    isStarter: false, cost: 300, starterCost: null,
    color: '#FACC15', bg: '#FEF9C3',
    shinyKey: 'bossWins', shinyTarget: 5, shinyLabel: 'Beat 5 boss levels',
    tagline: 'Fast as lightning, twice as fun.',
    unlockLevelId: 32 },
  { id: 'frost', name: 'Frost', type: 'Cool', typeIcon: '❄️',
    isStarter: false, cost: 350, starterCost: null,
    color: '#7DD3FC', bg: '#E0F2FE',
    shinyKey: 'streakDays', shinyTarget: 14, shinyLabel: '14-day streak',
    tagline: 'Calm under pressure. Cool in every crisis.',
    unlockLevelId: 40 },
  { id: 'luna', name: 'Luna', type: 'Mystery', typeIcon: '🌙',
    isStarter: false, cost: 400, starterCost: null,
    color: '#C084FC', bg: '#F3E8FF',
    shinyKey: 'nightPlays', shinyTarget: 10, shinyLabel: 'Play after dark 10 times',
    tagline: 'A dreamy spirit who comes alive at night.',
    unlockLevelId: 56 },
  { id: 'rex', name: 'Rex', type: 'Fierce', typeIcon: '🦖',
    isStarter: false, cost: 500, starterCost: null,
    color: '#86EFAC', bg: '#DCFCE7',
    shinyKey: 'scramblePlays', shinyTarget: 25, shinyLabel: '25 Scramble plays',
    tagline: 'Tiny arms. Enormous attitude.',
    unlockLevelId: 48 },
];
window.PET_SPECIES = PET_SPECIES;

var PET_OUTFIT_ITEMS = [
  { id: 'pet-hat',      slot: 'hat',    name: 'Tiny Top Hat',    emoji: '🎩', price: 40 },
  { id: 'pet-crown',    slot: 'hat',    name: 'Mini Crown',      emoji: '👑', price: 60 },
  { id: 'pet-flower',   slot: 'hat',    name: 'Flower Wreath',   emoji: '🌸', price: 45 },
  { id: 'pet-beanie',   slot: 'hat',    name: 'Cozy Beanie',     emoji: '🧢', price: 30 },
  { id: 'pet-cowboy',   slot: 'hat',    name: 'Cowboy Hat',      emoji: '🤠', price: 50 },
  { id: 'pet-witch',    slot: 'hat',    name: 'Witch Hat',       emoji: '🧙', price: 55 },
  { id: 'pet-shades',   slot: 'shades', name: 'Cool Shades',     emoji: '🕶', price: 35 },
  { id: 'pet-monocle',  slot: 'shades', name: 'Fancy Monocle',   emoji: '🧐', price: 40 },
  { id: 'pet-goggles',  slot: 'shades', name: 'Swim Goggles',    emoji: '🥽', price: 30 },
  { id: 'pet-bow',      slot: 'bow',    name: 'Bow Tie',         emoji: '🎀', price: 25 },
  { id: 'pet-scarf',    slot: 'bow',    name: 'Cozy Scarf',      emoji: '🧣', price: 28 },
  { id: 'pet-tie',      slot: 'bow',    name: 'Smart Tie',       emoji: '👔', price: 32 },
  { id: 'pet-cape',     slot: 'cape',   name: 'Hero Cape',       emoji: '🦸', price: 55 },
  { id: 'pet-wings',    slot: 'cape',   name: 'Fairy Wings',     emoji: '🧚', price: 65 },
  { id: 'pet-backpack', slot: 'cape',   name: 'Mini Backpack',   emoji: '🎒', price: 48 },
];
window.PET_OUTFIT_ITEMS = PET_OUTFIT_ITEMS;
window.SHOP_ITEMS = PET_OUTFIT_ITEMS;

var PET_ROOMS = [
  { id: 'room-beach',      name: 'Beach Cove',        emoji: '🌴', price: 80,  bg: 'linear-gradient(135deg, #87CEEB, #F0E68C)' },
  { id: 'room-space',      name: 'Outer Space',        emoji: '🚀', price: 90,  bg: 'linear-gradient(135deg, #0D0D2B, #2D1B69)' },
  { id: 'room-forest',     name: 'Enchanted Forest',   emoji: '🌲', price: 75,  bg: 'linear-gradient(135deg, #228B22, #90EE90)' },
  { id: 'room-candy',      name: 'Candy Land',         emoji: '🍭', price: 85,  bg: 'linear-gradient(135deg, #FF69B4, #FFD1DC)' },
  { id: 'room-castle',     name: 'Royal Castle',       emoji: '🏰', price: 100, bg: 'linear-gradient(135deg, #B8860B, #DAA520)' },
  { id: 'room-underwater', name: 'Ocean Deep',         emoji: '🐠', price: 95,  bg: 'linear-gradient(135deg, #006994, #40E0D0)' },
  { id: 'room-volcano',    name: 'Volcano Peak',       emoji: '🌋', price: 110, bg: 'linear-gradient(135deg, #7F1D1D, #F97316)' },
  { id: 'room-arctic',     name: 'Arctic Tundra',      emoji: '❄️', price: 105, bg: 'linear-gradient(135deg, #BAE6FD, #E0F2FE)' },
  { id: 'room-jungle',     name: 'Dino Jungle',        emoji: '🦕', price: 95,  bg: 'linear-gradient(135deg, #14532D, #4ADE80)' },
  { id: 'room-cloud',      name: 'Cloud Kingdom',      emoji: '☁️', price: 90,  bg: 'linear-gradient(135deg, #BFDBFE, #F0F9FF)' },
  { id: 'room-haunted',    name: 'Haunted Mansion',    emoji: '👻', price: 115, bg: 'linear-gradient(135deg, #1C1917, #44403C)' },
  { id: 'room-rainbow',    name: 'Rainbow Valley',     emoji: '🌈', price: 120, bg: 'linear-gradient(135deg, #FDE68A, #C084FC)' },
];
window.PET_ROOMS = PET_ROOMS;

var PET_TOYS = [
  { id: 'toy-ball',     name: 'Bouncy Ball',    emoji: '🎾', price: 30 },
  { id: 'toy-chest',    name: 'Treasure Chest', emoji: '📦', price: 45 },
  { id: 'toy-rainbow',  name: 'Rainbow Arc',    emoji: '🌈', price: 50 },
  { id: 'toy-star',     name: 'Glowing Star',   emoji: '⭐', price: 35 },
  { id: 'toy-drum',     name: 'Tiny Drum',      emoji: '🥁', price: 40 },
  { id: 'toy-book',     name: 'Spell Book',     emoji: '📖', price: 40 },
  { id: 'toy-rocket',   name: 'Toy Rocket',     emoji: '🚀', price: 55 },
  { id: 'toy-wand',     name: 'Magic Wand',     emoji: '🪄', price: 48 },
  { id: 'toy-kite',     name: 'Colourful Kite', emoji: '🪁', price: 35 },
  { id: 'toy-robot',    name: 'Mini Robot',     emoji: '🤖', price: 60 },
  { id: 'toy-bubble',   name: 'Bubble Wand',    emoji: '🫧', price: 30 },
  { id: 'toy-pinwheel', name: 'Pinwheel',       emoji: '🌀', price: 25 },
  { id: 'toy-telescope',name: 'Telescope',      emoji: '🔭', price: 65 },
  { id: 'toy-dinosaur', name: 'Dino Figure',    emoji: '🦕', price: 45 },
];
window.PET_TOYS = PET_TOYS;

var PET_TREATS = [
  { id: 'treat-berry',    name: 'Magic Berry',     emoji: '🫐', price: 12, moodBoost: 30, coinBonus: 0,  feedBonus: 0 },
  { id: 'treat-cake',     name: 'Birthday Cake',   emoji: '🎂', price: 20, moodBoost: 50, coinBonus: 0,  feedBonus: 0, sparkle: true },
  { id: 'treat-cookie',   name: 'Star Cookie',     emoji: '🍪', price: 15, moodBoost: 30, coinBonus: 5,  feedBonus: 0 },
  { id: 'treat-candy',    name: 'Rainbow Candy',   emoji: '🍬', price: 18, moodBoost: 40, coinBonus: 0,  feedBonus: 0 },
  { id: 'treat-apple',    name: 'Golden Apple',    emoji: '🍎', price: 25, moodBoost: 50, coinBonus: 0,  feedBonus: 1 },
  { id: 'treat-honey',    name: 'Honey Pot',       emoji: '🍯', price: 22, moodBoost: 45, coinBonus: 0,  feedBonus: 0 },
  { id: 'treat-cupcake',  name: 'Sparkle Cupcake', emoji: '🧁', price: 16, moodBoost: 35, coinBonus: 0,  feedBonus: 0, sparkle: true },
  { id: 'treat-donut',    name: 'Rainbow Donut',   emoji: '🍩', price: 14, moodBoost: 30, coinBonus: 0,  feedBonus: 0 },
  { id: 'treat-lollipop', name: 'Giant Lollipop',  emoji: '🍭', price: 18, moodBoost: 40, coinBonus: 0,  feedBonus: 0 },
  { id: 'treat-popcorn',  name: 'Magic Popcorn',   emoji: '🍿', price: 10, moodBoost: 20, coinBonus: 8,  feedBonus: 0 },
  { id: 'treat-mango',    name: 'Tropical Mango',  emoji: '🥭', price: 20, moodBoost: 45, coinBonus: 0,  feedBonus: 1 },
  { id: 'treat-star',     name: 'Shooting Star',   emoji: '🌟', price: 30, moodBoost: 60, coinBonus: 10, feedBonus: 0, sparkle: true },
];
window.PET_TREATS = PET_TREATS;

var AVATAR_ITEMS = [
  { id: 'av-hat-party',    name: 'Party Hat',      emoji: '🎉', price: 30,  slot: 'head' },
  { id: 'av-hat-wizard',   name: 'Wizard Hat',     emoji: '🧙', price: 50,  slot: 'head' },
  { id: 'av-hat-crown',    name: 'Gold Crown',     emoji: '👑', price: 70,  slot: 'head' },
  { id: 'av-hat-cowboy',   name: 'Cowboy Hat',     emoji: '🤠', price: 45,  slot: 'head' },
  { id: 'av-hat-ninja',    name: 'Ninja Mask',     emoji: '🥷', price: 55,  slot: 'head' },
  { id: 'av-hat-viking',   name: 'Viking Helmet',  emoji: '⚔️', price: 65,  slot: 'head' },
  { id: 'av-hat-astro',    name: 'Astronaut Helm', emoji: '👨‍🚀', price: 80,  slot: 'head' },
  { id: 'av-badge-star',   name: 'Star Badge',     emoji: '⭐', price: 25,  slot: 'badge' },
  { id: 'av-badge-fire',   name: 'Fire Badge',     emoji: '🔥', price: 35,  slot: 'badge' },
  { id: 'av-badge-rainbow',name: 'Rainbow Badge',  emoji: '🌈', price: 45,  slot: 'badge' },
  { id: 'av-badge-bolt',   name: 'Lightning Bolt', emoji: '⚡', price: 40,  slot: 'badge' },
  { id: 'av-badge-dino',   name: 'Dino Badge',     emoji: '🦖', price: 50,  slot: 'badge' },
  { id: 'av-badge-gem',    name: 'Gem Badge',      emoji: '💎', price: 60,  slot: 'badge' },
  { id: 'av-badge-rocket', name: 'Rocket Badge',   emoji: '🚀', price: 55,  slot: 'badge' },
];
window.AVATAR_ITEMS = AVATAR_ITEMS;

var POWER_UPS = [
  { id: 'pu-hint',    name: 'Hint Token',     emoji: '💡', price: 15, desc: 'Highlights the next correct letter during a level' },
  { id: 'pu-shield',  name: 'Streak Shield',  emoji: '🛡️', price: 40, desc: 'Protects your streak if you miss a day' },
  { id: 'pu-x2',      name: 'Coin Booster',   emoji: '✨', price: 35, desc: '2× coins on your next completed level' },
  { id: 'pu-star',    name: 'Star Booster',   emoji: '🌟', price: 50, desc: 'Guarantees at least 2 stars on your next level' },
  { id: 'pu-skip',    name: 'Level Skip',     emoji: '⏭️', price: 60, desc: 'Skip a level and keep your progress' },
  { id: 'pu-time',    name: 'Time Freeze',    emoji: '⏸️', price: 45, desc: 'Pauses the timer on Speed mode levels' },
  { id: 'pu-magnet',  name: 'Coin Magnet',    emoji: '🧲', price: 55, desc: 'Doubles coins for the next 3 levels' },
  { id: 'pu-rainbow', name: 'Rainbow Run',    emoji: '🌈', price: 70, desc: 'Every letter tile glows — makes any mode easier' },
];
window.POWER_UPS = POWER_UPS;

var CHAPTER_META = [
  { id: 1, name: 'The Word Forest',  theme: 'animal/object',  bg: 'linear-gradient(180deg, #D7F5E8 0%, #E3EAFF 100%)', emoji: '🌳' },
  { id: 2, name: 'The Word Sea',     theme: 'nature/weather', bg: 'linear-gradient(180deg, #E3EAFF 0%, #FFF6EA 100%)', emoji: '🌊' },
  { id: 3, name: 'The Word Mountain',theme: 'animals/food',   bg: 'linear-gradient(180deg, #FFF6EA 0%, #EDE4FF 100%)', emoji: '⛰️' },
  { id: 4, name: 'The Word Jungle',  theme: 'mixed',          bg: 'linear-gradient(180deg, #E0F7E9 0%, #D7F0FF 100%)', emoji: '🌿' },
  { id: 5, name: 'The Word Sky',     theme: 'nature/animals', bg: 'linear-gradient(180deg, #D7F0FF 0%, #E8E0FF 100%)', emoji: '☁️' },
  { id: 6, name: 'The Word Castle',  theme: 'objects/nature', bg: 'linear-gradient(180deg, #E8E0FF 0%, #FFE8F0 100%)', emoji: '🏰' },
  { id: 7, name: 'The Word Galaxy',  theme: 'fantasy/space',  bg: 'linear-gradient(180deg, #1A1A3E 0%, #2D1B69 100%)', emoji: '🚀', dark: true },
  { id: 8, name: 'The Word Island',  theme: 'adventure',      bg: 'linear-gradient(180deg, #D7F0FF 0%, #D7F5E8 100%)', emoji: '🏝️' },
  { id: 9, name: 'The Word Tower',   theme: 'challenge',      bg: 'linear-gradient(180deg, #EDE4FF 0%, #FFF6EA 100%)', emoji: '🗼' },
  { id: 10, name: 'The Code Lab',    theme: 'coding',         bg: 'linear-gradient(180deg, #D7F5E8 0%, #E3EAFF 100%)', emoji: '🤖' },
];

const MODE_META = {
  click:    { label: 'Click',    color: 'blue',  ink: 'var(--blue-ink)',  soft: 'var(--blue-soft)',  icon: '◉' },
  drag:     { label: 'Drag',     color: 'pink',  ink: 'var(--pink-ink)',  soft: 'var(--pink-soft)',  icon: '↔' },
  type:     { label: 'Type',     color: 'coral', ink: 'var(--coral-ink)', soft: 'var(--coral-soft)', icon: '⌨' },
  missing:  { label: 'Missing',  color: 'mint',  ink: 'var(--mint-ink)',  soft: 'var(--mint-soft)',  icon: '_' },
  keyboard: { label: 'Sequence', color: 'lilac', ink: 'var(--lilac-ink)', soft: 'var(--lilac-soft)', icon: '⌘' },
  boss:     { label: 'Boss',     color: 'coral', ink: 'var(--coral-ink)', soft: 'var(--coral-soft)', icon: '★' },
};
// Must be on window before the per-mode extensions below — without Babel's
// const→var downleveling, a top-level const is not a window property.
window.MODE_META = MODE_META;

var PRECISION_TASKS = [
  { id: 'p1', mode: 'precision', word: 'GO',  stars: 0, done: false },
  { id: 'p2', mode: 'precision', word: 'UP',  stars: 0, done: false },
  { id: 'p3', mode: 'precision', word: 'FLY', stars: 0, done: false },
];
window.PRECISION_TASKS = PRECISION_TASKS;

window.MODE_META['precision'] = {
  label: 'Precision', color: 'coral', ink: '#fff', soft: 'rgba(255,160,122,0.15)', icon: '🎯'
};
window.MODE_META['scramble'] = {
  label: 'Scramble', color: 'yellow', ink: 'var(--yellow-ink)', soft: 'var(--yellow-soft)', icon: '🔀'
};
window.MODE_META['speed'] = {
  label: 'Speed', color: 'coral', ink: 'var(--coral-ink)', soft: 'var(--coral-soft)', icon: '⏱'
};
window.MODE_META['echo'] = {
  label: 'Listen', color: 'lilac', ink: 'var(--lilac-ink)', soft: 'var(--lilac-soft)', icon: '👂'
};
window.MODE_META['flash'] = {
  label: 'Flash', color: 'yellow', ink: 'var(--yellow-ink)', soft: 'var(--yellow-soft)', icon: '⚡'
};
window.MODE_META['coding'] = {
  label: 'Code', color: 'mint', ink: 'var(--mint-ink)', soft: 'var(--mint-soft)', icon: '🤖'
};
window.MODE_META['math'] = {
  label: 'Math', color: 'mint', ink: 'var(--mint-ink)', soft: 'var(--mint-soft)', icon: '➕'
};
window.MODE_META['pizza'] = {
  label: 'Pizza', color: 'yellow', ink: 'var(--yellow-ink)', soft: 'var(--yellow-soft)', icon: '🍕'
};
window.MODE_META['song'] = {
  label: 'Song', color: 'blue', ink: 'var(--blue-ink)', soft: 'var(--blue-soft)', icon: '🎵'
};
window.MODE_META['rhyme'] = {
  label: 'Rhyme', color: 'pink', ink: 'var(--pink-ink)', soft: 'var(--pink-soft)', icon: '🎵'
};
window.MODE_META['picture'] = {
  label: 'Picture', color: 'lilac', ink: 'var(--lilac-ink)', soft: 'var(--lilac-soft)', icon: '🖼️'
};
window.MODE_META['wordorder'] = {
  label: 'Word Order', color: 'mint', ink: 'var(--mint-ink)', soft: 'var(--mint-soft)', icon: '📝'
};
window.MODE_META['race'] = {
  label: 'Race', color: 'coral', ink: 'var(--coral-ink)', soft: 'var(--coral-soft)', icon: '🏁'
};
window.MODE_META['volcano'] = {
  label: 'Volcano', color: 'coral', ink: 'var(--coral-ink)', soft: 'var(--coral-soft)', icon: '🌋'
};
window.MODE_META['safari'] = {
  label: 'Safari', color: 'gold', ink: 'var(--gold-dark)', soft: 'var(--gold-soft)', icon: '🦁'
};
window.MODE_META['story'] = {
  label: 'Story', color: 'violet', ink: 'var(--violet)', soft: 'var(--violet-soft)', icon: '📖'
};
window.MODE_META['detective'] = {
  label: 'Detective', color: 'blue', ink: 'var(--blue-ink)', soft: 'var(--blue-soft)', icon: '🔍'
};
window.MODE_META['memory'] = {
  label: 'Memory', color: 'pink', ink: 'var(--pink-ink)', soft: 'var(--pink-soft)', icon: '🃏'
};
window.MODE_META['soup'] = {
  label: 'Soup', color: 'mint', ink: 'var(--mint-ink)', soft: 'var(--mint-soft)', icon: '🍲'
};

Object.assign(window, { WORDS_EASY, WORDS_MED, WORDS_HARD, WORDS_XLHARD, getWordsForDifficulty, getAdaptiveWordPool, LEVELS, CHAPTER_META, MODE_META, PRECISION_TASKS, PET_SPECIES, PET_OUTFIT_ITEMS, PET_ROOMS, PET_TOYS, PET_TREATS, AVATAR_ITEMS, POWER_UPS });

function getDailyChallenge(dateStr, letterErrors) {
  // Check for parent-injected custom word (clears after reading)
  var profileId = window.__currentProfileId || 'p0';
  var customKey = 'spelloop-custom-word-' + profileId;
  var customWord = localStorage.getItem(customKey);
  if (customWord) {
    localStorage.removeItem(customKey);
    return { word: customWord, mode: 'click' };
  }

  // If enough error data exists, pick from adaptive pool (due or weak-phoneme word)
  if (letterErrors && Object.keys(letterErrors).length >= 3) {
    var adaptive = getAdaptiveWordPool(letterErrors, 'med');
    var today = new Date().toISOString().slice(0, 10);
    var overdue = adaptive.filter(function(w) {
      var key = Object.keys(letterErrors).find(function(k) { return k.startsWith(w.word + ':') && (letterErrors[k].dueDate || '9999') <= today; });
      return !!key;
    });
    var candidate = overdue.length ? overdue[0] : adaptive[0];
    if (candidate) {
      var modes = ['click', 'missing', 'type', 'echo', 'flash'];
      var hash = 0;
      for (var ci = 0; ci < dateStr.length; ci++) hash = (hash * 31 + dateStr.charCodeAt(ci)) & 0xFFFFFF;
      return { word: candidate.word, mode: modes[hash % modes.length] };
    }
  }

  // Default: deterministic hash pick from level pool
  var hash = 0;
  for (var i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) & 0xFFFFFF;
  }
  var pool = window.LEVELS
    ? window.LEVELS.filter(function(l) { return l.mode !== 'boss' && l.mode !== 'coding'; })
    : [];
  if (!pool.length) return null;
  var picked = pool[hash % pool.length];
  return { word: picked.word, mode: picked.mode };
}
window.getDailyChallenge = getDailyChallenge;

var WORD_HINTS = {
  CAT:'🐱', DOG:'🐶', SUN:'☀️', BEE:'🐝', HAT:'🎩', COW:'🐄', PIG:'🐷', OWL:'🦉',
  ANT:'🐜', HEN:'🐔', EGG:'🥚', JAM:'🍓', CUP:'☕', BOX:'📦', NET:'🥅', MAP:'🗺️',
  PEN:'✏️', KEY:'🔑', JET:'✈️', POT:'🪴',
  FISH:'🐟', MOON:'🌙', STAR:'⭐', FROG:'🐸', BIRD:'🐦', BEAR:'🐻', CRAB:'🦀',
  DUCK:'🦆', WOLF:'🐺', DEER:'🦌', KITE:'🪁', RAIN:'🌧️', SNOW:'❄️', WIND:'💨',
  TREE:'🌳', LEAF:'🍃', LAKE:'🏞️', HILL:'⛰️', CAKE:'🎂', MILK:'🥛', CORN:'🌽',
  BEAN:'🫘', RICE:'🍚', PEAR:'🍐', PLUM:'🍑', FERN:'🌿', ROSE:'🌹', DOVE:'🕊️',
  LION:'🦁', SLUG:'🐌', TOAD:'🐸', WORM:'🪱',
  APPLE:'🍎', HOUSE:'🏠', CLOUD:'☁️', TIGER:'🐯', EAGLE:'🦅', HORSE:'🐴',
  BUNNY:'🐰', STORM:'⛈️', PIZZA:'🍕', LEMON:'🍋', GRAPE:'🍇', SHEEP:'🐑',
  FLAME:'🔥', GLOBE:'🌍', PIANO:'🎹', ROBOT:'🤖', SHARK:'🦈',
  SNAKE:'🐍', SWORD:'⚔️', TOWER:'🗼', ZEBRA:'🦓',
  RABBIT:'🐰', BRIDGE:'🌉', CASTLE:'🏰', CHEESE:'🧀', FOREST:'🌲', GARDEN:'🌸',
  ISLAND:'🏝️', JUNGLE:'🌴', KITTEN:'🐱', MIRROR:'🪞', PLANET:'🪐', ROCKET:'🚀',
  SCHOOL:'🏫', SPIDER:'🕷️', SUNSET:'🌅', TURTLE:'🐢', WINTER:'❄️',
  DRAGON:'🐲', FLOWER:'🌺', MONKEY:'🐒', PARROT:'🦜', PIRATE:'🏴‍☠️', OCEAN:'🌊',
  PENGUIN:'🐧', LANTERN:'🏮', THUNDER:'⚡', CRYSTAL:'💎',
  BEACH:'🏖️', PLANT:'🌱', RIVER:'🏞️',
};
window.WORD_HINTS = WORD_HINTS;
