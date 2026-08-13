const COLOR_MAP = {
  red: 'from-[#E53935] to-[#B71C1C]',
  green: 'from-[#43A047] to-[#1B5E20]',
  yellow: 'from-[#FDD835] to-[#F9A825]',
  blue: 'from-[#1E88E5] to-[#0D47A1]'
}

export default function Token({ color = 'red', active = false, onClick, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!active}
      style={style}
      aria-label={`${color} token${active? ', movable' : ''}`}
      className={`relative h-8 w-8 rounded-full border-[3px] border-white
        bg-gradient-to-br ${COLOR_MAP[color]}
        shadow-[0_5px_10px_rgba(0,0,0,0.5),inset_0_2px_3px_rgba(255,255,255,0.4)]
        transition-all duration-200
        ${active? 'cursor-pointer hover:scale-125 animate-pulse ring-2 ring-[#FFD700] ring-offset-1 ring-offset-[#0B0F1A]' : 'cursor-default opacity-90'}`}
    >
      {/* Upper shine */}
      <span className="absolute top-[2px] left-[3px] h-3 w-3 rounded-full bg-white/40 blur-[1px]" />
      {/* Center dot */}
      <span className="absolute inset-[4px] rounded-full bg-black/10" />
    </button>
  )
}