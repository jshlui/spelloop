// Multi-species pet system — 6 species × 4 stages + shiny overlay

function getCompletedChapters(levels) {
  var groups = {};
  (levels || []).forEach(function(l) {
    var ch = l.chapter;
    if (!ch || l.mode === 'coding') return;
    if (!groups[ch]) groups[ch] = { total: 0, done: 0 };
    groups[ch].total++;
    if (l.done) groups[ch].done++;
  });
  return Object.keys(groups).filter(function(ch) {
    return groups[ch].done === groups[ch].total;
  }).map(Number);
}

function getPetStage(completedChapters, isShiny) {
  var done = completedChapters || [];
  if (done.includes(5)) return isShiny ? 'shiny' : 'adult';
  if (done.includes(3)) return 'kid';
  if (done.includes(1)) return 'baby';
  return 'egg';
}

var PET_GROWTH_THRESHOLDS = { baby: 2, kid: 6, adult: 12 };

function getPetStageFromGrowth(growthPoints, isShiny) {
  var points = Math.max(0, growthPoints || 0);
  if (points >= PET_GROWTH_THRESHOLDS.adult) return isShiny ? 'shiny' : 'adult';
  if (points >= PET_GROWTH_THRESHOLDS.kid) return 'kid';
  if (points >= PET_GROWTH_THRESHOLDS.baby) return 'baby';
  return 'egg';
}

function getPetNextGrowthStage(growthPoints) {
  var points = Math.max(0, growthPoints || 0);
  if (points < PET_GROWTH_THRESHOLDS.baby) {
    return { stage: 'baby', target: PET_GROWTH_THRESHOLDS.baby, label: 'Earn ' + (PET_GROWTH_THRESHOLDS.baby - points) + ' more growth points to hatch!' };
  }
  if (points < PET_GROWTH_THRESHOLDS.kid) {
    return { stage: 'kid', target: PET_GROWTH_THRESHOLDS.kid, label: 'Earn ' + (PET_GROWTH_THRESHOLDS.kid - points) + ' more growth points to reach Kid.' };
  }
  if (points < PET_GROWTH_THRESHOLDS.adult) {
    return { stage: 'adult', target: PET_GROWTH_THRESHOLDS.adult, label: 'Earn ' + (PET_GROWTH_THRESHOLDS.adult - points) + ' more growth points to reach Adult.' };
  }
  return { stage: null, target: PET_GROWTH_THRESHOLDS.adult, label: 'Fully grown!' };
}

function getPetGrowthProgress(growthPoints) {
  var points = Math.max(0, growthPoints || 0);
  var next = getPetNextGrowthStage(points);
  return {
    points: points,
    target: next.target,
    label: next.label,
    percent: Math.min(100, points / PET_GROWTH_THRESHOLDS.adult * 100),
  };
}

function getPetMoodLabel(mood) {
  var m = mood == null ? 80 : mood;
  if (m >= 70) return 'happy';
  if (m >= 40) return 'neutral';
  if (m >= 10) return 'hungry';
  return 'sleeping';
}

function getPetNextStage(completedChapters) {
  var done = completedChapters || [];
  if (!done.includes(1)) return { chapter: 1, label: 'Complete Chapter 1 to hatch!' };
  if (!done.includes(3)) return { chapter: 3, label: 'Complete Chapter 3 to grow!' };
  if (!done.includes(5)) return { chapter: 5, label: 'Complete Chapter 5 to evolve!' };
  return { chapter: null, label: 'Fully evolved! 🎉' };
}

var PET_MOOD_COLORS = {
  happy:   { bar: 'var(--mint)',  text: 'var(--mint-ink)',  label: '😄 Happy'    },
  neutral: { bar: 'var(--blue)',  text: 'var(--blue-ink)',  label: '😐 Content'  },
  hungry:  { bar: 'var(--coral)', text: 'var(--coral-ink)', label: '😢 Hungry'   },
  sleeping:{ bar: 'var(--lilac)', text: 'var(--lilac-ink)', label: '😴 Sleeping' },
};

// ── Shared face expression ────────────────────────────────────────
function PetFace({ mood, cx, cy, s }) {
  s = s || 1;
  var ml = getPetMoodLabel(mood);

  if (ml === 'sleeping') return (
    <g>
      <path d={'M'+(cx-14*s)+' '+(cy)+' Q'+(cx-10*s)+' '+(cy-7*s)+' '+(cx-6*s)+' '+cy}
        stroke="#2D1B69" strokeWidth={2.2*s} fill="none" strokeLinecap="round"/>
      <path d={'M'+(cx+6*s)+' '+(cy)+' Q'+(cx+10*s)+' '+(cy-7*s)+' '+(cx+14*s)+' '+cy}
        stroke="#2D1B69" strokeWidth={2.2*s} fill="none" strokeLinecap="round"/>
    </g>
  );

  if (ml === 'hungry') return (
    <g>
      <circle cx={cx-10*s} cy={cy} r={7*s} fill="white"/>
      <circle cx={cx+10*s} cy={cy} r={7*s} fill="white"/>
      <circle cx={cx-10*s} cy={(cy+2*s)} r={4*s} fill="#2D1B69"/>
      <circle cx={cx+10*s} cy={(cy+2*s)} r={4*s} fill="#2D1B69"/>
      <path d={'M'+(cx-15*s)+' '+(cy-9*s)+' Q'+(cx-10*s)+' '+(cy-13*s)+' '+(cx-5*s)+' '+(cy-8*s)}
        stroke="#2D1B69" strokeWidth={1.5*s} fill="none" strokeLinecap="round"/>
      <path d={'M'+(cx+5*s)+' '+(cy-8*s)+' Q'+(cx+10*s)+' '+(cy-13*s)+' '+(cx+15*s)+' '+(cy-9*s)}
        stroke="#2D1B69" strokeWidth={1.5*s} fill="none" strokeLinecap="round"/>
      <path d={'M'+(cx-9*s)+' '+(cy+12*s)+' Q'+(cx)+' '+(cy+8*s)+' '+(cx+9*s)+' '+(cy+12*s)}
        stroke="#2D1B69" strokeWidth={2*s} fill="none" strokeLinecap="round"/>
    </g>
  );

  if (ml === 'happy') return (
    <g>
      <path d={'M'+(cx-16*s)+' '+cy+' Q'+(cx-10*s)+' '+(cy-9*s)+' '+(cx-4*s)+' '+cy}
        stroke="#2D1B69" strokeWidth={2.5*s} fill="none" strokeLinecap="round"/>
      <path d={'M'+(cx+4*s)+' '+cy+' Q'+(cx+10*s)+' '+(cy-9*s)+' '+(cx+16*s)+' '+cy}
        stroke="#2D1B69" strokeWidth={2.5*s} fill="none" strokeLinecap="round"/>
      <circle cx={cx-8*s} cy={(cy-7*s)} r={1.5*s} fill="#FFD166"/>
      <circle cx={cx+8*s} cy={(cy-7*s)} r={1.5*s} fill="#FFD166"/>
      <path d={'M'+(cx-10*s)+' '+(cy+10*s)+' Q'+cx+' '+(cy+19*s)+' '+(cx+10*s)+' '+(cy+10*s)}
        stroke="#2D1B69" strokeWidth={2.5*s} fill="none" strokeLinecap="round"/>
      <circle cx={cx-16*s} cy={(cy+8*s)} r={6*s} fill="#FF9ECD" opacity="0.35"/>
      <circle cx={cx+16*s} cy={(cy+8*s)} r={6*s} fill="#FF9ECD" opacity="0.35"/>
    </g>
  );

  return (
    <g>
      <circle cx={cx-10*s} cy={cy} r={6*s} fill="white"/>
      <circle cx={cx+10*s} cy={cy} r={6*s} fill="white"/>
      <circle cx={cx-10*s} cy={cy} r={3.5*s} fill="#2D1B69"/>
      <circle cx={cx+10*s} cy={cy} r={3.5*s} fill="#2D1B69"/>
      <circle cx={(cx-8.5*s)} cy={(cy-1.5*s)} r={1*s} fill="white"/>
      <circle cx={(cx+11.5*s)} cy={(cy-1.5*s)} r={1*s} fill="white"/>
      <path d={'M'+(cx-7*s)+' '+(cy+10*s)+' Q'+cx+' '+(cy+14*s)+' '+(cx+7*s)+' '+(cy+10*s)}
        stroke="#2D1B69" strokeWidth={2*s} fill="none" strokeLinecap="round"/>
    </g>
  );
}

