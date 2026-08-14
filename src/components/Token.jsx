const COLORS = {
  red: 'bg-red-500 border-red-300',
  green: 'bg-green-500 border-green-300',
  yellow: 'bg-yellow-400 border-yellow-200',
  blue: 'bg-blue-500 border-blue-300'
}

export default function Token({ color = 'red', active = false, onClick, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!active}
      style={style}
      className={`relative w-10 h-10 rounded-full ${COLORS[color]} border-4
        shadow-[0_3px_6px_rgba(0,0,0,0.5)]
        ${active? 'cursor-pointer ring-2 ring-white animate-pulse' : 'cursor-default opacity-90'}`}
    >
      <span className="absolute top-1 left-2 w-3 h-3 rounded-full bg-white/40" />
    </button>
  )
}