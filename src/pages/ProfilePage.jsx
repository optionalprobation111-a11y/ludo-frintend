import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'
import { useUser } from '../context/UserContext.jsx'
import { getProfileStats } from '../services/api'

const TITLE_EMOJI = {
  'Ludo Rookie': '🌱',
  'Ludo Warrior': '⚔️',
  'Ludo Titan': '🔥',
  'Ludo Emperor': '👑',
  'Ludo Giant King': '🏆'
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { token, isAuthenticated, name } = useUser()

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    getProfileStats(token)
      .then(setStats)
      .catch((err) => setError(err.message || 'Could not load your profile.'))
      .finally(() => setLoading(false))
  }, [isAuthenticated, token, navigate])

  return (
    <div className="board-backdrop min-h-screen">
      <PageHeader showBack />
      <main className="mx-auto flex max-w-xl flex-col px-6 pb-16">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brass font-display text-2xl font-semibold text-ink">
            {(name || 'P')[0].toUpperCase()}
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold text-cream">{name || 'Player'}</h1>
            {stats?.unlocked && (
              <p className="text-sm text-brass">
                {TITLE_EMOJI[stats.title] || ''} {stats.title}
              </p>
            )}
          </div>
        </div>

        {loading && <p className="mt-10 text-muted">Loading your stats…</p>}
        {error && <p className="mt-10 text-token-red">{error}</p>}

        {stats && (
          <>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Games" value={stats.gamesPlayed} />
              <StatCard label="Wins" value={stats.wins} />
              <StatCard label="Losses" value={stats.losses} />
              <StatCard label="Win %" value={`${Math.round(stats.winPct ?? 0)}%`} />
            </div>

            {stats.unlocked ? (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatCard label="Risk-Taking Score" value={stats.riskScore} accent />
                <StatCard label="Decision Speed" value={stats.decisionSpeed} accent />
                <StatCard label="Ludo Skill Score" value={stats.skillScore} accent />
              </div>
            ) : (
              <div className="panel mt-6 flex flex-col items-center gap-2 px-6 py-10 text-center">
                <span className="text-3xl">🔒</span>
                <p className="text-sm text-muted">Play more to unlock your Ludo profile!</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