// ── PEBBLE (existing) ─────────────────────────────────────────────
function PetEggSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="54" rx="30" ry="38" fill="#FFF6EA" stroke="#FFD166" strokeWidth="3"/>
      <ellipse cx="38" cy="33" rx="7" ry="10" fill="white" opacity="0.7" transform="rotate(-15 38 33)"/>
      <circle cx="62" cy="42" r="5" fill="#FFD166" opacity="0.5"/>
      <circle cx="37" cy="65" r="4" fill="#FF9ECD" opacity="0.5"/>
      <circle cx="64" cy="68" r="3.5" fill="#8EE3C3" opacity="0.5"/>
      <circle cx="42" cy="40" r="3" fill="#C7B4FF" opacity="0.5"/>
    </svg>
  );
}

function PetBabySVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="78" rx="18" ry="12" fill="#C7B4FF"/>
      <ellipse cx="24" cy="28" rx="9" ry="13" fill="#C7B4FF"/>
      <ellipse cx="24" cy="28" rx="5" ry="8" fill="#FF9ECD" opacity="0.7"/>
      <ellipse cx="76" cy="28" rx="9" ry="13" fill="#C7B4FF"/>
      <ellipse cx="76" cy="28" rx="5" ry="8" fill="#FF9ECD" opacity="0.7"/>
      <circle cx="50" cy="50" r="30" fill="#C7B4FF"/>
      <ellipse cx="50" cy="80" rx="12" ry="8" fill="#EDE4FF" opacity="0.75"/>
      <PetFace mood={mood} cx={50} cy={48} s={0.85}/>
    </svg>
  );
}

function PetKidSVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="78" rx="22" ry="18" fill="#C7B4FF"/>
      <ellipse cx="22" cy="68" rx="9" ry="6" fill="#C7B4FF" transform="rotate(-30 22 68)"/>
      <ellipse cx="78" cy="68" rx="9" ry="6" fill="#C7B4FF" transform="rotate(30 78 68)"/>
      <ellipse cx="22" cy="25" rx="10" ry="14" fill="#C7B4FF"/>
      <ellipse cx="22" cy="25" rx="6" ry="9" fill="#FF9ECD" opacity="0.7"/>
      <ellipse cx="78" cy="25" rx="10" ry="14" fill="#C7B4FF"/>
      <ellipse cx="78" cy="25" rx="6" ry="9" fill="#FF9ECD" opacity="0.7"/>
      <circle cx="50" cy="46" r="33" fill="#C7B4FF"/>
      <ellipse cx="50" cy="82" rx="15" ry="10" fill="#EDE4FF" opacity="0.8"/>
      <PetFace mood={mood} cx={50} cy={44} s={1}/>
    </svg>
  );
}

function PetAdultSVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="85" cy="82" rx="10" ry="7" fill="#B8A0FF" transform="rotate(20 85 82)"/>
      <ellipse cx="89" cy="75" rx="6" ry="4" fill="#C7B4FF" transform="rotate(20 89 75)"/>
      <ellipse cx="50" cy="77" rx="26" ry="20" fill="#C7B4FF"/>
      <ellipse cx="17" cy="66" rx="10" ry="7" fill="#C7B4FF" transform="rotate(-35 17 66)"/>
      <ellipse cx="83" cy="66" rx="10" ry="7" fill="#C7B4FF" transform="rotate(35 83 66)"/>
      <circle cx="13" cy="73" r="6" fill="#B8A0FF"/>
      <circle cx="87" cy="73" r="6" fill="#B8A0FF"/>
      <ellipse cx="20" cy="22" rx="11" ry="16" fill="#C7B4FF"/>
      <ellipse cx="20" cy="22" rx="6" ry="10" fill="#FF9ECD" opacity="0.7"/>
      <ellipse cx="80" cy="22" rx="11" ry="16" fill="#C7B4FF"/>
      <ellipse cx="80" cy="22" rx="6" ry="10" fill="#FF9ECD" opacity="0.7"/>
      <circle cx="50" cy="43" r="35" fill="#C7B4FF"/>
      <ellipse cx="50" cy="81" rx="18" ry="13" fill="#EDE4FF" opacity="0.8"/>
      <text x="50" y="86" textAnchor="middle" fontSize="11" fill="#C7B4FF" fontWeight="900">✦</text>
      <PetFace mood={mood} cx={50} cy={41} s={1.1}/>
    </svg>
  );
}

// ── EMBER (orange/red — Speed) ─────────────────────────────────────
function EmberEggSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="55" rx="29" ry="37" fill="#FFE8D0" stroke="#FF8C42" strokeWidth="3"/>
      <line x1="42" y1="30" x2="44" y2="44" stroke="#FF8C42" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
      <line x1="55" y1="28" x2="57" y2="42" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
      <line x1="48" y1="26" x2="50" y2="40" stroke="#FF8C42" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <ellipse cx="50" cy="18" rx="6" ry="10" fill="#FF8C42" opacity="0.9"/>
      <ellipse cx="50" cy="14" rx="3" ry="6" fill="#FFD166"/>
      <circle cx="36" cy="60" r="4" fill="#FF8C42" opacity="0.35"/>
      <circle cx="66" cy="50" r="3" fill="#FFD166" opacity="0.45"/>
    </svg>
  );
}

function EmberBabySVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="78" rx="16" ry="10" fill="#FF8C42"/>
      <polygon points="22,52 15,35 30,42" fill="#FF8C42"/>
      <polygon points="78,52 85,35 70,42" fill="#FF8C42"/>
      <circle cx="50" cy="50" r="29" fill="#FF8C42"/>
      <ellipse cx="50" cy="79" rx="11" ry="7" fill="#FFE8D0" opacity="0.7"/>
      <ellipse cx="50" cy="78" rx="7" ry="5" fill="#FF8C42" opacity="0.6"/>
      <ellipse cx="50" cy="24" rx="5" ry="7" fill="#FF8C42"/>
      <ellipse cx="50" cy="20" rx="3" ry="5" fill="#FFD166"/>
      <PetFace mood={mood} cx={50} cy={50} s={0.82}/>
      <circle cx="33" cy="58" r="5" fill="#FFD166" opacity="0.3"/>
      <circle cx="67" cy="58" r="5" fill="#FFD166" opacity="0.3"/>
    </svg>
  );
}

function EmberKidSVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="78" rx="22" ry="17" fill="#FF8C42"/>
      <polygon points="14,60 5,30 25,48" fill="#FF8C42"/>
      <polygon points="86,60 95,30 75,48" fill="#FF8C42"/>
      <ellipse cx="22" cy="68" rx="9" ry="6" fill="#FF8C42" transform="rotate(-25 22 68)"/>
      <ellipse cx="78" cy="68" rx="9" ry="6" fill="#FF8C42" transform="rotate(25 78 68)"/>
      <circle cx="50" cy="46" r="32" fill="#FF8C42"/>
      <ellipse cx="50" cy="82" rx="15" ry="9" fill="#FFE8D0" opacity="0.75"/>
      <path d="M38,18 L44,28 L50,16 L56,28 L62,18" fill="#FF6B00" stroke="#FF6B00" strokeWidth="1" strokeLinejoin="round"/>
      <ellipse cx="50" cy="14" rx="6" ry="5" fill="#FFD166"/>
      <PetFace mood={mood} cx={50} cy={44} s={1}/>
      <ellipse cx="35" cy="54" rx="5" ry="3" fill="#FFD166" opacity="0.35"/>
      <ellipse cx="65" cy="54" rx="5" ry="3" fill="#FFD166" opacity="0.35"/>
    </svg>
  );
}

function EmberAdultSVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="77" rx="26" ry="20" fill="#FF8C42"/>
      <polygon points="5,65 -5,25 22,50" fill="#FF8C42"/>
      <polygon points="95,65 105,25 78,50" fill="#FF8C42"/>
      <ellipse cx="14" cy="62" rx="12" ry="8" fill="#FF6B00" transform="rotate(-40 14 62)"/>
      <ellipse cx="86" cy="62" rx="12" ry="8" fill="#FF6B00" transform="rotate(40 86 62)"/>
      <ellipse cx="20" cy="22" rx="11" ry="15" fill="#FF8C42"/>
      <ellipse cx="80" cy="22" rx="11" ry="15" fill="#FF8C42"/>
      <circle cx="50" cy="43" r="34" fill="#FF8C42"/>
      <ellipse cx="50" cy="81" rx="18" ry="12" fill="#FFE8D0" opacity="0.75"/>
      <path d="M30,14 L37,26 L44,12 L50,24 L56,12 L63,26 L70,14" fill="#FF6B00" stroke="none"/>
      <ellipse cx="50" cy="10" rx="8" ry="6" fill="#FFD166"/>
      <PetFace mood={mood} cx={50} cy={41} s={1.1}/>
      <circle cx="32" cy="53" r="6" fill="#FFD166" opacity="0.4"/>
      <circle cx="68" cy="53" r="6" fill="#FFD166" opacity="0.4"/>
    </svg>
  );
}

