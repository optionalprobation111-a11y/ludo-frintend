import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext.jsx'

export default function PageHeader({ showBack = false }) {
  const navigate = useNavigate()
  const { isAuthenticated, name } = useUser()

  return (
    <header className="flex items-center justify-between px-6 py-5 sm:px-10">
      <div className="flex items-center gap-4">
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-cream
              transition-colors hover:border-brass/60"
          >
            ←
          </button>
        )}
        <Link to="/" className="font-display text-xl font-semibold tracking-tight text-cream">
          Ludo<span className="text-brass">.</span>
        </Link>
      </div>

      {isAuthenticated && (
        <Link
          to="/profile"
          className="flex items-center gap-2 rounded-full border border-hairline bg-raised/60 py-1.5 pl-1.5 pr-4
            transition-colors hover:border-brass/60"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brass font-display text-sm font-semibold text-ink">
            {(name || 'P')[0].toUpperCase()}
          </span>
          <span className="text-sm font-medium text-cream">{name || 'Profile'}</span>
        </Link>
      )}
    </header>
  )
}
