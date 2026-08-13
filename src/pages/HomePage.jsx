import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import { useUser } from '../context/UserContext.jsx'

const CORNER_COLORS = [
  { pos: 'left-6 top-6 sm:left-10 sm:top-10', color: 'bg-token-red' },
  { pos: 'right-6 top-6 sm:right-10 sm:top-10', color: 'bg-token-green' },
  { pos: 'left-6 bottom-6 sm:left-10 sm:bottom-10', color: 'bg-token-yellow' },
  { pos: 'right-6 bottom-6 sm:right-10 sm:bottom-10', color: 'bg-token-blue' }
]

export default function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useUser()

  return (
    <div className="board-backdrop relative min-h-screen overflow-hidden">
      {CORNER_COLORS.map((c, i) => (
        <span
          key={i}
          className={`pointer-events-none absolute h-2.5 w-2.5 rounded-full ${c.pos} ${c.color} opacity-70`}
        />
      ))}

      <PageHeader />

      <main className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pb-24 pt-12 text-center sm:pt-20">
        {/* Signature element: a rotated home-stretch cross, referencing the Ludo board's centre */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 opacity-[0.14] sm:h-[560px] sm:w-[560px]">
          <div className="absolute left-1/2 top-1/2 h-full w-24 -translate-x-1/2 -translate-y-1/2 rotate-45 border-x border-brass" />
          <div className="absolute left-1/2 top-1/2 h-full w-24 -translate-x-1/2 -translate-y-1/2 -rotate-45 border-x border-brass" />
        </div>

        <span className="relative z-10 mb-5 rounded-full border border-hairline px-4 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-muted">
          Free forever · No wallet · No ads
        </span>

        <h1 className="relative z-10 font-display text-5xl font-semibold leading-[1.05] text-cream sm:text-7xl">
          Roll the dice.
          <br />
          <span className="text-brass">Race your friends home.</span>
        </h1>

        <p className="relative z-10 mt-5 max-w-md text-base text-muted sm:text-lg">
          A clean, distraction-free Ludo table. Play a quick solo round, or bring
          three friends to the board — no login until you actually need one.
        </p>

        <div className="relative z-10 mt-12 grid w-full max-w-2xl gap-5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate('/play/random')}
            className="panel group flex flex-col items-start gap-4 p-7 text-left transition-all hover:border-brass/50 hover:shadow-glow"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-token-yellow/15 text-2xl">
              🎲
            </span>
            <span className="font-display text-2xl font-semibold text-cream">Play Randomly</span>
            <span className="text-sm text-muted">
              Jump straight into a solo match against a matched opponent. No sign-up.
            </span>
            <span className="mt-auto text-sm font-semibold text-brass group-hover:text-brass-bright">
              Start now →
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate(isAuthenticated ? '/play/friends' : '/login')}
            className="panel group flex flex-col items-start gap-4 p-7 text-left transition-all hover:border-brass/50 hover:shadow-glow"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-token-blue/15 text-2xl">
              👥
            </span>
            <span className="font-display text-2xl font-semibold text-cream">Play with Friends</span>
            <span className="text-sm text-muted">
              Invite up to three friends by number and start a shared table together.
            </span>
            <span className="mt-auto text-sm font-semibold text-brass group-hover:text-brass-bright">
              Set up a table →
            </span>
          </button>
        </div>
      </main>
    </div>
  )
}