// ── AQUA (cyan/teal — Precision) ─────────────────────────────────
function AquaEggSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="54" rx="30" ry="37" fill="#E0F7FF" stroke="#38BDF8" strokeWidth="2.5"/>
      <ellipse cx="50" cy="54" rx="28" ry="35" fill="none" stroke="#38BDF8" strokeWidth="1" opacity="0.3"/>
      <circle cx="38" cy="42" r="7" fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="62" cy="58" r="5" fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.5"/>
      <circle cx="42" cy="65" r="4" fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.4"/>
      <ellipse cx="50" cy="54" rx="30" ry="37" fill="none" stroke="white" strokeWidth="6" opacity="0.25"/>
      <circle cx="35" cy="35" r="3" fill="white" opacity="0.6"/>
      <circle cx="62" cy="30" r="2" fill="white" opacity="0.5"/>
    </svg>
  );
}

function AquaBabySVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="78" rx="16" ry="10" fill="#38BDF8"/>
      <ellipse cx="22" cy="32" rx="10" ry="7" fill="#38BDF8" transform="rotate(-20 22 32)"/>
      <ellipse cx="78" cy="32" rx="10" ry="7" fill="#38BDF8" transform="rotate(20 78 32)"/>
      <circle cx="50" cy="50" r="29" fill="#38BDF8"/>
      <ellipse cx="50" cy="79" rx="11" ry="7" fill="#E0F7FF" opacity="0.75"/>
      <path d="M35,62 L50,70 L65,62" fill="#38BDF8" stroke="none" opacity="0.5"/>
      <path d="M35,62 Q50,68 65,62" fill="none" stroke="#0EA5E9" strokeWidth="2"/>
      <PetFace mood={mood} cx={50} cy={49} s={0.82}/>
      <circle cx="33" cy="57" r="4" fill="#7DD3FC" opacity="0.5"/>
      <circle cx="67" cy="57" r="4" fill="#7DD3FC" opacity="0.5"/>
      <circle cx="35" cy="38" r="2" fill="white" opacity="0.8"/>
      <circle cx="67" cy="36" r="2" fill="white" opacity="0.8"/>
    </svg>
  );
}

function AquaKidSVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="78" rx="22" ry="17" fill="#38BDF8"/>
      <ellipse cx="18" cy="62" rx="11" ry="7" fill="#38BDF8" transform="rotate(-30 18 62)"/>
      <ellipse cx="82" cy="62" rx="11" ry="7" fill="#38BDF8" transform="rotate(30 82 62)"/>
      <ellipse cx="50" cy="80" rx="28" ry="12" fill="#0EA5E9" opacity="0.5"/>
      <circle cx="50" cy="46" r="32" fill="#38BDF8"/>
      <ellipse cx="50" cy="82" rx="15" ry="9" fill="#E0F7FF" opacity="0.75"/>
      <PetFace mood={mood} cx={50} cy={44} s={1}/>
      <circle cx="34" cy="55" r="5" fill="#BAE6FD" opacity="0.7"/>
      <circle cx="66" cy="55" r="5" fill="#BAE6FD" opacity="0.7"/>
      <circle cx="32" cy="54" r="2" fill="white" opacity="0.9"/>
      <circle cx="64" cy="54" r="2" fill="white" opacity="0.9"/>
      <path d="M38,72 Q50,78 62,72" fill="none" stroke="#0EA5E9" strokeWidth="2"/>
    </svg>
  );
}

function AquaAdultSVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="77" rx="26" ry="19" fill="#38BDF8"/>
      <ellipse cx="10" cy="58" rx="14" ry="9" fill="#0EA5E9" transform="rotate(-35 10 58)"/>
      <ellipse cx="90" cy="58" rx="14" ry="9" fill="#0EA5E9" transform="rotate(35 90 58)"/>
      <ellipse cx="50" cy="88" rx="32" ry="10" fill="#0EA5E9" opacity="0.4"/>
      <circle cx="50" cy="43" r="34" fill="#38BDF8"/>
      <ellipse cx="50" cy="81" rx="19" ry="12" fill="#E0F7FF" opacity="0.75"/>
      <circle cx="37" cy="26" r="8" fill="#7DD3FC"/>
      <circle cx="63" cy="26" r="8" fill="#7DD3FC"/>
      <circle cx="50" cy="20" r="6" fill="#38BDF8"/>
      <path d="M38,20 Q50,12 62,20" fill="#0EA5E9" stroke="none"/>
      <PetFace mood={mood} cx={50} cy={41} s={1.1}/>
      <circle cx="33" cy="52" r="7" fill="#BAE6FD" opacity="0.7"/>
      <circle cx="67" cy="52" r="7" fill="#BAE6FD" opacity="0.7"/>
      <circle cx="31" cy="51" r="3" fill="white" opacity="0.9"/>
      <circle cx="65" cy="51" r="3" fill="white" opacity="0.9"/>
      <circle cx="50" cy="83" r="5" fill="#7DD3FC" opacity="0.6"/>
    </svg>
  );
}

// ── SPROUT (green — Scholar) ──────────────────────────────────────
function SproutEggSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="56" rx="30" ry="36" fill="#DCFCE7" stroke="#4ADE80" strokeWidth="3"/>
      <line x1="36" y1="32" x2="42" y2="50" stroke="#4ADE80" strokeWidth="1.5" opacity="0.5"/>
      <line x1="50" y1="30" x2="50" y2="48" stroke="#4ADE80" strokeWidth="1.5" opacity="0.5"/>
      <line x1="64" y1="32" x2="58" y2="50" stroke="#4ADE80" strokeWidth="1.5" opacity="0.5"/>
      <line x1="42" y1="55" x2="30" y2="62" stroke="#4ADE80" strokeWidth="1.5" opacity="0.4"/>
      <line x1="58" y1="55" x2="70" y2="62" stroke="#4ADE80" strokeWidth="1.5" opacity="0.4"/>
      <ellipse cx="50" cy="22" rx="6" ry="9" fill="#4ADE80"/>
      <ellipse cx="50" cy="17" rx="4" ry="6" fill="#86EFAC"/>
      <ellipse cx="44" cy="20" rx="5" ry="3" fill="#4ADE80" transform="rotate(-30 44 20)"/>
      <ellipse cx="56" cy="20" rx="5" ry="3" fill="#4ADE80" transform="rotate(30 56 20)"/>
    </svg>
  );
}

function SproutBabySVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="78" rx="16" ry="10" fill="#4ADE80"/>
      <circle cx="50" cy="50" r="28" fill="#4ADE80"/>
      <ellipse cx="50" cy="79" rx="11" ry="7" fill="#DCFCE7" opacity="0.7"/>
      <ellipse cx="50" cy="20" rx="16" ry="10" fill="#4ADE80"/>
      <ellipse cx="35" cy="22" rx="12" ry="8" fill="#22C55E" transform="rotate(-15 35 22)"/>
      <ellipse cx="65" cy="22" rx="12" ry="8" fill="#22C55E" transform="rotate(15 65 22)"/>
      <ellipse cx="50" cy="17" rx="9" ry="6" fill="#86EFAC"/>
      <PetFace mood={mood} cx={50} cy={51} s={0.82}/>
      <circle cx="35" cy="58" r="5" fill="#FFD166" opacity="0.4"/>
      <circle cx="65" cy="58" r="5" fill="#FFD166" opacity="0.4"/>
    </svg>
  );
}

function SproutKidSVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="77" rx="22" ry="17" fill="#4ADE80"/>
      <ellipse cx="18" cy="62" rx="10" ry="6" fill="#4ADE80" transform="rotate(-25 18 62)"/>
      <ellipse cx="82" cy="62" rx="10" ry="6" fill="#4ADE80" transform="rotate(25 82 62)"/>
      <circle cx="50" cy="47" r="31" fill="#4ADE80"/>
      <ellipse cx="50" cy="81" rx="15" ry="9" fill="#DCFCE7" opacity="0.75"/>
      <circle cx="38" cy="18" r="7" fill="#22C55E"/>
      <circle cx="50" cy="14" r="7" fill="#4ADE80"/>
      <circle cx="62" cy="18" r="7" fill="#22C55E"/>
      <circle cx="44" cy="14" r="5" fill="#86EFAC" opacity="0.9"/>
      <circle cx="56" cy="14" r="5" fill="#86EFAC" opacity="0.9"/>
      <PetFace mood={mood} cx={50} cy={45} s={1}/>
      <circle cx="34" cy="53" r="5" fill="#86EFAC" opacity="0.6"/>
      <circle cx="66" cy="53" r="5" fill="#86EFAC" opacity="0.6"/>
      <circle cx="35" cy="67" r="3" fill="#A5F3A0" opacity="0.5"/>
      <circle cx="65" cy="67" r="3" fill="#A5F3A0" opacity="0.5"/>
    </svg>
  );
}

function SproutAdultSVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="77" rx="26" ry="19" fill="#4ADE80"/>
      <ellipse cx="13" cy="56" rx="13" ry="8" fill="#22C55E" transform="rotate(-40 13 56)"/>
      <ellipse cx="87" cy="56" rx="13" ry="8" fill="#22C55E" transform="rotate(40 87 56)"/>
      <circle cx="50" cy="43" r="33" fill="#4ADE80"/>
      <ellipse cx="50" cy="81" rx="19" ry="12" fill="#DCFCE7" opacity="0.75"/>
      <circle cx="34" cy="16" r="9" fill="#22C55E"/>
      <circle cx="50" cy="10" r="9" fill="#4ADE80"/>
      <circle cx="66" cy="16" r="9" fill="#22C55E"/>
      <circle cx="42" cy="11" r="6" fill="#86EFAC" opacity="0.9"/>
      <circle cx="58" cy="11" r="6" fill="#86EFAC" opacity="0.9"/>
      <ellipse cx="50" cy="22" rx="8" ry="5" fill="#22C55E"/>
      <PetFace mood={mood} cx={50} cy={41} s={1.1}/>
      <circle cx="35" cy="51" r="7" fill="#86EFAC" opacity="0.55"/>
      <circle cx="65" cy="51" r="7" fill="#86EFAC" opacity="0.55"/>
      <circle cx="50" cy="77" r="6" fill="#7DD3FC" opacity="0.7"/>
      <circle cx="50" cy="77" r="3" fill="white" opacity="0.9"/>
      <circle cx="30" cy="72" r="3" fill="#86EFAC" opacity="0.5"/>
      <circle cx="70" cy="72" r="3" fill="#86EFAC" opacity="0.5"/>
    </svg>
  );
}

// ── COSMO (navy/purple — Logic) ───────────────────────────────────
function CosmoEggSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="55" rx="30" ry="37" fill="#1E1B4B" stroke="#818CF8" strokeWidth="2.5"/>
      <circle cx="34" cy="38" r="2" fill="white" opacity="0.9"/>
      <circle cx="62" cy="30" r="1.5" fill="white" opacity="0.8"/>
      <circle cx="44" cy="65" r="1.5" fill="white" opacity="0.7"/>
      <circle cx="68" cy="58" r="2" fill="white" opacity="0.85"/>
      <circle cx="28" cy="60" r="1" fill="white" opacity="0.6"/>
      <circle cx="55" cy="72" r="1" fill="white" opacity="0.6"/>
      <circle cx="40" cy="48" r="1" fill="#818CF8" opacity="0.8"/>
      <circle cx="60" cy="44" r="1" fill="#818CF8" opacity="0.8"/>
      <ellipse cx="50" cy="28" rx="3" ry="5" fill="#818CF8" opacity="0.7"/>
      <circle cx="50" cy="24" r="2.5" fill="#C7D2FE"/>
    </svg>
  );
}

function CosmoBabySVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="78" rx="16" ry="10" fill="#818CF8"/>
      <circle cx="50" cy="50" r="28" fill="#6366F1"/>
      <ellipse cx="50" cy="79" rx="11" ry="7" fill="#EEF2FF" opacity="0.6"/>
      <circle cx="38" cy="46" r="10" fill="#E0E7FF"/>
      <circle cx="62" cy="46" r="10" fill="#E0E7FF"/>
      <circle cx="38" cy="47" r="6" fill="#1E1B4B"/>
      <circle cx="62" cy="47" r="6" fill="#1E1B4B"/>
      <circle cx="36" cy="45" r="2" fill="white"/>
      <circle cx="60" cy="45" r="2" fill="white"/>
      <ellipse cx="50" cy="18" rx="3" ry="10" fill="#818CF8"/>
      <circle cx="50" cy="9" r="4" fill="#C7D2FE"/>
      <path d="M44,62 Q50,67 56,62" fill="none" stroke="#C7D2FE" strokeWidth="2"/>
      <circle cx="35" cy="56" r="2" fill="#818CF8" opacity="0.5"/>
      <circle cx="65" cy="56" r="2" fill="#818CF8" opacity="0.5"/>
    </svg>
  );
}

function CosmoKidSVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="78" rx="22" ry="17" fill="#818CF8"/>
      <ellipse cx="18" cy="63" rx="10" ry="6" fill="#818CF8" transform="rotate(-25 18 63)"/>
      <ellipse cx="82" cy="63" rx="10" ry="6" fill="#818CF8" transform="rotate(25 82 63)"/>
      <circle cx="50" cy="47" r="31" fill="#6366F1"/>
      <ellipse cx="50" cy="82" rx="15" ry="9" fill="#EEF2FF" opacity="0.6"/>
      <ellipse cx="50" cy="16" rx="3" ry="11" fill="#818CF8"/>
      <circle cx="42" cy="8" r="5" fill="#C7D2FE" stroke="#818CF8" strokeWidth="1.5"/>
      <circle cx="58" cy="8" r="5" fill="#C7D2FE" stroke="#818CF8" strokeWidth="1.5"/>
      <circle cx="50" cy="6" r="3" fill="#818CF8"/>
      <circle cx="36" cy="43" r="11" fill="#E0E7FF"/>
      <circle cx="64" cy="43" r="11" fill="#E0E7FF"/>
      <circle cx="36" cy="44" r="7" fill="#1E1B4B"/>
      <circle cx="64" cy="44" r="7" fill="#1E1B4B"/>
      <circle cx="34" cy="42" r="2.5" fill="white"/>
      <circle cx="62" cy="42" r="2.5" fill="white"/>
      <path d="M42,58 Q50,64 58,58" fill="none" stroke="#C7D2FE" strokeWidth="2"/>
      <circle cx="32" cy="32" r="1.5" fill="white" opacity="0.7"/>
      <circle cx="64" cy="28" r="1" fill="white" opacity="0.6"/>
      <circle cx="45" cy="72" r="1.5" fill="white" opacity="0.5"/>
    </svg>
  );
}

function CosmoAdultSVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="77" rx="26" ry="19" fill="#818CF8"/>
      <ellipse cx="14" cy="58" rx="13" ry="8" fill="#6366F1" transform="rotate(-38 14 58)"/>
      <ellipse cx="86" cy="58" rx="13" ry="8" fill="#6366F1" transform="rotate(38 86 58)"/>
      <circle cx="50" cy="43" r="33" fill="#6366F1"/>
      <ellipse cx="50" cy="81" rx="19" ry="12" fill="#EEF2FF" opacity="0.6"/>
      <ellipse cx="40" cy="14" rx="3" ry="12" fill="#818CF8" transform="rotate(-15 40 14)"/>
      <ellipse cx="60" cy="14" rx="3" ry="12" fill="#818CF8" transform="rotate(15 60 14)"/>
      <circle cx="34" cy="5" r="5" fill="#C7D2FE" stroke="#818CF8" strokeWidth="2"/>
      <circle cx="66" cy="5" r="5" fill="#C7D2FE" stroke="#818CF8" strokeWidth="2"/>
      <ellipse cx="34" cy="5" rx="8" ry="3" fill="none" stroke="#818CF8" strokeWidth="1.5"/>
      <ellipse cx="66" cy="5" rx="8" ry="3" fill="none" stroke="#818CF8" strokeWidth="1.5"/>
      <circle cx="35" cy="41" r="13" fill="#E0E7FF"/>
      <circle cx="65" cy="41" r="13" fill="#E0E7FF"/>
      <circle cx="35" cy="42" r="9" fill="#1E1B4B"/>
      <circle cx="65" cy="42" r="9" fill="#1E1B4B"/>
      <circle cx="32" cy="39" r="3" fill="white"/>
      <circle cx="62" cy="39" r="3" fill="white"/>
      <circle cx="32" cy="37" r="1" fill="#C7D2FE"/>
      <circle cx="62" cy="37" r="1" fill="#C7D2FE"/>
      <circle cx="50" cy="58" r="6" fill="#4F46E5" opacity="0.6"/>
      <text x="50" y="62" textAnchor="middle" fontSize="7" fill="#C7D2FE">✦</text>
      <circle cx="25" cy="28" r="1.5" fill="white" opacity="0.7"/>
      <circle cx="72" cy="24" r="1" fill="white" opacity="0.6"/>
      <circle cx="40" cy="78" r="1.5" fill="white" opacity="0.5"/>
      <circle cx="62" cy="76" r="1" fill="white" opacity="0.5"/>
    </svg>
  );
}

