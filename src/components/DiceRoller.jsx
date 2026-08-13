import { useState } from 'react'

const PIP_LAYOUTS = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]]
}

export default function DiceRoller({ value = 1, onRoll, disabled, rolling }) {
  const [justRolled, setJustRolled] = useState(false)

  const handleClick = () => {
    if (disabled) return
    setJustRolled(true)
    onRoll?.()
    setTimeout(() => setJustRolled(false), 600)
  }

  const pips = PIP_LAYOUTS[value] || PIP_LAYOUTS[1]

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={`Roll dice. Current value ${value}.`}
      className={`relative h-16 w-16 rounded-2xl bg-cream shadow-glow transition-transform
        disabled:opacity-40 disabled:cursor-not-allowed
        ${!disabled ? 'hover:scale-105 active:scale-95' : ''}
        ${justRolled || rolling ? 'animate-dice-tumble' : ''}`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full p-2">
        {pips.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="8" className="fill-ink" />
        ))}
      </svg>
    </button>
  )
}
