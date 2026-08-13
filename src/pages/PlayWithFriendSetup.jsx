import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import InviteRow from '../components/InviteRow.jsx'
import { useUser } from '../context/UserContext.jsx'
import { createRoom, sendInvite } from '../services/api'
import { useSocket } from '../hooks/useSocket'
import { onPlayerJoined, setTotalPlayers } from '../services/socket'

export default function PlayWithFriendSetup() {
  const navigate = useNavigate()
  const { token, isAuthenticated } = useUser()

  const [friendCount, setFriendCount] = useState(null)
  const [roomId, setRoomId] = useState(null)
  const [statuses, setStatuses] = useState({})
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
  }, [isAuthenticated, navigate])

  useSocket({ enabled: Boolean(roomId) })

  useEffect(() => {
    if (!roomId) return undefined
    return onPlayerJoined(({ playerName }) => {
      setStatuses((prev) => {
        const next = { ...prev }
        for (const key of Object.keys(next)) {
          if (next[key] === 'waiting') {
            next[key] = 'joined'
            break
          }
        }
        return next
      })
    })
  }, [roomId])

  const chooseFriendCount = async (n) => {
    setFriendCount(n)
    setCreatingRoom(true)
    setError('')
    try {
      const { roomId: newRoomId } = await createRoom({ token, totalPlayers: n + 1 })
      setRoomId(newRoomId)
      setStatuses(Object.fromEntries(Array.from({ length: n }, (_, i) => [i, 'idle'])))
      // Backend ko totalPlayers batana zaroori hai multiplayer room start ke liye
      setTotalPlayers({ roomId: newRoomId, totalPlayers: n + 1 })
    } catch (err) {
      setError(err.message || 'Could not create a table. Try again.')
    } finally {
      setCreatingRoom(false)
    }
  }

  const handleInvite = async (index, friendPhone) => {
    setStatuses((prev) => ({ ...prev, [index]: 'sending' }))
    try {
      await sendInvite({ token, roomId, friendPhone })
      setStatuses((prev) => ({ ...prev, [index]: 'waiting' }))
    } catch {
      setStatuses((prev) => ({ ...prev, [index]: 'idle' }))
    }
  }

  const allJoined =
    friendCount !== null &&
    Object.values(statuses).length === friendCount &&
    Object.values(statuses).every((s) => s === 'joined')

  return (
    <div className="board-backdrop min-h-screen">
      <PageHeader showBack />
      <main className="mx-auto flex max-w-lg flex-col px-6 pb-16 pt-6">
        <h1 className="font-display text-3xl font-semibold text-cream">Set up your table</h1>

        {friendCount === null ? (
          <>
            <p className="mt-2 text-sm text-muted">How many friends do you want to play with?</p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => chooseFriendCount(n)}
                  disabled={creatingRoom}
                  className="panel flex flex-col items-center gap-1 px-6 transition-all hover:border-brass/50 disabled:opacity-50"
                >
                  <span className="font-display text-3xl font-semibold text-cream">{n}</span>
                  <span className="text-xs text-muted">{n === 1 ? 'friend' : 'friends'}</span>
                </button>
              ))}
            </div>
            {error && <p className="mt-4 text-sm text-token-red">{error}</p>}
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted">
              Send an invite to each friend – they&rsquo;ll join this table the moment they verify.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {Array.from({ length: friendCount }, (_, i) => (
                <InviteRow
                  key={i}
                  index={i + 1}
                  status={statuses[i] || 'idle'}
                  onInvite={(phone) => handleInvite(i, phone)}
                />
              ))}
            </div>
            <button
              type="button"
              disabled={!allJoined}
              onClick={() => navigate(`/room/${roomId}`)}
              className="btn-primary mt-8"
            >
              {allJoined ? 'Start Game' : 'Waiting for everyone to join…'}
            </button>
          </>
        )}
      </main>
    </div>
  )
}