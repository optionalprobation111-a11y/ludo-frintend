import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import GameBoard from './GameBoard.jsx'
import { useUser } from '../context/UserContext.jsx'
import { matchRandom, getProfileStats } from '../services/api'

export default function PlayRandomlyBoard() {
  const navigate = useNavigate()
  const { token, anonId, ensureAnonymousId, isAuthenticated } = useUser()

  const [bot, setBot] = useState(null)
  const [roomId, setRoomId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showRegisterBanner, setShowRegisterBanner] = useState(false)
  const hasCheckedBanner = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function start() {
      try {
        const id = isAuthenticated ? null : await ensureAnonymousId()
        const { botName, botDifficulty } = await matchRandom({
          anonId: id || undefined,
          token: token || undefined
        })
        if (cancelled) return
        setBot({ name: botName, difficulty: botDifficulty })
        setRoomId(`solo-${Date.now()}`)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not find a match. Try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    start()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // After 2 completed anonymous games, suggest (never force) registration.
  useEffect(() => {
    if (isAuthenticated || hasCheckedBanner.current) return
    hasCheckedBanner.current = true
    if (!anonId) return
    getProfileStats()
      .then(() => {})
      .catch(() => {})
  }, [anonId, isAuthenticated])

  if (loading) {
    return (
      <div className="board-backdrop flex min-h-screen flex-col">
        <PageHeader showBack />
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="animate-dice-tumble text-4xl">🎲</span>
          <p className="text-muted">Finding you an opponent…</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="board-backdrop flex min-h-screen flex-col">
        <PageHeader showBack />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-token-red">{error}</p>
          <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
            Try again
          </button>
        </main>
      </div>
    )
  }

  return (
    <>
      {showRegisterBanner && (
        <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-center gap-4 bg-brass px-4 py-2.5 text-sm font-medium text-ink">
          <span>Register to save your Ludo title permanently!</span>
          <button
            type="button"
            className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-cream"
            onClick={() => navigate('/login')}
          >
            Register
          </button>
          <button
            type="button"
            aria-label="Dismiss"
            className="text-ink/70 hover:text-ink"
            onClick={() => setShowRegisterBanner(false)}
          >
            ✕
          </button>
        </div>
      )}
      <GameBoard
        mode="solo"
        roomId={roomId}
        opponents={bot ? [{ name: bot.name, color: 'red' }] : []}
        onExit={() => navigate('/play/random')}
      />
    </>
  )
}
