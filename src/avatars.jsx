// Animal avatars — abstract, flat, friendly. No emoji.
// Each is a self-contained SVG component. They accept `size` and optional `bg`.

function AvatarFox({ size = 72, bg = '#FFE3D5', bgColor }) {
  var bgFill = bgColor !== undefined ? bgColor : bg;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill={bgFill}/>
      {/* ears */}
      <path d="M25 38 L32 22 L40 38 Z" fill="#FF8B5C"/>
      <path d="M75 38 L68 22 L60 38 Z" fill="#FF8B5C"/>
      <path d="M28 34 L33 26 L37 34 Z" fill="#FFBA9A"/>
      <path d="M72 34 L67 26 L63 34 Z" fill="#FFBA9A"/>
      {/* face */}
      <path d="M20 50 Q20 80 50 82 Q80 80 80 50 Q80 38 50 38 Q20 38 20 50 Z" fill="#FFA07A"/>
      <path d="M38 58 Q50 66 62 58 Q62 72 50 76 Q38 72 38 58 Z" fill="#FFF"/>
      {/* eyes */}
      <circle cx="40" cy="54" r="3.5" fill="#1F2A44"/>
      <circle cx="60" cy="54" r="3.5" fill="#1F2A44"/>
      <circle cx="41" cy="53" r="1" fill="#FFF"/>
      <circle cx="61" cy="53" r="1" fill="#FFF"/>
      {/* nose */}
      <ellipse cx="50" cy="64" rx="2.5" ry="1.8" fill="#1F2A44"/>
    </svg>
  );
}

function AvatarPanda({ size = 72, bg = '#EEE9FF', bgColor }) {
  var bgFill = bgColor !== undefined ? bgColor : bg;
  var uid = 'pg' + size;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id={uid} cx="45%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF"/>
          <stop offset="100%" stopColor="#EEE9FF"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill={bgFill}/>
      {/* ear depth shadows */}
      <circle cx="29" cy="33" r="9" fill="#1A1E2A"/>
      <circle cx="71" cy="33" r="9" fill="#1A1E2A"/>
      {/* ears */}
      <circle cx="28" cy="31" r="9" fill="#2A2F3E"/>
      <circle cx="72" cy="31" r="9" fill="#2A2F3E"/>
      {/* ear highlights */}
      <circle cx="26" cy="29" r="4" fill="#3D4457"/>
      <circle cx="70" cy="29" r="4" fill="#3D4457"/>
      {/* face with volume gradient */}
      <circle cx="50" cy="56" r="26" fill={'url(#' + uid + ')'}/>
      {/* face shadow bottom */}
      <ellipse cx="50" cy="75" rx="20" ry="8" fill="rgba(0,0,0,0.06)"/>
      {/* eye patches */}
      <ellipse cx="40" cy="52" rx="6.5" ry="7.5" fill="#1A1E2A" transform="rotate(-15 40 52)"/>
      <ellipse cx="60" cy="52" rx="6.5" ry="7.5" fill="#1A1E2A" transform="rotate(15 60 52)"/>
      <ellipse cx="40" cy="52" rx="6" ry="7" fill="#2A2F3E" transform="rotate(-15 40 52)"/>
      <ellipse cx="60" cy="52" rx="6" ry="7" fill="#2A2F3E" transform="rotate(15 60 52)"/>
      {/* eyes — iris */}
      <circle cx="40" cy="53" r="3" fill="#3B5BDB"/>
      <circle cx="60" cy="53" r="3" fill="#3B5BDB"/>
      {/* pupils */}
      <circle cx="40" cy="53" r="1.6" fill="#0F172A"/>
      <circle cx="60" cy="53" r="1.6" fill="#0F172A"/>
      {/* main glint */}
      <circle cx="41.5" cy="51.5" r="1.2" fill="#FFFFFF"/>
      <circle cx="61.5" cy="51.5" r="1.2" fill="#FFFFFF"/>
      {/* micro glint */}
      <circle cx="39" cy="54" r="0.5" fill="rgba(255,255,255,0.7)"/>
      <circle cx="59" cy="54" r="0.5" fill="rgba(255,255,255,0.7)"/>
      {/* cheek blush */}
      <circle cx="32" cy="62" r="5" fill="rgba(255,160,180,0.30)"/>
      <circle cx="68" cy="62" r="5" fill="rgba(255,160,180,0.30)"/>
      {/* nose */}
      <ellipse cx="50" cy="64" rx="3.5" ry="2.5" fill="#0F172A"/>
      <ellipse cx="50" cy="63.5" rx="2" ry="1.2" fill="#2A2F3E"/>
      <path d="M50 66.5 Q46 71 43.5 68.5" stroke="#0F172A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M50 66.5 Q54 71 56.5 68.5" stroke="#0F172A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function AvatarBunny({ size = 72, bg = '#FFE0EF', bgColor }) {
  var bgFill = bgColor !== undefined ? bgColor : bg;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill={bgFill}/>
      {/* ears */}
      <ellipse cx="38" cy="24" rx="6" ry="16" fill="#FFFFFF"/>
      <ellipse cx="62" cy="24" rx="6" ry="16" fill="#FFFFFF"/>
      <ellipse cx="38" cy="26" rx="3" ry="11" fill="#FF9ECD"/>
      <ellipse cx="62" cy="26" rx="3" ry="11" fill="#FF9ECD"/>
      {/* face */}
      <circle cx="50" cy="58" r="24" fill="#FFFFFF"/>
      {/* cheeks */}
      <circle cx="32" cy="62" r="5" fill="#FFC6DE"/>
      <circle cx="68" cy="62" r="5" fill="#FFC6DE"/>
      {/* eyes */}
      <circle cx="42" cy="54" r="3" fill="#1F2A44"/>
      <circle cx="58" cy="54" r="3" fill="#1F2A44"/>
      <circle cx="43" cy="53" r="1" fill="#FFF"/>
      <circle cx="59" cy="53" r="1" fill="#FFF"/>
      {/* nose */}
      <path d="M47 62 L53 62 L50 66 Z" fill="#FF9ECD"/>
      {/* teeth */}
      <rect x="47" y="66" width="3" height="5" fill="#FFF" stroke="#EEE" strokeWidth="0.5"/>
      <rect x="50" y="66" width="3" height="5" fill="#FFF" stroke="#EEE" strokeWidth="0.5"/>
    </svg>
  );
}