// ── PETAL (pink — Care) ───────────────────────────────────────────
function PetalEggSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="55" rx="30" ry="37" fill="#FDF2F8" stroke="#F472B6" strokeWidth="3"/>
      <ellipse cx="37" cy="38" rx="9" ry="6" fill="#F472B6" opacity="0.25" transform="rotate(-20 37 38)"/>
      <ellipse cx="63" cy="38" rx="9" ry="6" fill="#F472B6" opacity="0.25" transform="rotate(20 63 38)"/>
      <ellipse cx="50" cy="32" rx="8" ry="5" fill="#F472B6" opacity="0.25"/>
      <ellipse cx="38" cy="50" rx="7" ry="5" fill="#F472B6" opacity="0.2" transform="rotate(-10 38 50)"/>
      <ellipse cx="62" cy="50" rx="7" ry="5" fill="#F472B6" opacity="0.2" transform="rotate(10 62 50)"/>
      <circle cx="50" cy="22" r="4" fill="#F472B6" opacity="0.6"/>
      <ellipse cx="50" cy="19" rx="3" ry="5" fill="#FDA4CF" opacity="0.8"/>
    </svg>
  );
}

function PetalBabySVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="78" rx="16" ry="10" fill="#F472B6"/>
      <circle cx="50" cy="50" r="28" fill="#F472B6"/>
      <ellipse cx="50" cy="79" rx="11" ry="7" fill="#FDF2F8" opacity="0.75"/>
      <ellipse cx="36" cy="24" rx="10" ry="7" fill="#F472B6" transform="rotate(-25 36 24)"/>
      <ellipse cx="64" cy="24" rx="10" ry="7" fill="#F472B6" transform="rotate(25 64 24)"/>
      <ellipse cx="50" cy="20" rx="9" ry="6" fill="#F472B6"/>
      <circle cx="36" cy="22" r="5" fill="#FDA4CF" opacity="0.8"/>
      <circle cx="64" cy="22" r="5" fill="#FDA4CF" opacity="0.8"/>
      <circle cx="50" cy="18" r="5" fill="#FDA4CF" opacity="0.8"/>
      <ellipse cx="36" cy="17" rx="4" ry="3" fill="#FDE68A" opacity="0.5"/>
      <ellipse cx="64" cy="17" rx="4" ry="3" fill="#FDE68A" opacity="0.5"/>
      <PetFace mood={mood} cx={50} cy={51} s={0.82}/>
    </svg>
  );
}

function PetalKidSVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="77" rx="22" ry="17" fill="#F472B6"/>
      <ellipse cx="18" cy="63" rx="11" ry="7" fill="#EC4899" transform="rotate(-30 18 63)"/>
      <ellipse cx="82" cy="63" rx="11" ry="7" fill="#EC4899" transform="rotate(30 82 63)"/>
      <ellipse cx="12" cy="55" rx="8" ry="5" fill="#F9A8D4" transform="rotate(-40 12 55)"/>
      <ellipse cx="88" cy="55" rx="8" ry="5" fill="#F9A8D4" transform="rotate(40 88 55)"/>
      <circle cx="50" cy="47" r="31" fill="#F472B6"/>
      <ellipse cx="50" cy="81" rx="15" ry="9" fill="#FDF2F8" opacity="0.75"/>
      <circle cx="37" cy="20" r="7" fill="#EC4899"/>
      <circle cx="50" cy="16" r="7" fill="#F472B6"/>
      <circle cx="63" cy="20" r="7" fill="#EC4899"/>
      <circle cx="37" cy="18" r="4" fill="#FDA4CF" opacity="0.9"/>
      <circle cx="63" cy="18" r="4" fill="#FDA4CF" opacity="0.9"/>
      <circle cx="50" cy="14" r="4" fill="#FDE68A" opacity="0.7"/>
      <PetFace mood={mood} cx={50} cy={45} s={1}/>
      <circle cx="34" cy="54" r="5" fill="#FDA4CF" opacity="0.5"/>
      <circle cx="66" cy="54" r="5" fill="#FDA4CF" opacity="0.5"/>
    </svg>
  );
}

function PetalAdultSVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="77" rx="26" ry="19" fill="#F472B6"/>
      <ellipse cx="10" cy="55" rx="14" ry="9" fill="#EC4899" transform="rotate(-45 10 55)"/>
      <ellipse cx="90" cy="55" rx="14" ry="9" fill="#EC4899" transform="rotate(45 90 55)"/>
      <ellipse cx="18" cy="42" rx="11" ry="7" fill="#F9A8D4" transform="rotate(-55 18 42)"/>
      <ellipse cx="82" cy="42" rx="11" ry="7" fill="#F9A8D4" transform="rotate(55 82 42)"/>
      <circle cx="50" cy="43" r="33" fill="#F472B6"/>
      <ellipse cx="50" cy="81" rx="19" ry="12" fill="#FDF2F8" opacity="0.75"/>
      <circle cx="32" cy="16" r="9" fill="#EC4899"/>
      <circle cx="50" cy="10" r="9" fill="#F472B6"/>
      <circle cx="68" cy="16" r="9" fill="#EC4899"/>
      <circle cx="32" cy="13" r="5" fill="#FDA4CF" opacity="0.9"/>
      <circle cx="68" cy="13" r="5" fill="#FDA4CF" opacity="0.9"/>
      <circle cx="50" cy="8" r="5" fill="#FDE68A" opacity="0.8"/>
      <ellipse cx="41" cy="13" rx="3" ry="5" fill="#FDA4CF" opacity="0.5" transform="rotate(-30 41 13)"/>
      <ellipse cx="59" cy="13" rx="3" ry="5" fill="#FDA4CF" opacity="0.5" transform="rotate(30 59 13)"/>
      <PetFace mood={mood} cx={50} cy={41} s={1.1}/>
      <circle cx="35" cy="51" r="7" fill="#FDA4CF" opacity="0.55"/>
      <circle cx="65" cy="51" r="7" fill="#FDA4CF" opacity="0.55"/>
      <circle cx="50" cy="78" r="6" fill="#FDE68A" opacity="0.7"/>
      <circle cx="50" cy="78" r="3" fill="white" opacity="0.9"/>
      <circle cx="30" cy="72" r="3" fill="#FDA4CF" opacity="0.5"/>
      <circle cx="70" cy="72" r="3" fill="#FDA4CF" opacity="0.5"/>
    </svg>
  );
}

// ── Pet animation CSS (injected once) ────────────────────────────
var PET_STYLES_ID = 'spelloop-pet-styles';
if (!document.getElementById(PET_STYLES_ID)) {
  var _styleEl = document.createElement('style');
  _styleEl.id = PET_STYLES_ID;
  _styleEl.textContent = [
    '@keyframes petBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }',
    '@keyframes petBobFast { 0%,100%{transform:translateY(0) scale(1)} 40%{transform:translateY(-10px) scale(1.06)} }',
    '@keyframes petWobble { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-5deg)} 75%{transform:rotate(5deg)} }',
    '@keyframes petBounce { 0%,100%{transform:scale(1) translateY(0)} 30%{transform:scale(1.22) translateY(-14px)} 60%{transform:scale(0.94) translateY(0)} 80%{transform:scale(1.1) translateY(-5px)} }',
    '@keyframes petDroop { 0%,100%{transform:translateY(0)} 40%{transform:translateY(7px) rotate(-3deg)} }',
    '@keyframes petEggPick { 0%{transform:scale(1)} 30%{transform:scale(1.15)} 50%{transform:scale(1.1) rotate(-3deg)} 70%{transform:scale(1.15) rotate(3deg)} 100%{transform:scale(1)} }',
    '@keyframes shinySparkle { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-28px) scale(0.4)} }',
    '.pet-bob { animation: petBob 2.4s ease-in-out infinite }',
    '.pet-bob-fast { animation: petBobFast 1.3s ease-in-out infinite }',
    '.pet-wobble { animation: petWobble 3s ease-in-out infinite }',
    '.pet-bounce { animation: petBounce 700ms cubic-bezier(.34,1.1,.64,1) forwards }',
    '.pet-droop { animation: petDroop 900ms ease-in-out forwards }',
    '.pet-egg-pick { animation: petEggPick 800ms ease-in-out forwards }',
  ].join('\n');
  document.head.appendChild(_styleEl);
}

