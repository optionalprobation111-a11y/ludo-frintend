const COLOR_MAP = {
  red: {
    gradient: 'bg-gradient-to-br from-red-400 via-red-600 to-red-800',
    glow: 'shadow-[0_0_15px_rgba(225,72,63,0.7)]',
    border: 'border-red-300/60'
  },
  green: {
    gradient: 'bg-gradient-to-br from-green-400 via-green-600 to-green-800',
    glow: 'shadow-[0_0_15px_rgba(47,166,106,0.7)]',
    border: 'border-green-300/60'
  },
  yellow: {
    gradient: 'bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700',
    glow: 'shadow-[0_0_15px_rgba(240,178,61,0.7)]',
    border: 'border-yellow-200/60'
  },
  blue: {
    gradient: 'bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800',
    glow: 'shadow-[0_0_15px_rgba(62,124,214,0.7)]',
    border: 'border-blue-300/60'
  }
}

export default function Token({ color = 'red', active = false, onClick, style }) {
  const tokenColors = COLOR_MAP[color] || COLOR_MAP.red

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!active}
      style={style}
      aria-label={`${color} token${active ? ', movable' : ''}`}
      className={`relative h-7 w-7 rounded-full border-2 ${tokenColors.border} ${tokenColors.gradient}
        ${active ? `cursor-pointer animate-pulse-ring ${tokenColors.glow}` : 'cursor-default opacity-90'}
        transition-transform duration-200 ${active ? 'hover:scale-125 active:scale-95' : ''}
        shadow-[0_4px_10px_rgba(0,0,0,0.5)]`}
    >
      {/* Inner glossy highlight */}
      <span className="absolute inset-1 rounded-full bg-gradient-to-b from-white/50 to-white/10" />
      {/* Center tiny dot for depth */}
      <span className="absolute inset-[35%] rounded-full bg-black/20 blur-[1px]" />
      {active && (
        <span className="absolute -inset-1 rounded-full border-2 border-white/40 animate-ping-slow" />
      )}
    </button>
  )
}