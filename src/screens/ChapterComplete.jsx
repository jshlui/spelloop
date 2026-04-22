// ChapterComplete — story postcard shown after each chapter boss level

var CHAPTER_STORIES = [
  {
    chapter: 1,
    title: "The Forest Gate",
    blurb: "Deep in the Word Forest, you found an ancient gate covered in glowing letters. You spelled the magic word and the gate creaked open!",
    bg: "#2D6A4F", sky: "#52B788", accent: "#F59E0B",
    scene: function() {
      return React.createElement('svg', { viewBox: '0 0 320 180', width: '100%' },
        // Sky
        React.createElement('rect', { x: 0, y: 0, width: 320, height: 100, fill: '#52B788' }),
        // Ground
        React.createElement('rect', { x: 0, y: 100, width: 320, height: 80, fill: '#2D6A4F' }),
        // Trees
        React.createElement('ellipse', { cx: 50, cy: 85, rx: 30, ry: 40, fill: '#1B4332' }),
        React.createElement('ellipse', { cx: 270, cy: 80, rx: 30, ry: 45, fill: '#1B4332' }),
        React.createElement('ellipse', { cx: 90, cy: 90, rx: 22, ry: 30, fill: '#40916C' }),
        React.createElement('ellipse', { cx: 240, cy: 88, rx: 22, ry: 32, fill: '#40916C' }),
        // Gate
        React.createElement('rect', { x: 130, y: 50, width: 60, height: 80, rx: 8, fill: '#92400E', opacity: 0.9 }),
        React.createElement('rect', { x: 120, y: 48, width: 80, height: 8, rx: 4, fill: '#78350F' }),
        React.createElement('circle', { cx: 160, cy: 90, r: 6, fill: '#F59E0B' }),
        // Stars on gate
        React.createElement('text', { x: 143, y: 75, fontSize: 12, fill: '#FCD34D', textAnchor: 'middle' }, '★'),
        React.createElement('text', { x: 177, y: 75, fontSize: 12, fill: '#FCD34D', textAnchor: 'middle' }, '★'),
        // Sun
        React.createElement('circle', { cx: 270, cy: 30, r: 20, fill: '#FCD34D' }),
      );
    }
  },
  {
    chapter: 2,
    title: "The Word Sea",
    blurb: "You dove beneath the sparkling Word Sea and discovered a sunken library full of spell-books. A magical kite led you safely to shore!",
    bg: "#1E3A5F", sky: "#0EA5E9", accent: "#38BDF8",
    scene: function() {
      return React.createElement('svg', { viewBox: '0 0 320 180', width: '100%' },
        React.createElement('rect', { x: 0, y: 0, width: 320, height: 90, fill: '#0EA5E9' }),
        React.createElement('rect', { x: 0, y: 90, width: 320, height: 90, fill: '#1E3A5F' }),
        // Waves
        React.createElement('ellipse', { cx: 80, cy: 90, rx: 80, ry: 15, fill: '#38BDF8', opacity: 0.5 }),
        React.createElement('ellipse', { cx: 240, cy: 90, rx: 80, ry: 15, fill: '#38BDF8', opacity: 0.5 }),
        // Fish
        React.createElement('ellipse', { cx: 100, cy: 130, rx: 20, ry: 12, fill: '#F59E0B' }),
        React.createElement('polygon', { points: '120,130 135,120 135,140', fill: '#F59E0B' }),
        React.createElement('circle', { cx: 95, cy: 127, r: 3, fill: '#1E3A5F' }),
        // Kite in sky
        React.createElement('polygon', { points: '220,20 240,45 220,70 200,45', fill: '#EF4444' }),
        React.createElement('line', { x1: 220, y1: 70, x2: 220, y2: 88, stroke: '#78350F', strokeWidth: 1.5 }),
        // Clouds
        React.createElement('ellipse', { cx: 60, cy: 25, rx: 30, ry: 15, fill: 'white', opacity: 0.8 }),
        React.createElement('ellipse', { cx: 80, cy: 20, rx: 25, ry: 14, fill: 'white', opacity: 0.8 }),
      );
    }
  },
  {
    chapter: 3,
    title: "The Mountain Peak",
    blurb: "You climbed the tallest mountain in the land of words, where an eagle soared above ancient stone carvings. You read every one!",
    bg: "#374151", sky: "#6B7280", accent: "#E5E7EB",
    scene: function() {
      return React.createElement('svg', { viewBox: '0 0 320 180', width: '100%' },
        React.createElement('rect', { x: 0, y: 0, width: 320, height: 180, fill: '#93C5FD' }),
        // Mountains
        React.createElement('polygon', { points: '0,180 80,60 160,180', fill: '#4B5563' }),
        React.createElement('polygon', { points: '80,180 180,40 280,180', fill: '#374151' }),
        React.createElement('polygon', { points: '180,180 280,80 320,180', fill: '#6B7280' }),
        // Snow caps
        React.createElement('polygon', { points: '80,60 100,90 60,90', fill: 'white' }),
        React.createElement('polygon', { points: '180,40 205,80 155,80', fill: 'white' }),
        // Eagle
        React.createElement('ellipse', { cx: 200, cy: 50, rx: 18, ry: 8, fill: '#78350F' }),
        React.createElement('polygon', { points: '185,48 200,38 215,48', fill: '#92400E' }),
        React.createElement('circle', { cx: 215, cy: 47, r: 4, fill: '#78350F' }),
      );
    }
  },
  {
    chapter: 4,
    title: "The Jungle Path",
    blurb: "Through the tangled jungle, a clever deer showed you a hidden path made entirely of letters. You followed every twist and turn!",
    bg: "#14532D", sky: "#16A34A", accent: "#86EFAC",
    scene: function() {
      return React.createElement('svg', { viewBox: '0 0 320 180', width: '100%' },
        React.createElement('rect', { x: 0, y: 0, width: 320, height: 180, fill: '#16A34A' }),
        // Vines/leaves
        React.createElement('ellipse', { cx: 30, cy: 60, rx: 35, ry: 50, fill: '#14532D' }),
        React.createElement('ellipse', { cx: 290, cy: 70, rx: 35, ry: 50, fill: '#14532D' }),
        React.createElement('ellipse', { cx: 70, cy: 40, rx: 30, ry: 35, fill: '#166534' }),
        React.createElement('ellipse', { cx: 250, cy: 45, rx: 30, ry: 35, fill: '#166534' }),
        // Path
        React.createElement('ellipse', { cx: 160, cy: 155, rx: 80, ry: 15, fill: '#F59E0B', opacity: 0.7 }),
        // Deer body
        React.createElement('ellipse', { cx: 160, cy: 120, rx: 25, ry: 18, fill: '#92400E' }),
        React.createElement('circle', { cx: 178, cy: 108, r: 12, fill: '#92400E' }),
        // Deer legs
        React.createElement('rect', { x: 142, y: 134, width: 6, height: 20, rx: 3, fill: '#78350F' }),
        React.createElement('rect', { x: 154, y: 134, width: 6, height: 22, rx: 3, fill: '#78350F' }),
        React.createElement('rect', { x: 166, y: 134, width: 6, height: 20, rx: 3, fill: '#78350F' }),
        React.createElement('rect', { x: 178, y: 134, width: 6, height: 22, rx: 3, fill: '#78350F' }),
        // Antlers
        React.createElement('line', { x1: 174, y1: 98, x2: 168, y2: 82, stroke: '#78350F', strokeWidth: 3 }),
        React.createElement('line', { x1: 168, y1: 82, x2: 162, y2: 74, stroke: '#78350F', strokeWidth: 2 }),
        React.createElement('line', { x1: 168, y1: 82, x2: 176, y2: 75, stroke: '#78350F', strokeWidth: 2 }),
        React.createElement('line', { x1: 184, y1: 98, x2: 190, y2: 82, stroke: '#78350F', strokeWidth: 3 }),
        React.createElement('line', { x1: 190, y1: 82, x2: 184, y2: 74, stroke: '#78350F', strokeWidth: 2 }),
        React.createElement('line', { x1: 190, y1: 82, x2: 198, y2: 75, stroke: '#78350F', strokeWidth: 2 }),
      );
    }
  },
  {
    chapter: 5,
    title: "Beyond the Ocean",
    blurb: "You sailed across the great Word Ocean on a boat made of letters, guided by the stars. The distant shore held an incredible secret!",
    bg: "#1E3A5F", sky: "#0C4A6E", accent: "#38BDF8",
    scene: function() {
      return React.createElement('svg', { viewBox: '0 0 320 180', width: '100%' },
        // Night sky
        React.createElement('rect', { x: 0, y: 0, width: 320, height: 180, fill: '#0C4A6E' }),
        // Stars
        React.createElement('circle', { cx: 40, cy: 20, r: 2, fill: 'white' }),
        React.createElement('circle', { cx: 100, cy: 15, r: 1.5, fill: 'white' }),
        React.createElement('circle', { cx: 200, cy: 25, r: 2, fill: 'white' }),
        React.createElement('circle', { cx: 260, cy: 10, r: 1.5, fill: 'white' }),
        React.createElement('circle', { cx: 300, cy: 30, r: 2, fill: 'white' }),
        React.createElement('circle', { cx: 150, cy: 8, r: 1, fill: 'white' }),
        // Moon
        React.createElement('circle', { cx: 50, cy: 40, r: 22, fill: '#FCD34D' }),
        React.createElement('circle', { cx: 58, cy: 34, r: 18, fill: '#0C4A6E' }),
        // Ocean
        React.createElement('rect', { x: 0, y: 110, width: 320, height: 70, fill: '#1E3A5F' }),
        React.createElement('ellipse', { cx: 80, cy: 110, rx: 80, ry: 10, fill: '#38BDF8', opacity: 0.3 }),
        React.createElement('ellipse', { cx: 240, cy: 110, rx: 80, ry: 10, fill: '#38BDF8', opacity: 0.3 }),
        // Boat hull
        React.createElement('ellipse', { cx: 160, cy: 118, rx: 50, ry: 14, fill: '#92400E' }),
        // Sail
        React.createElement('rect', { x: 158, y: 70, width: 3, height: 48, fill: '#78350F' }),
        React.createElement('polygon', { points: '161,72 161,108 210,95', fill: 'white', opacity: 0.9 }),
      );
    }
  },
  {
    chapter: 6,
    title: "The Word Castle",
    blurb: "You reached the magnificent Word Castle, where every tower was built from a different letter. You unlocked the great hall with your spelling!",
    bg: "#3730A3", sky: "#4338CA", accent: "#818CF8",
    scene: function() {
      return React.createElement('svg', { viewBox: '0 0 320 180', width: '100%' },
        // Sky
        React.createElement('rect', { x: 0, y: 0, width: 320, height: 180, fill: '#4338CA' }),
        // Castle base
        React.createElement('rect', { x: 80, y: 100, width: 160, height: 80, fill: '#6366F1' }),
        // Towers
        React.createElement('rect', { x: 70, y: 70, width: 40, height: 110, fill: '#4F46E5' }),
        React.createElement('rect', { x: 210, y: 70, width: 40, height: 110, fill: '#4F46E5' }),
        React.createElement('rect', { x: 130, y: 55, width: 60, height: 125, fill: '#4338CA' }),
        // Battlements
        React.createElement('rect', { x: 70, y: 62, width: 8, height: 12, fill: '#4F46E5' }),
        React.createElement('rect', { x: 84, y: 62, width: 8, height: 12, fill: '#4F46E5' }),
        React.createElement('rect', { x: 98, y: 62, width: 8, height: 12, fill: '#4F46E5' }),
        React.createElement('rect', { x: 210, y: 62, width: 8, height: 12, fill: '#4F46E5' }),
        React.createElement('rect', { x: 224, y: 62, width: 8, height: 12, fill: '#4F46E5' }),
        React.createElement('rect', { x: 238, y: 62, width: 8, height: 12, fill: '#4F46E5' }),
        React.createElement('rect', { x: 130, y: 47, width: 8, height: 12, fill: '#4338CA' }),
        React.createElement('rect', { x: 146, y: 47, width: 8, height: 12, fill: '#4338CA' }),
        React.createElement('rect', { x: 162, y: 47, width: 8, height: 12, fill: '#4338CA' }),
        React.createElement('rect', { x: 178, y: 47, width: 8, height: 12, fill: '#4338CA' }),
        // Gate
        React.createElement('rect', { x: 143, y: 128, width: 34, height: 52, rx: 17, fill: '#1E1B4B' }),
        React.createElement('circle', { cx: 158, cy: 148, r: 4, fill: '#F59E0B' }),
        // Windows with stars
        React.createElement('circle', { cx: 87, cy: 98, r: 8, fill: '#818CF8' }),
        React.createElement('circle', { cx: 233, cy: 98, r: 8, fill: '#818CF8' }),
        React.createElement('text', { x: 87, y: 102, fontSize: 9, fill: '#FCD34D', textAnchor: 'middle' }, '★'),
        React.createElement('text', { x: 233, y: 102, fontSize: 9, fill: '#FCD34D', textAnchor: 'middle' }, '★'),
        // Flag
        React.createElement('rect', { x: 159, y: 30, width: 2, height: 20, fill: '#C7D2FE' }),
        React.createElement('polygon', { points: '161,30 161,42 175,36', fill: '#F59E0B' }),
      );
    }
  },
  {
    chapter: 7,
    title: "The Word Galaxy",
    blurb: "You soared through the Word Galaxy, where planets were made of letters and dragons flew between the stars. You spelled your way home!",
    bg: "#0F172A", sky: "#1E1B4B", accent: "#818CF8",
    scene: function() {
      return React.createElement('svg', { viewBox: '0 0 320 180', width: '100%' },
        // Space
        React.createElement('rect', { x: 0, y: 0, width: 320, height: 180, fill: '#0F172A' }),
        // Stars
        ...[...Array(20)].map(function(_, i) {
          var x = (i * 53 + 17) % 320;
          var y = (i * 37 + 11) % 180;
          return React.createElement('circle', { key: i, cx: x, cy: y, r: i % 3 === 0 ? 2 : 1, fill: 'white', opacity: 0.6 + (i % 4) * 0.1 });
        }),
        // Planet 1
        React.createElement('circle', { cx: 60, cy: 60, r: 28, fill: '#7C3AED' }),
        React.createElement('ellipse', { cx: 60, cy: 60, rx: 42, ry: 10, fill: 'none', stroke: '#A78BFA', strokeWidth: 3, opacity: 0.7 }),
        // Planet 2 (smaller)
        React.createElement('circle', { cx: 240, cy: 100, r: 18, fill: '#1D4ED8' }),
        // Dragon simplified
        React.createElement('ellipse', { cx: 165, cy: 110, rx: 30, ry: 14, fill: '#16A34A' }),
        React.createElement('circle', { cx: 192, cy: 102, r: 12, fill: '#16A34A' }),
        React.createElement('polygon', { points: '190,92 198,80 204,94', fill: '#15803D' }),
        React.createElement('circle', { cx: 196, cy: 100, r: 3, fill: '#FCD34D' }),
        // Wings
        React.createElement('polygon', { points: '155,108 130,88 148,115', fill: '#14532D', opacity: 0.9 }),
        React.createElement('polygon', { points: '175,108 200,88 182,115', fill: '#14532D', opacity: 0.9 }),
        // Nebula glow
        React.createElement('ellipse', { cx: 160, cy: 90, rx: 60, ry: 40, fill: '#7C3AED', opacity: 0.1 }),
      );
    }
  },
];
window.CHAPTER_STORIES = CHAPTER_STORIES;

