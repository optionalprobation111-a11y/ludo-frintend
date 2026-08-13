import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import DiceRoller from '../components/DiceRoller.jsx'
import Token from '../components/Token.jsx'
import { buildBoard } from '../utils/boardLayout'
import { useSocket } from '../hooks/useSocket'
import { joinRoom, rollDice, moveToken, onGameState, onGameOver } from '../services/socket'
import { submitGameResult } from '../services/api'
import { useUser } from '../context/UserContext.jsx'

const COLOR_LABEL = { red: 'Red', green: 'Green', yellow: 'Yellow', blue: 'Blue' }

// `opponents` is a list of { name, color } for display only. `roomId` may be
// a friend-play room or an ad-hoc room generated for a solo bot match — in
// both cases the backend is the sole source of truth for dice + legality,
// pushed to the client via the `game:state` / `game:over` socket events.
export default function GameBoard({ mode = 'multiplayer', roomId: roomIdProp, opponents = [], onExit }) {
  const navigate = useNavigate()
  const params = useParams()
  const roomId = roomIdProp || params.roomId
  const { token, anonId } = useUser()

  const cells = useMemo(() => buildBoard(), [])
  const [diceValue, setDiceValue] = useState(1)
  const [currentTurn, setCurrentTurn] = useState(null)
  const [boardState, setBoardState] = useState({})
  const [winner, setWinner] = useState(null)
  const [rolling, setRolling] = useState(false)

  useSocket({ enabled: Boolean(roomId) })

  useEffect(() => {
    if (!roomId) return undefined
    joinRoom({ roomId, token })

    const offState = onGameState(({ boardState: bs, currentTurn: turn, diceValue: dv }) => {
      setBoardState(bs || {})
      setCurrentTurn(turn ?? null)
      if (typeof dv === 'number') setDiceValue(dv)
      setRolling(false)
    })

    const offOver = onGameOver(async ({ winnerName }) => {
      setWinner(winnerName)
      try {
        await submitGameResult({
          token: token || undefined,
          anonId: !token ? anonId : undefined,
          roomId,
          won: false, // authoritative win/loss for "you" comes from the backend-driven UI, not guessed client-side
          moveStats: {}
        })
      } catch {
        // non-blocking — result submission failing shouldn't trap the player on this screen
      }
    })

    return () => {
      offState()
      offOver()
    }
  }, [roomId, token, anonId])

  const handleRoll = () => {
    if (!roomId) return
    setRolling(true)
    rollDice({ roomId })
  }

  const handleTokenMove = (tokenId, targetCell) => {
    if (!roomId) return
    moveToken({ roomId, tokenId, targetCell })
  }

  return (
    <div className="board-backdrop min-h-screen">
      <PageHeader showBack />

      <main className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 pb-16">
        <div className="flex w-full flex-wrap items-center justify-center gap-3">
          {opponents.map((o) => (
            <span
              key={o.name}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium
                ${currentTurn === o.name ? 'border-brass text-brass' : 'border-hairline text-muted'}`}
            >
              {o.name}
            </span>
          ))}
        </div>

        <div className="panel aspect-square w-full max-w-[560px] overflow-hidden p-2">
          <div className="grid h-full w-full grid-cols-[repeat(15,1fr)] grid-rows-[repeat(15,1fr)] gap-[1px]">
            {cells.map((cell) => (
              <BoardCellRender
                key={`${cell.row}-${cell.col}`}
                cell={cell}
                tokens={boardState[`${cell.row},${cell.col}`]}
                onTokenClick={handleTokenMove}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <DiceRoller
            value={diceValue}
            onRoll={handleRoll}
            rolling={rolling}
            disabled={!roomId || Boolean(winner)}
          />
          <p className="text-sm text-muted">
            {winner ? 'Game over' : currentTurn ? `${currentTurn}'s turn` : 'Waiting for the table…'}
          </p>
        </div>
      </main>

      {winner && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-ink/80 p-6 backdrop-blur-sm">
          <div className="panel w-full max-w-sm animate-rise-in p-8 text-center">
            <span className="text-4xl">🏆</span>
            <h2 className="mt-4 font-display text-2xl font-semibold text-cream">{winner} wins!</h2>
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setWinner(null)
                  onExit ? onExit() : navigate(mode === 'multiplayer' ? '/play/friends' : '/play/random')
                }}
              >
                Play Again
              </button>
              <button type="button" className="btn-ghost" onClick={() => navigate('/')}>
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const YARD_BG = {
  red: 'bg-token-red/10',
  green: 'bg-token-green/10',
  yellow: 'bg-token-yellow/10',
  blue: 'bg-token-blue/10'
}

const LANE_BG = {
  red: 'bg-token-red/25',
  green: 'bg-token-green/25',
  yellow: 'bg-token-yellow/25',
  blue: 'bg-token-blue/25'
}

function BoardCellRender({ cell, tokens = [], onTokenClick }) {
  const bg =
    cell.type === 'center'
      ? 'bg-[conic-gradient(from_0deg,theme(colors.token.red),theme(colors.token.green),theme(colors.token.blue),theme(colors.token.yellow))] opacity-80'
      : cell.type === 'yard'
        ? YARD_BG[cell.yardColor]
        : cell.homeLaneColor
          ? LANE_BG[cell.homeLaneColor]
          : 'bg-surface/60'

  return (
    <div className={`relative flex items-center justify-center border border-hairline/40 ${bg}`}>
      {cell.safe && cell.type === 'path' && (
        <span className="absolute h-1.5 w-1.5 rounded-full bg-brass/70" />
      )}
      <div className="flex flex-wrap items-center justify-center gap-[1px]">
        {(tokens || []).map((t) => (
          <Token
            key={t.tokenId}
            color={t.color}
            active={t.movable}
            onClick={() => onTokenClick(t.tokenId, t.targetCell)}
          />
        ))}
      </div>
    </div>
  )
}