// ── ShinyOverlay ──────────────────────────────────────────────────
function ShinyOverlay({ size }) {
  var particles = [
    { top: '8%',  left: '60%', delay: '0s'    },
    { top: '15%', left: '25%', delay: '0.2s'  },
    { top: '5%',  left: '45%', delay: '0.4s'  },
    { top: '18%', left: '72%', delay: '0.6s'  },
    { top: '10%', left: '15%', delay: '0.8s'  },
    { top: '22%', left: '50%', delay: '1.0s'  },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {particles.map(function(p, i) {
        return (
          <div key={i} style={{
            position: 'absolute', top: p.top, left: p.left,
            fontSize: Math.round(size * 0.12), lineHeight: 1,
            animation: 'shinySparkle 1.8s ease-out ' + p.delay + ' infinite',
          }}>✦</div>
        );
      })}
      <div style={{
        position: 'absolute', top: '2px', right: '2px',
        background: 'white', borderRadius: 20, padding: '2px 6px',
        fontSize: Math.round(size * 0.13), lineHeight: 1.4,
        fontWeight: 800, color: '#B45309', letterSpacing: '0.01em',
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
      }}>✨</div>
    </div>
  );
}

// ── BLAZE (yellow/gold — Wild ⚡) ─────────────────────────────────
function BlazeEggSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="55" rx="30" ry="37" fill="#FEF9C3" stroke="#FACC15" strokeWidth="3"/>
      <path d="M50,18 L54,30 L62,24 L56,36 L66,34 L58,44 L68,46 L56,50" fill="none" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
      <path d="M50,18 L46,30 L38,24 L44,36 L34,34 L42,44 L32,46 L44,50" fill="none" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
      <ellipse cx="50" cy="15" rx="4" ry="7" fill="#FACC15"/>
      <ellipse cx="50" cy="11" rx="2.5" ry="4" fill="#FDE68A"/>
    </svg>
  );
}
function BlazeBabySVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="78" rx="15" ry="9" fill="#FACC15"/>
      <circle cx="50" cy="50" r="27" fill="#FACC15"/>
      <ellipse cx="50" cy="79" rx="10" ry="6" fill="#FEF9C3" opacity="0.8"/>
      <path d="M36,22 L42,35 L30,30 L38,42 L26,40" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M64,22 L58,35 L70,30 L62,42 L74,40" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <PetFace mood={mood} cx={50} cy={50} s={1.0}/>
      <circle cx="35" cy="60" r="6" fill="#FDE68A" opacity="0.6"/>
      <circle cx="65" cy="60" r="6" fill="#FDE68A" opacity="0.6"/>
    </svg>
  );
}
function BlazeKidSVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="80" rx="20" ry="11" fill="#FACC15"/>
      <circle cx="50" cy="44" r="32" fill="#FACC15"/>
      <ellipse cx="50" cy="81" rx="14" ry="8" fill="#FEF9C3" opacity="0.75"/>
      <path d="M28,16 L36,30 L20,26 L30,40 L16,38" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M72,16 L64,30 L80,26 L70,40 L84,38" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M38,8 L44,22 L34,18 L40,28" fill="none" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M62,8 L56,22 L66,18 L60,28" fill="none" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <PetFace mood={mood} cx={50} cy={43} s={1.1}/>
      <circle cx="33" cy="54" r="7" fill="#FDE68A" opacity="0.55"/>
      <circle cx="67" cy="54" r="7" fill="#FDE68A" opacity="0.55"/>
    </svg>
  );
}
function BlazeAdultSVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="82" rx="22" ry="12" fill="#FACC15"/>
      <circle cx="50" cy="43" r="34" fill="#FACC15"/>
      <ellipse cx="50" cy="83" rx="16" ry="9" fill="#FEF9C3" opacity="0.75"/>
      <path d="M22,10 L32,28 L14,22 L26,40 L10,36" fill="none" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M78,10 L68,28 L86,22 L74,40 L90,36" fill="none" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M36,4 L42,18 L30,14 L38,26" fill="none" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M64,4 L58,18 L70,14 L62,26" fill="none" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M50,2 L54,14 L46,14 Z" fill="#FACC15"/>
      <PetFace mood={mood} cx={50} cy={42} s={1.15}/>
      <circle cx="32" cy="54" r="8" fill="#FDE68A" opacity="0.55"/>
      <circle cx="68" cy="54" r="8" fill="#FDE68A" opacity="0.55"/>
      <circle cx="50" cy="79" r="5" fill="#FCD34D" opacity="0.6"/>
    </svg>
  );
}

// ── FROST (ice blue — Cool ❄️) ────────────────────────────────────
function FrostEggSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="55" rx="30" ry="37" fill="#E0F2FE" stroke="#7DD3FC" strokeWidth="2.5"/>
      <line x1="50" y1="20" x2="50" y2="50" stroke="#7DD3FC" strokeWidth="1.5" opacity="0.6"/>
      <line x1="50" y1="20" x2="38" y2="35" stroke="#7DD3FC" strokeWidth="1.5" opacity="0.5"/>
      <line x1="50" y1="20" x2="62" y2="35" stroke="#7DD3FC" strokeWidth="1.5" opacity="0.5"/>
      <line x1="32" y1="38" x2="68" y2="62" stroke="#BAE6FD" strokeWidth="1" opacity="0.5"/>
      <line x1="68" y1="38" x2="32" y2="62" stroke="#BAE6FD" strokeWidth="1" opacity="0.5"/>
      <circle cx="50" cy="20" r="3.5" fill="#7DD3FC"/>
      <circle cx="38" cy="35" r="2.5" fill="#BAE6FD"/>
      <circle cx="62" cy="35" r="2.5" fill="#BAE6FD"/>
      <circle cx="32" cy="38" r="2" fill="#E0F2FE" stroke="#7DD3FC" strokeWidth="1"/>
      <circle cx="68" cy="38" r="2" fill="#E0F2FE" stroke="#7DD3FC" strokeWidth="1"/>
      <circle cx="50" cy="50" r="2" fill="#7DD3FC" opacity="0.7"/>
    </svg>
  );
}
function FrostBabySVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="78" rx="15" ry="9" fill="#7DD3FC"/>
      <circle cx="50" cy="50" r="27" fill="#7DD3FC"/>
      <ellipse cx="50" cy="79" rx="10" ry="6" fill="#E0F2FE" opacity="0.8"/>
      <line x1="50" y1="16" x2="50" y2="32" stroke="#BAE6FD" strokeWidth="2" opacity="0.8"/>
      <line x1="50" y1="16" x2="42" y2="24" stroke="#BAE6FD" strokeWidth="1.5" opacity="0.7"/>
      <line x1="50" y1="16" x2="58" y2="24" stroke="#BAE6FD" strokeWidth="1.5" opacity="0.7"/>
      <circle cx="50" cy="16" r="3" fill="#E0F2FE"/>
      <PetFace mood={mood} cx={50} cy={50} s={1.0}/>
      <circle cx="35" cy="60" r="6" fill="#BAE6FD" opacity="0.6"/>
      <circle cx="65" cy="60" r="6" fill="#BAE6FD" opacity="0.6"/>
    </svg>
  );
}
function FrostKidSVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="80" rx="20" ry="11" fill="#7DD3FC"/>
      <circle cx="50" cy="44" r="32" fill="#7DD3FC"/>
      <ellipse cx="50" cy="81" rx="14" ry="8" fill="#E0F2FE" opacity="0.75"/>
      <line x1="50" y1="6" x2="50" y2="26" stroke="#BAE6FD" strokeWidth="2.5" opacity="0.9"/>
      <line x1="50" y1="6" x2="38" y2="18" stroke="#BAE6FD" strokeWidth="2" opacity="0.8"/>
      <line x1="50" y1="6" x2="62" y2="18" stroke="#BAE6FD" strokeWidth="2" opacity="0.8"/>
      <line x1="28" y1="16" x2="72" y2="36" stroke="#E0F2FE" strokeWidth="1.5" opacity="0.6"/>
      <line x1="72" y1="16" x2="28" y2="36" stroke="#E0F2FE" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="50" cy="6" r="4" fill="#E0F2FE"/>
      <circle cx="38" cy="18" r="3" fill="#BAE6FD"/>
      <circle cx="62" cy="18" r="3" fill="#BAE6FD"/>
      <PetFace mood={mood} cx={50} cy={43} s={1.1}/>
      <circle cx="33" cy="54" r="7" fill="#BAE6FD" opacity="0.55"/>
      <circle cx="67" cy="54" r="7" fill="#BAE6FD" opacity="0.55"/>
    </svg>
  );
}
function FrostAdultSVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="82" rx="22" ry="12" fill="#7DD3FC"/>
      <circle cx="50" cy="43" r="34" fill="#7DD3FC"/>
      <ellipse cx="50" cy="83" rx="16" ry="9" fill="#E0F2FE" opacity="0.75"/>
      <line x1="50" y1="2" x2="50" y2="24" stroke="#E0F2FE" strokeWidth="3" opacity="0.9"/>
      <line x1="50" y1="2" x2="34" y2="16" stroke="#E0F2FE" strokeWidth="2.5" opacity="0.8"/>
      <line x1="50" y1="2" x2="66" y2="16" stroke="#E0F2FE" strokeWidth="2.5" opacity="0.8"/>
      <line x1="24" y1="14" x2="76" y2="38" stroke="#BAE6FD" strokeWidth="2" opacity="0.65"/>
      <line x1="76" y1="14" x2="24" y2="38" stroke="#BAE6FD" strokeWidth="2" opacity="0.65"/>
      <line x1="18" y1="26" x2="82" y2="26" stroke="#BAE6FD" strokeWidth="2" opacity="0.5"/>
      <circle cx="50" cy="2" r="5" fill="#E0F2FE"/>
      <circle cx="34" cy="16" r="3.5" fill="#BAE6FD"/>
      <circle cx="66" cy="16" r="3.5" fill="#BAE6FD"/>
      <PetFace mood={mood} cx={50} cy={42} s={1.15}/>
      <circle cx="32" cy="54" r="8" fill="#BAE6FD" opacity="0.55"/>
      <circle cx="68" cy="54" r="8" fill="#BAE6FD" opacity="0.55"/>
    </svg>
  );
}

