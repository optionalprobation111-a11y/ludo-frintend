const COLOR_MAP = {
  red: {
    fill: 'fill-red-400', // LIGHT - board dark hai isliye
    stroke: 'stroke-red-200',
    glow: 'drop-shadow-[0_0_12px_rgba(248,113,113,0.9)]'
  },
  green: {
    fill: 'fill-green-400', // LIGHT
    stroke: 'stroke-green-200',
    glow: 'drop-shadow-[0_0_12px_rgba(74,222,128,0.9)]'
  },
  yellow: {
    fill: 'fill-yellow-300', // LIGHT
    stroke: 'stroke-yellow-100',
    glow: 'drop-shadow-[0_0_12px_rgba(253,224,71,0.9)]'
  },
  blue: {
    fill: 'fill-blue-400', // LIGHT
    stroke: 'stroke-blue-200',
    glow: 'drop-shadow-[0_0_12px_rgba(96,165,250,0.9)]'
  }
}

const LETTER_MAP = { red: 'R', green: 'G', yellow: 'Y', blue: 'B' }

export default function Token({ color = 'red', active = false, onClick, style }) {
  const c = COLOR_MAP[color] || COLOR_MAP.red

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!active}
      style={style}
      aria-label={`${color} token${active? ', movable' : ''}`}
      className={`relative w-6 h-7
        ${active? `cursor-pointer ${c.glow} animate-pulse` : 'cursor-default opacity-95'}
        transition-transform duration-200 ${active? 'hover:scale-110 active:scale-95' : ''}`}
    >
      {/* Cone/Sankua Shape - SVG */}
      <svg viewBox="0 0 24 28" className="w-full h-full">
        {/* Cone body */}
        <path
          d="M12 1 L23 26 L1 26 Z"
          className={`${c.fill} ${c.stroke}`}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Base ellipse */}
        <ellipse
          cx="12"
          cy="25.5"
          rx="9.5"
          ry="2"
          className={`${c.fill} ${c.stroke}`}
          strokeWidth="1"
        />
        {/* Top highlight for 3D effect */}
        <ellipse
          cx="12"
          cy="8"
          rx="3"
          ry="1.5"
          fill="white"
          opacity="0.4"
        />
      </svg>

      {/* Letter beech me - BLACK taaki light token pe clear dikhe */}
      <span className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2
        text-[9px] font-black text-black drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] pointer-events-none select-none">
        {LETTER_MAP[color]}
      </span>

      {/* Active ring animation */}
      {active && (
        <span className="absolute -inset-1 rounded-full border-2 border-white/60 animate-ping pointer-events-none" />
      )}
    </button>
  )
}