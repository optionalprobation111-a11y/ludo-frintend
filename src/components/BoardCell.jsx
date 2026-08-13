const COLOR_MAP = {
  red: 'bg-token-red/20 border-token-red/40',
  green: 'bg-token-green/20 border-token-green/40',
  yellow: 'bg-token-yellow/20 border-token-yellow/40',
  blue: 'bg-token-blue/20 border-token-blue/40'
}

export default function BoardCell({ safe = false, homeColor = null, children }) {
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center gap-0.5 border
        ${homeColor ? COLOR_MAP[homeColor] : 'border-hairline/60 bg-surface/60'}`}
    >
      {safe && (
        <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brass/70" />
      )}
      <div className="flex flex-wrap items-center justify-center gap-0.5">{children}</div>
    </div>
  )
}