// ── LUNA (purple — Mystery 🌙) ────────────────────────────────────
function LunaEggSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="55" rx="30" ry="37" fill="#F3E8FF" stroke="#C084FC" strokeWidth="2.5"/>
      <path d="M50,15 C38,25 38,45 50,55 C38,55 26,43 30,28 C33,18 42,12 50,15 Z" fill="#C084FC" opacity="0.35"/>
      <circle cx="38" cy="32" r="2" fill="#C084FC" opacity="0.7"/>
      <circle cx="62" cy="40" r="1.5" fill="#A855F7" opacity="0.6"/>
      <circle cx="55" cy="25" r="1.5" fill="#C084FC" opacity="0.8"/>
      <circle cx="44" cy="58" r="1" fill="#A855F7" opacity="0.5"/>
      <circle cx="66" cy="60" r="1.5" fill="#C084FC" opacity="0.6"/>
      <ellipse cx="50" cy="18" rx="4" ry="6" fill="#C084FC"/>
      <path d="M46,12 Q50,8 54,12" fill="#A855F7" stroke="none"/>
    </svg>
  );
}
function LunaBabySVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="78" rx="15" ry="9" fill="#C084FC"/>
      <circle cx="50" cy="50" r="27" fill="#C084FC"/>
      <path d="M50,23 C40,33 40,53 50,60 C38,58 28,46 32,32 C36,22 44,18 50,23 Z" fill="#A855F7" opacity="0.4"/>
      <ellipse cx="50" cy="79" rx="10" ry="6" fill="#F3E8FF" opacity="0.8"/>
      <circle cx="35" cy="38" r="4" fill="#F3E8FF" opacity="0.5"/>
      <circle cx="65" cy="38" r="4" fill="#F3E8FF" opacity="0.5"/>
      <PetFace mood={mood} cx={50} cy={50} s={1.0}/>
      <circle cx="35" cy="60" r="5" fill="#E9D5FF" opacity="0.6"/>
      <circle cx="65" cy="60" r="5" fill="#E9D5FF" opacity="0.6"/>
      <circle cx="42" cy="30" r="1.5" fill="white" opacity="0.8"/>
      <circle cx="68" cy="34" r="1" fill="white" opacity="0.7"/>
    </svg>
  );
}
function LunaKidSVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="80" rx="20" ry="11" fill="#C084FC"/>
      <circle cx="50" cy="44" r="32" fill="#C084FC"/>
      <path d="M50,12 C36,24 36,48 50,58 C34,56 20,40 26,22 C31,9 42,6 50,12 Z" fill="#A855F7" opacity="0.35"/>
      <ellipse cx="50" cy="81" rx="14" ry="8" fill="#F3E8FF" opacity="0.75"/>
      <circle cx="34" cy="18" r="5" fill="#E9D5FF" opacity="0.6"/>
      <circle cx="66" cy="18" r="5" fill="#E9D5FF" opacity="0.6"/>
      <path d="M30,22 Q34,14 38,22" fill="#C084FC" stroke="none"/>
      <path d="M62,22 Q66,14 70,22" fill="#C084FC" stroke="none"/>
      <PetFace mood={mood} cx={50} cy={43} s={1.1}/>
      <circle cx="33" cy="54" r="7" fill="#E9D5FF" opacity="0.55"/>
      <circle cx="67" cy="54" r="7" fill="#E9D5FF" opacity="0.55"/>
      <circle cx="28" cy="38" r="1.5" fill="white" opacity="0.7"/>
      <circle cx="72" cy="30" r="1" fill="white" opacity="0.6"/>
    </svg>
  );
}
function LunaAdultSVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="82" rx="22" ry="12" fill="#C084FC"/>
      <circle cx="50" cy="43" r="34" fill="#C084FC"/>
      <path d="M50,8 C32,22 32,50 50,62 C30,60 14,40 22,18 C28,4 42,2 50,8 Z" fill="#A855F7" opacity="0.35"/>
      <ellipse cx="50" cy="83" rx="16" ry="9" fill="#F3E8FF" opacity="0.75"/>
      <circle cx="28" cy="16" r="6" fill="#E9D5FF" opacity="0.6"/>
      <circle cx="72" cy="16" r="6" fill="#E9D5FF" opacity="0.6"/>
      <path d="M24,20 Q28,10 34,20" fill="#A855F7" stroke="none"/>
      <path d="M66,20 Q70,10 76,20" fill="#A855F7" stroke="none"/>
      <circle cx="50" cy="6" r="4" fill="#E9D5FF" opacity="0.7"/>
      <PetFace mood={mood} cx={50} cy={42} s={1.15}/>
      <circle cx="32" cy="54" r="8" fill="#E9D5FF" opacity="0.55"/>
      <circle cx="68" cy="54" r="8" fill="#E9D5FF" opacity="0.55"/>
      <circle cx="26" cy="34" r="2" fill="white" opacity="0.7"/>
      <circle cx="74" cy="28" r="1.5" fill="white" opacity="0.6"/>
      <circle cx="40" cy="76" r="2" fill="white" opacity="0.5"/>
    </svg>
  );
}

