const COLOR_MAP = {
  red: 'bg-token-red',
  green: 'bg-token-green',
  yellow: 'bg-token-yellow',
  blue: 'bg-token-blue'
}

export default function Token({ color = 'red', active = false, onClick, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!active}
      style={style}
      aria-label={`${color} token${active ? ', movable' : ''}`}
      className={`relative h-6 w-6 rounded-full border-2 border-ink/40 ${COLOR_MAP[color]}
        shadow-[0_2px_6px_rgba(0,0,0,0.5)] transition-transform
        ${active ? 'cursor-pointer hover:scale-125 animate-pulse-ring' : 'cursor-default opacity-90'}`}
    >
      <span className="absolute inset-1 rounded-full bg-white/25" />
    </button>
  )
}
