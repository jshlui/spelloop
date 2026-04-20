// Animal avatars — abstract, flat, friendly. No emoji.
// Each is a self-contained SVG component. They accept `size` and optional `bg`.

function AvatarFox({ size = 72, bg = '#FFE3D5' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill={bg}/>
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

function AvatarPanda({ size = 72, bg = '#EEE9FF' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill={bg}/>
      {/* ears */}
      <circle cx="28" cy="32" r="9" fill="#2A2F3E"/>
      <circle cx="72" cy="32" r="9" fill="#2A2F3E"/>
      {/* face */}
      <circle cx="50" cy="56" r="26" fill="#FFFFFF"/>
      {/* eye patches */}
      <ellipse cx="40" cy="52" rx="6" ry="7" fill="#2A2F3E" transform="rotate(-15 40 52)"/>
      <ellipse cx="60" cy="52" rx="6" ry="7" fill="#2A2F3E" transform="rotate(15 60 52)"/>
      {/* eyes */}
      <circle cx="40" cy="53" r="2.5" fill="#FFF"/>
      <circle cx="60" cy="53" r="2.5" fill="#FFF"/>
      <circle cx="40" cy="53" r="1.2" fill="#1F2A44"/>
      <circle cx="60" cy="53" r="1.2" fill="#1F2A44"/>
      {/* nose */}
      <ellipse cx="50" cy="64" rx="3" ry="2" fill="#1F2A44"/>
      <path d="M50 66 Q46 70 44 68" stroke="#1F2A44" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M50 66 Q54 70 56 68" stroke="#1F2A44" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function AvatarBunny({ size = 72, bg = '#FFE0EF' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill={bg}/>
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

function AvatarOwl({ size = 72, bg = '#E3EAFF' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill={bg}/>
      {/* body */}
      <ellipse cx="50" cy="58" rx="28" ry="30" fill="#6C8EFF"/>
      {/* tufts */}
      <path d="M28 36 L22 22 L38 30 Z" fill="#3F5FE2"/>
      <path d="M72 36 L78 22 L62 30 Z" fill="#3F5FE2"/>
      {/* belly */}
      <ellipse cx="50" cy="68" rx="18" ry="18" fill="#C7D2FF"/>
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

function AvatarCat({ size = 72, bg = '#FFF2CE' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill={bg}/>
      {/* ears */}
      <path d="M22 40 L26 20 L40 34 Z" fill="#C7B4FF"/>
      <path d="M78 40 L74 20 L60 34 Z" fill="#C7B4FF"/>
      <path d="M26 36 L28 24 L36 34 Z" fill="#FFC6DE"/>
      <path d="M74 36 L72 24 L64 34 Z" fill="#FFC6DE"/>
      {/* face */}
      <circle cx="50" cy="56" r="26" fill="#C7B4FF"/>
      {/* muzzle */}
      <ellipse cx="50" cy="66" rx="14" ry="9" fill="#FFFFFF"/>
      {/* eyes */}
      <ellipse cx="40" cy="52" rx="3" ry="4.5" fill="#1F2A44"/>
      <ellipse cx="60" cy="52" rx="3" ry="4.5" fill="#1F2A44"/>
      <circle cx="41" cy="51" r="1" fill="#FFF"/>
      <circle cx="61" cy="51" r="1" fill="#FFF"/>
      {/* nose */}
      <path d="M47 62 L53 62 L50 66 Z" fill="#FF9ECD"/>
      {/* whiskers */}
      <line x1="26" y1="66" x2="36" y2="65" stroke="#8a7cc4" strokeWidth="1"/>
      <line x1="26" y1="70" x2="36" y2="68" stroke="#8a7cc4" strokeWidth="1"/>
      <line x1="74" y1="66" x2="64" y2="65" stroke="#8a7cc4" strokeWidth="1"/>
      <line x1="74" y1="70" x2="64" y2="68" stroke="#8a7cc4" strokeWidth="1"/>
      {/* smile */}
      <path d="M45 68 Q50 72 55 68" stroke="#1F2A44" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function AvatarFrog({ size = 72, bg = '#D7F5E8' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill={bg}/>
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
function AvatarGeo({ size = 72, bg = '#6C8EFF', letter = 'A' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill={bg}/>
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

Object.assign(window, { AVATARS, Avatar, AvatarFox, AvatarPanda, AvatarBunny, AvatarOwl, AvatarCat, AvatarFrog, AvatarGeo });