function AvatarOwl({ size = 72, bg = '#E3EAFF', bgColor }) {
  var bgFill = bgColor !== undefined ? bgColor : bg;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill={bgFill}/>
      {/* body */}
      <ellipse cx="50" cy="58" rx="28" ry="30" fill="#2563EB"/>
      {/* tufts */}
      <path d="M28 36 L22 22 L38 30 Z" fill="#1D4ED8"/>
      <path d="M72 36 L78 22 L62 30 Z" fill="#1D4ED8"/>
      {/* belly */}
      <ellipse cx="50" cy="68" rx="18" ry="18" fill="#BFDBFE"/>
      {/* eyes */}
      <circle cx="40" cy="50" r="10" fill="#FFFFFF"/>
      <circle cx="60" cy="50" r="10" fill="#FFFFFF"/>
      <circle cx="40" cy="52" r="5" fill="#1F2A44"/>
      <circle cx="60" cy="52" r="5" fill="#1F2A44"/>
      <circle cx="42" cy="50" r="2" fill="#FFF"/>
      <circle cx="62" cy="50" r="2" fill="#FFF"/>
      {/* beak */}
      <path d="M46 58 L54 58 L50 68 Z" fill="#FFD166"/>
    </svg>
  );
}

function AvatarCat({ size = 72, bg = '#F5F3FF', bgColor }) {
  var bgFill = bgColor !== undefined ? bgColor : bg;
  var uid = 'cg' + size;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id={uid} cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#A78BFA"/>
          <stop offset="100%" stopColor="#7C3AED"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill={bgFill}/>
      {/* ear shadows */}
      <path d="M23 41 L27 19 L42 35 Z" fill="#5B21B6"/>
      <path d="M77 41 L73 19 L58 35 Z" fill="#5B21B6"/>
      {/* outer ears */}
      <path d="M22 40 L26 18 L41 34 Z" fill="#7C3AED"/>
      <path d="M78 40 L74 18 L59 34 Z" fill="#7C3AED"/>
      {/* inner ear highlights */}
      <path d="M27 36 L29 23 L37 33 Z" fill="#8B5CF6"/>
      <path d="M73 36 L71 23 L63 33 Z" fill="#8B5CF6"/>
      {/* face with radial gradient for volume */}
      <circle cx="50" cy="56" r="26" fill={'url(#' + uid + ')'}/>
      {/* face bottom shadow */}
      <ellipse cx="50" cy="75" rx="20" ry="7" fill="rgba(0,0,0,0.10)"/>
      {/* muzzle */}
      <ellipse cx="50" cy="67" rx="14" ry="9" fill="rgba(255,255,255,0.22)"/>
      {/* eyes — iris (amber/gold for contrast on purple) */}
      <ellipse cx="40" cy="52" rx="4" ry="5.5" fill="#F59E0B"/>
      <ellipse cx="60" cy="52" rx="4" ry="5.5" fill="#F59E0B"/>
      {/* pupils */}
      <ellipse cx="40" cy="52" rx="2" ry="4" fill="#0F172A"/>
      <ellipse cx="60" cy="52" rx="2" ry="4" fill="#0F172A"/>
      {/* main glint */}
      <circle cx="41.5" cy="50" r="1.4" fill="#FFFFFF"/>
      <circle cx="61.5" cy="50" r="1.4" fill="#FFFFFF"/>
      {/* micro glint */}
      <circle cx="39" cy="53.5" r="0.6" fill="rgba(255,255,255,0.8)"/>
      <circle cx="59" cy="53.5" r="0.6" fill="rgba(255,255,255,0.8)"/>
      {/* nose — triangle */}
      <path d="M47.5 62 L52.5 62 L50 65.5 Z" fill="#F472B6"/>
      <path d="M48.5 62.5 L51.5 62.5 L50 64.5 Z" fill="#EC4899"/>
      {/* cheek blush */}
      <circle cx="32" cy="63" r="5.5" fill="rgba(251,207,232,0.45)"/>
      <circle cx="68" cy="63" r="5.5" fill="rgba(251,207,232,0.45)"/>
      {/* whiskers — 3 per side */}
      <line x1="22" y1="63" x2="36" y2="64" stroke="rgba(255,255,255,0.40)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="22" y1="67" x2="36" y2="66.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="22" y1="71" x2="36" y2="69" stroke="rgba(255,255,255,0.30)" strokeWidth="1" strokeLinecap="round"/>
      <line x1="78" y1="63" x2="64" y2="64" stroke="rgba(255,255,255,0.40)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="78" y1="67" x2="64" y2="66.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="78" y1="71" x2="64" y2="69" stroke="rgba(255,255,255,0.30)" strokeWidth="1" strokeLinecap="round"/>
      {/* mouth */}
      <path d="M46 67 Q50 71 54 67" stroke="rgba(255,255,255,0.50)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function AvatarFrog({ size = 72, bg = '#D7F5E8', bgColor }) {
  var bgFill = bgColor !== undefined ? bgColor : bg;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill={bgFill}/>
      {/* eye bumps */}
      <circle cx="34" cy="36" r="14" fill="#8EE3C3"/>
      <circle cx="66" cy="36" r="14" fill="#8EE3C3"/>
      {/* head */}
      <ellipse cx="50" cy="60" rx="30" ry="24" fill="#8EE3C3"/>
      {/* belly */}
      <ellipse cx="50" cy="72" rx="20" ry="12" fill="#C9F2DF"/>
      {/* eyes */}
      <circle cx="34" cy="36" r="7" fill="#FFFFFF"/>
      <circle cx="66" cy="36" r="7" fill="#FFFFFF"/>
      <circle cx="34" cy="38" r="3.5" fill="#1F2A44"/>
      <circle cx="66" cy="38" r="3.5" fill="#1F2A44"/>
      {/* smile */}
      <path d="M36 62 Q50 74 64 62" stroke="#2E9C75" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* cheeks */}
      <circle cx="30" cy="62" r="3" fill="#FFC6DE" opacity="0.7"/>
      <circle cx="70" cy="62" r="3" fill="#FFC6DE" opacity="0.7"/>
    </svg>
  );
}