function ChapterComplete({ chapter, onNext }) {
  var story = CHAPTER_STORIES[chapter - 1];
  if (!story) { onNext(); return null; }

  var [spoken, setSpoken] = React.useState(false);

  React.useEffect(function() {
    if (!spoken && window.speechSynthesis) {
      var u = new SpeechSynthesisUtterance(story.blurb);
      u.rate = 0.85;
      u.pitch = 1.05;
      u.lang = 'en-AU';
      window.speechSynthesis.cancel();
      setTimeout(function() { window.speechSynthesis.speak(u); }, 600);
      setSpoken(true);
    }
    return function() { window.speechSynthesis && window.speechSynthesis.cancel(); };
  }, []);

  return React.createElement('div', {
    style: {
      position: 'fixed', inset: 0,
      background: story.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 800, padding: 24,
      animation: 'juicePop 500ms cubic-bezier(0.34,1.1,0.64,1)',
    }
  },
    // Chapter label
    React.createElement('div', { style: {
      fontFamily: "'Fredoka','Nunito',sans-serif",
      fontWeight: 900, fontSize: 13, letterSpacing: 2,
      color: story.accent, textTransform: 'uppercase', marginBottom: 8, opacity: 0.9,
    }}, 'Chapter ' + chapter + ' Complete!'),

    // Title
    React.createElement('div', { style: {
      fontFamily: "'Fredoka','Nunito',sans-serif",
      fontWeight: 900, fontSize: 32, color: 'white',
      marginBottom: 16, textAlign: 'center', lineHeight: 1.1,
    }}, story.title),

    // SVG scene card
    React.createElement('div', { style: {
      width: '100%', maxWidth: 360,
      borderRadius: 20, overflow: 'hidden',
      boxShadow: '0 8px 0 rgba(0,0,0,0.3), 0 20px 60px rgba(0,0,0,0.4)',
      marginBottom: 20,
    }}, story.scene()),

    // Story blurb
    React.createElement('div', { style: {
      maxWidth: 320, textAlign: 'center',
      fontFamily: "'Nunito',sans-serif", fontWeight: 700,
      fontSize: 15, color: 'rgba(255,255,255,0.9)',
      lineHeight: 1.5, marginBottom: 28,
    }}, story.blurb),

    // Next button
    React.createElement('button', {
      onClick: onNext,
      style: {
        background: story.accent,
        color: '#0F172A',
        fontFamily: "'Fredoka','Nunito',sans-serif",
        fontWeight: 900, fontSize: 18,
        padding: '14px 40px', borderRadius: 999,
        border: 'none', cursor: 'pointer',
        boxShadow: '0 5px 0 rgba(0,0,0,0.25)',
      }
    }, 'Next →')
  );
}
window.ChapterComplete = ChapterComplete;
