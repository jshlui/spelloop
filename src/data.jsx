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

window.WORDS_BY_LENGTH = { 3: WORDS_EASY, 4: WORDS_MED, 5: WORDS_HARD };

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
  // ── Chapter 4: The Word Jungle (mixed 3-4 letter, harder modes) ──────────
  { id: 25, chapter: 4, mode: 'scramble', word: 'BEE',  stars: 0, done: false, locked: true  },
  { id: 26, chapter: 4, mode: 'type',     word: 'RAIN', stars: 0, done: false, locked: true  },
  { id: 27, chapter: 4, mode: 'click',    word: 'HEN',  stars: 0, done: false, locked: true  },
  { id: 28, chapter: 4, mode: 'speed',    word: 'SNOW', stars: 0, done: false, locked: true  },
  { id: 29, chapter: 4, mode: 'drag',     word: 'CUP',  stars: 0, done: false, locked: true  },
  { id: 30, chapter: 4, mode: 'missing',  word: 'WOLF', stars: 0, done: false, locked: true  },
  { id: 31, chapter: 4, mode: 'echo',     word: 'EGG',  stars: 0, done: false, locked: true  },
  { id: 32, chapter: 4, mode: 'boss',     word: 'DEER', stars: 0, done: false, locked: true  },
  // ── Chapter 5: The Word Sky (4-5 letter, echo + speed) ───────────────────
  { id: 33, chapter: 5, mode: 'speed',    word: 'CRAB',  stars: 0, done: false, locked: true  },
  { id: 34, chapter: 5, mode: 'click',    word: 'HORSE', stars: 0, done: false, locked: true  },
  { id: 35, chapter: 5, mode: 'scramble', word: 'TREE',  stars: 0, done: false, locked: true  },
  { id: 36, chapter: 5, mode: 'drag',     word: 'BUNNY', stars: 0, done: false, locked: true  },
  { id: 37, chapter: 5, mode: 'echo',     word: 'LAKE',  stars: 0, done: false, locked: true  },
  { id: 38, chapter: 5, mode: 'missing',  word: 'GRAPE', stars: 0, done: false, locked: true  },
  { id: 39, chapter: 5, mode: 'type',     word: 'STORM', stars: 0, done: false, locked: true  },
  { id: 40, chapter: 5, mode: 'boss',     word: 'OCEAN', stars: 0, done: false, locked: true  },
  // ── Chapter 6: The Word Castle (5-6 letter, flash introduced) ────────────
  { id: 41, chapter: 6, mode: 'flash',    word: 'LEMON',  stars: 0, done: false, locked: true  },
  { id: 42, chapter: 6, mode: 'click',    word: 'RABBIT', stars: 0, done: false, locked: true  },
  { id: 43, chapter: 6, mode: 'scramble', word: 'GARDEN', stars: 0, done: false, locked: true  },
  { id: 44, chapter: 6, mode: 'drag',     word: 'BRIDGE', stars: 0, done: false, locked: true  },
  { id: 45, chapter: 6, mode: 'echo',     word: 'CANDLE', stars: 0, done: false, locked: true  },
  { id: 46, chapter: 6, mode: 'type',     word: 'WINTER', stars: 0, done: false, locked: true  },
  { id: 47, chapter: 6, mode: 'flash',    word: 'CASTLE', stars: 0, done: false, locked: true  },
  { id: 48, chapter: 6, mode: 'boss',     word: 'CHEESE', stars: 0, done: false, locked: true  },
  // ── Chapter 7: The Word Galaxy (6-letter, bonus, all modes) ──────────────
  { id: 49, chapter: 7, mode: 'echo',     word: 'FLOWER', stars: 0, done: false, locked: true  },
  { id: 50, chapter: 7, mode: 'flash',    word: 'SUMMER', stars: 0, done: false, locked: true  },
  { id: 51, chapter: 7, mode: 'scramble', word: 'ORANGE', stars: 0, done: false, locked: true  },
  { id: 52, chapter: 7, mode: 'type',     word: 'BUTTER', stars: 0, done: false, locked: true  },
  { id: 53, chapter: 7, mode: 'click',    word: 'PLANET', stars: 0, done: false, locked: true  },
  { id: 54, chapter: 7, mode: 'flash',    word: 'ROCKET', stars: 0, done: false, locked: true  },
  { id: 55, chapter: 7, mode: 'echo',     word: 'WIZARD', stars: 0, done: false, locked: true  },
  { id: 56, chapter: 7, mode: 'boss',     word: 'DRAGON', stars: 0, done: false, locked: true  },
  // ── Chapter 8: The Code Lab (sequence builder) ────────────────────────────
  { id: 57, chapter: 8, mode: 'coding',  word: 'L1',    stars: 0, done: false },
  { id: 58, chapter: 8, mode: 'coding',  word: 'L2',    stars: 0, done: false, locked: true  },
  { id: 59, chapter: 8, mode: 'coding',  word: 'L3',    stars: 0, done: false, locked: true  },
];

var WORDS_XLHARD = [
  { word: 'RABBIT', theme: 'animal' }, { word: 'GARDEN', theme: 'nature' },
  { word: 'BRIDGE', theme: 'object' }, { word: 'CANDLE', theme: 'object' },
  { word: 'WINTER', theme: 'weather' },{ word: 'CASTLE', theme: 'object' },
  { word: 'CHEESE', theme: 'food' },   { word: 'FLOWER', theme: 'nature' },
  { word: 'SUMMER', theme: 'weather' },{ word: 'ORANGE', theme: 'fruit' },
  { word: 'BUTTER', theme: 'food' },   { word: 'PLANET', theme: 'space' },
  { word: 'ROCKET', theme: 'space' },  { word: 'WIZARD', theme: 'fantasy' },
  { word: 'DRAGON', theme: 'fantasy' },{ word: 'PIRATE', theme: 'fantasy' },
  { word: 'JUNGLE', theme: 'nature' }, { word: 'MONKEY', theme: 'animal' },
  { word: 'TURTLE', theme: 'animal' }, { word: 'PARROT', theme: 'animal' },
];

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
  { id: 8, name: 'The Code Lab',     theme: 'coding',         bg: 'linear-gradient(180deg, #D7F5E8 0%, #E3EAFF 100%)', emoji: '🤖' },
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

Object.assign(window, { WORDS_EASY, WORDS_MED, WORDS_HARD, WORDS_XLHARD, getWordsForDifficulty, LEVELS, CHAPTER_META, MODE_META, PRECISION_TASKS, PET_SPECIES, PET_OUTFIT_ITEMS, PET_ROOMS, PET_TOYS, PET_TREATS, AVATAR_ITEMS, POWER_UPS });

function getDailyChallenge(dateStr) {
  // Check for parent-injected custom word (clears after reading)
  var profileId = window.__currentProfileId || 'p0';
  var customKey = 'spelloop-custom-word-' + profileId;
  var customWord = localStorage.getItem(customKey);
  if (customWord) {
    localStorage.removeItem(customKey);
    // Use click mode for custom words (most accessible)
    return { word: customWord, mode: 'click' };
  }
  // Simple numeric hash of dateStr for a deterministic daily pick
  var hash = 0;
  for (var i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) & 0xFFFFFF;
  }
  // Pick from non-boss, non-coding levels only
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
  DRAGON:'🐲', FLOWER:'🌺', PARROT:'🦜', OCEAN:'🌊',
};
window.WORD_HINTS = WORD_HINTS;