const AVATARS = [
  { id: 'fox', name: 'Fennec', Component: AvatarFox, bg: '#FFE3D5' },
  { id: 'panda', name: 'Pip', Component: AvatarPanda, bg: '#EEE9FF' },
  { id: 'bunny', name: 'Biscuit', Component: AvatarBunny, bg: '#FFE0EF' },
  { id: 'owl', name: 'Sage', Component: AvatarOwl, bg: '#E3EAFF' },
  { id: 'cat', name: 'Moxie', Component: AvatarCat, bg: '#FFF2CE' },
  { id: 'frog', name: 'Hoppy', Component: AvatarFrog, bg: '#D7F5E8' },
];

// "Flat geometric" variant — just a colored blob with initial letter
// (alternate avatar style shown when tweak.avatarStyle === 'geo')
function AvatarGeo({ size = 72, bg = '#6C8EFF', bgColor, letter = 'A' }) {
  var bgFill = bgColor !== undefined ? bgColor : bg;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill={bgFill}/>
      <text x="50" y="62" textAnchor="middle" fontFamily="Nunito, system-ui" fontWeight="900" fontSize="44" fill="white">{letter}</text>
    </svg>
  );
}

function Avatar({ id, size = 72, style = 'animal' }) {
  const a = AVATARS.find(x => x.id === id) || AVATARS[0];
  if (style === 'geo') {
    return <AvatarGeo size={size} bg={a.bg === '#FFE3D5' ? '#FFA07A' : a.bg === '#EEE9FF' ? '#C7B4FF' : a.bg === '#FFE0EF' ? '#FF9ECD' : a.bg === '#E3EAFF' ? '#6C8EFF' : a.bg === '#FFF2CE' ? '#FFD166' : '#8EE3C3'} letter={a.name[0]} />;
  }
  const C = a.Component;
  return <C size={size} bg={a.bg} />;
}