// ── REX (green — Fierce 🦖) ───────────────────────────────────────
function RexEggSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="55" rx="30" ry="37" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="3"/>
      <path d="M36,22 L40,32 L32,30 L38,38 L30,36" fill="#86EFAC" stroke="#4ADE80" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M64,22 L60,32 L68,30 L62,38 L70,36" fill="#86EFAC" stroke="#4ADE80" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="36" cy="50" r="3" fill="#86EFAC" opacity="0.6"/>
      <circle cx="64" cy="50" r="3" fill="#86EFAC" opacity="0.6"/>
      <circle cx="50" cy="42" r="3" fill="#4ADE80" opacity="0.5"/>
      <ellipse cx="50" cy="18" rx="5" ry="8" fill="#86EFAC"/>
      <path d="M46,14 Q50,10 54,14" fill="#4ADE80" stroke="none"/>
      <path d="M42,20 Q50,16 58,20" fill="none" stroke="#4ADE80" strokeWidth="1.5"/>
    </svg>
  );
}
function RexBabySVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="78" rx="15" ry="9" fill="#86EFAC"/>
      <circle cx="50" cy="50" r="27" fill="#86EFAC"/>
      <path d="M32,26 L38,38 L28,34 L36,44 L26,42" fill="#4ADE80" stroke="none"/>
      <path d="M68,26 L62,38 L72,34 L64,44 L74,42" fill="#4ADE80" stroke="none"/>
      <ellipse cx="50" cy="79" rx="10" ry="6" fill="#DCFCE7" opacity="0.8"/>
      <path d="M38,20 Q50,16 62,20" stroke="#4ADE80" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <PetFace mood={mood} cx={50} cy={50} s={1.0}/>
      <circle cx="35" cy="60" r="5" fill="#BBF7D0" opacity="0.7"/>
      <circle cx="65" cy="60" r="5" fill="#BBF7D0" opacity="0.7"/>
    </svg>
  );
}
function RexKidSVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="80" rx="20" ry="11" fill="#86EFAC"/>
      <circle cx="50" cy="44" r="32" fill="#86EFAC"/>
      <path d="M24,18 L32,34 L20,28 L30,44 L18,40" fill="#4ADE80" stroke="none"/>
      <path d="M76,18 L68,34 L80,28 L70,44 L82,40" fill="#4ADE80" stroke="none"/>
      <ellipse cx="50" cy="81" rx="14" ry="8" fill="#DCFCE7" opacity="0.75"/>
      <path d="M32,14 Q50,8 68,14" stroke="#4ADE80" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M38,10 Q50,6 62,10" stroke="#86EFAC" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <PetFace mood={mood} cx={50} cy={43} s={1.1}/>
      <circle cx="33" cy="54" r="7" fill="#BBF7D0" opacity="0.6"/>
      <circle cx="67" cy="54" r="7" fill="#BBF7D0" opacity="0.6"/>
    </svg>
  );
}
function RexAdultSVG({ size, mood }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="82" rx="22" ry="12" fill="#86EFAC"/>
      <circle cx="50" cy="43" r="34" fill="#86EFAC"/>
      <path d="M18,12 L28,32 L14,24 L26,44 L12,38" fill="#4ADE80" stroke="none"/>
      <path d="M82,12 L72,32 L86,24 L74,44 L88,38" fill="#4ADE80" stroke="none"/>
      <path d="M34,6 L42,20 L30,16 L38,28" fill="#22C55E" stroke="none"/>
      <path d="M66,6 L58,20 L70,16 L62,28" fill="#22C55E" stroke="none"/>
      <ellipse cx="50" cy="83" rx="16" ry="9" fill="#DCFCE7" opacity="0.75"/>
      <path d="M28,10 Q50,2 72,10" stroke="#4ADE80" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M34,6 Q50,0 66,6" stroke="#86EFAC" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <PetFace mood={mood} cx={50} cy={42} s={1.15}/>
      <circle cx="32" cy="54" r="8" fill="#BBF7D0" opacity="0.6"/>
      <circle cx="68" cy="54" r="8" fill="#BBF7D0" opacity="0.6"/>
    </svg>
  );
}

// ── STAGE_SVGS routing table ──────────────────────────────────────
var STAGE_SVGS = {
  pebble: { egg: PetEggSVG,    baby: PetBabySVG,    kid: PetKidSVG,    adult: PetAdultSVG    },
  ember:  { egg: EmberEggSVG,  baby: EmberBabySVG,  kid: EmberKidSVG,  adult: EmberAdultSVG  },
  aqua:   { egg: AquaEggSVG,   baby: AquaBabySVG,   kid: AquaKidSVG,   adult: AquaAdultSVG   },
  sprout: { egg: SproutEggSVG, baby: SproutBabySVG, kid: SproutKidSVG, adult: SproutAdultSVG },
  cosmo:  { egg: CosmoEggSVG,  baby: CosmoBabySVG,  kid: CosmoKidSVG,  adult: CosmoAdultSVG  },
  petal:  { egg: PetalEggSVG,  baby: PetalBabySVG,  kid: PetalKidSVG,  adult: PetalAdultSVG  },
  blaze:  { egg: BlazeEggSVG,  baby: BlazeBabySVG,  kid: BlazeKidSVG,  adult: BlazeAdultSVG  },
  frost:  { egg: FrostEggSVG,  baby: FrostBabySVG,  kid: FrostKidSVG,  adult: FrostAdultSVG  },
  luna:   { egg: LunaEggSVG,   baby: LunaBabySVG,   kid: LunaKidSVG,   adult: LunaAdultSVG   },
  rex:    { egg: RexEggSVG,    baby: RexBabySVG,    kid: RexKidSVG,    adult: RexAdultSVG    },
};

// ── Main PetSprite component ──────────────────────────────────────
function PetSprite({ speciesId, completedChapters, growthPoints, mood, size, equipped, animate, reaction, isShiny,
                     // Legacy props for backward compat
                     totalStars, petEquipped }) {
  size = size || 80;
  mood = mood == null ? 80 : mood;
  animate = animate !== false;

  // Resolve species + stage
  var sid = speciesId || 'pebble';
  var petData = window.PET_SPECIES ? window.PET_SPECIES.find(function(s) { return s.id === sid; }) : null;
  isShiny = !!isShiny;

  // Resolve completed chapters — support legacy totalStars path
  var chapters = completedChapters;
  if (!chapters && totalStars != null) {
    // Legacy: approximate chapters from stars for backward compat
    var s = totalStars || 0;
    chapters = s >= 70 ? [1,2,3,4,5] : s >= 35 ? [1,2,3] : s >= 10 ? [1] : [];
  }
  chapters = chapters || [];

  var stage = growthPoints != null
    ? getPetStageFromGrowth(growthPoints, isShiny)
    : getPetStage(chapters, isShiny);
  var moodLabel = getPetMoodLabel(mood);

  var animClass = reaction === 'bounce'   ? 'pet-bounce'
    : reaction === 'droop'    ? 'pet-droop'
    : reaction === 'egg-pick' ? 'pet-egg-pick'
    : stage === 'egg' ? 'pet-wobble'
    : !animate || moodLabel === 'sleeping' ? ''
    : moodLabel === 'happy' ? 'pet-bob-fast'
    : 'pet-bob';

  var svgStage = stage === 'shiny' ? 'adult' : stage;
  var SvgComp = (STAGE_SVGS[sid] || STAGE_SVGS.pebble)[svgStage] || PetEggSVG;

  // Resolve equipped items (new: equipped obj keyed by slot; legacy: petEquipped)
  var eq = equipped || petEquipped || {};
  var outfitItems = window.PET_OUTFIT_ITEMS || window.SHOP_ITEMS || [];
  function getItem(slot) {
    var id = eq[slot];
    return id ? outfitItems.find(function(it) { return it.id === id; }) : null;
  }
  var hat    = getItem('hat');
  var bow    = getItem('bow');
  var shades = getItem('shades');
  var cape   = getItem('cape');

  // Species-themed shiny ring color
  var shinyColor = petData ? petData.color : '#FFD166';

  return (
    <div data-pet-stage={stage} style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
      <div className={animClass} style={{
        width: size, height: size,
        filter: stage === 'shiny' ? 'drop-shadow(0 0 6px ' + shinyColor + ')' : 'none',
        boxShadow: stage === 'shiny'
          ? '0 0 0 3px ' + shinyColor + ', 0 0 0 8px ' + shinyColor + '55'
          : 'none',
        borderRadius: '50%',
      }}>
        <SvgComp size={size} mood={mood}/>
      </div>
      {stage === 'shiny' && <ShinyOverlay size={size}/>}
      {hat && (
        <div style={{ position: 'absolute', top: Math.round(size * -0.13), left: '50%', transform: 'translateX(-50%)', fontSize: Math.round(size * 0.36), lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>
          {hat.emoji}
        </div>
      )}
      {shades && stage !== 'egg' && (
        <div style={{ position: 'absolute', top: Math.round(size * 0.30), left: '50%', transform: 'translateX(-50%)', fontSize: Math.round(size * 0.27), lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>
          {shades.emoji}
        </div>
      )}
      {bow && stage !== 'egg' && (
        <div style={{ position: 'absolute', top: Math.round(size * 0.06), right: Math.round(size * 0.04), fontSize: Math.round(size * 0.24), lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>
          {bow.emoji}
        </div>
      )}
      {cape && stage !== 'egg' && (
        <div style={{ position: 'absolute', bottom: Math.round(size * 0.02), left: '50%', transform: 'translateX(-50%)', fontSize: Math.round(size * 0.4), lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>
          {cape.emoji}
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  PetSprite, PetFace, ShinyOverlay,
  getPetStage, getPetStageFromGrowth, getPetNextGrowthStage, getPetGrowthProgress,
  getPetMoodLabel, getPetNextStage, getCompletedChapters,
  PET_MOOD_COLORS, PET_GROWTH_THRESHOLDS, STAGE_SVGS,
  PetEggSVG, PetBabySVG, PetKidSVG, PetAdultSVG,
  EmberEggSVG, EmberBabySVG, EmberKidSVG, EmberAdultSVG,
  AquaEggSVG, AquaBabySVG, AquaKidSVG, AquaAdultSVG,
  SproutEggSVG, SproutBabySVG, SproutKidSVG, SproutAdultSVG,
  CosmoEggSVG, CosmoBabySVG, CosmoKidSVG, CosmoAdultSVG,
  PetalEggSVG, PetalBabySVG, PetalKidSVG, PetalAdultSVG,
});