var HAT_OFFSETS  = { party: -0.22, flowers: -0.18, cowboy: -0.20, wizard: -0.26, crown: -0.20, helmet: -0.18 };
var ACC_OFFSETS  = { glasses: 0.28, bowtie: 0.58, scarf: 0.52, medal: 0.60, heart: 0.55, star: 0.58 };

function DressedAvatar({ id, size = 72, style = 'animal', equipped = {} }) {
  var bgItem = equipped.bg ? (window.SHOP_ITEMS || []).find(function(it) { return it.id === equipped.bg; }) : null;
  var ring = bgItem ? bgItem.ring : null;
  var hatItem = equipped.hat ? (window.SHOP_ITEMS || []).find(function(it) { return it.id === equipped.hat; }) : null;
  var accItem = equipped.acc ? (window.SHOP_ITEMS || []).find(function(it) { return it.id === equipped.acc; }) : null;

  var hatOffset  = equipped.hat ? (HAT_OFFSETS[equipped.hat]  || -0.2)  : 0;
  var accOffset  = equipped.acc ? (ACC_OFFSETS[equipped.acc]  || 0.55)  : 0;

  return (
    <div style={{
      position: 'relative', display: 'inline-block',
      width: size, height: size,
      borderRadius: '50%',
      boxShadow: ring ? ('0 0 0 3px ' + ring + ', 0 0 0 6px ' + ring + '33') : 'none',
    }}>
      <Avatar id={id} size={size} style={style}/>
      {hatItem && (
        <div style={{
          position: 'absolute', left: '50%',
          top: Math.round(size * hatOffset),
          transform: 'translateX(-50%)',
          fontSize: Math.round(size * 0.42),
          lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
        }}>{hatItem.emoji}</div>
      )}
      {accItem && (
        <div style={{
          position: 'absolute', left: '50%',
          top: Math.round(size * accOffset),
          transform: 'translateX(-50%)',
          fontSize: Math.round(size * 0.32),
          lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
        }}>{accItem.emoji}</div>
      )}
    </div>
  );
}

Object.assign(window, { AVATARS, Avatar, DressedAvatar, AvatarFox, AvatarPanda, AvatarBunny, AvatarOwl, AvatarCat, AvatarFrog, AvatarGeo });
