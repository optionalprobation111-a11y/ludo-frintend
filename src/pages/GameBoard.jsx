import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import DiceRoller from '../components/DiceRoller.jsx'
import Token from '../components/Token.jsx'
import { buildBoard, getCellForSteps } from '../utils/boardLayout'
import { useSocket } from '../hooks/useSocket'
import { joinRoom, rollDice, moveToken, onGameState, onGameOver } from '../services/socket'
import { submitGameResult } from '../services/api'
import { useUser } from '../context/UserContext.jsx'

export default function GameBoard({
  mode = 'multiplayer',
  roomId: roomIdProp,
  opponents = [],
  onExit,
  isSolo = false,
  botName,
  botDifficulty
}) {
  const navigate = useNavigate()
  const params = useParams()
  const roomId = roomIdProp || params.roomId
  const { token, anonId, name } = useUser()

  const cells = useMemo(() => buildBoard(), [])
  const [diceValue, setDiceValue] = useState(1)
  const [currentTurn, setCurrentTurn] = useState(null)
  const [boardState, setBoardState] = useState({})
  const [legalMoves, setLegalMoves] = useState([])
  const [winner, setWinner] = useState(null)
  const [rolling, setRolling] = useState(false)

  useSocket({ enabled: Boolean(roomId) })

  useEffect(() => {
    if (!roomId) return undefined

    joinRoom({
      roomId,
      token,
      name: name || (isSolo? 'You' : 'Player'),
      isSolo,
      botName,
      botDifficulty,
      anonId:!token? anonId : undefined
    })

    const offState = onGameState((state) => {
      const { tokens, currentTurn: turn, diceValue: dv, legalMoves: lm } = state || {}
      if (typeof dv === 'number') setDiceValue(dv)
      if (turn) setCurrentTurn(turn)
      if (Array.isArray(lm)) setLegalMoves(lm)

      if (tokens) {
        const mapped = {}
        Object.entries(tokens).forEach(([color, tokenList]) => {
          tokenList.forEach((t) => {
            const cell = getCellForSteps(color, t.steps)
            if (!cell) return
            const key = `${cell.row},${cell.col}`
            if (!mapped[key]) mapped[key] = []
            mapped[key].push({
              tokenId: t.id,
              color,
              movable: lm?.includes(t.id) && turn === color
            })
          })
        })
        setBoardState(mapped)
      }
      setRolling(false)
    })

    const offOver = onGameOver(async ({ winnerName }) => {
      setWinner(winnerName)
      try {
        await submitGameResult({
          token: token || undefined,
          anonId:!token? anonId : undefined,
          roomId,
          won: false,
          moveStats: {}
        })
      } catch {}
    })

    return () => {
      offState()
      offOver()
    }
  }, [roomId, token, anonId, name, isSolo, botName, botDifficulty, legalMoves])

  const handleRoll = () => {
    if (!roomId) return
    setRolling(true)
    rollDice({ roomId })
  }

  const handleTokenMove = (tokenId) => {
    if (!roomId) return
    moveToken({ roomId, tokenId })
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] py-6 px-2">
      <PageHeader showBack />

      <main className="mx-auto flex max-w-4xl flex-col items-center gap-6">
        <div className="flex w-full flex-wrap items-center justify-center gap-3">
          {opponents.map((o) => (
            <span
              key={o.name}
              className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold
                ${
                  currentTurn === o.name
                  ? 'border-[#FFD700] text-[#FFD700] bg-[#FFD700]/10'
                    : 'border-[#374151] text-gray-400'
                }`}
            >
              {o.name}
            </span>
          ))}
        </div>

        <div className="relative w-full max-w-[600px] aspect-square rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border-4 border-gray-800">
          <div className="grid h-full w-full grid-cols-[repeat(15,1fr)] grid-rows-[repeat(15,1fr)] gap-[1px] bg-gray-800">
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
          <p className="text-sm font-medium text-gray-300">
            {winner? 'Game over' : currentTurn? `${currentTurn}'s turn` : 'Waiting for the table…'}
          </p>
        </div>
      </main>

      {winner && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm animate-rise-in p-8 text-center rounded-2xl bg-gradient-to-br from-[#111827] to-[#0B0F1A] border-2 border-[#374151]">
            <span className="text-5xl">🏆</span>
            <h2 className="mt-4 font-display text-2xl font-bold text-white">{winner} wins!</h2>
            <div className="mt-8 flex-col gap-3">
              <button
                type="button"
                className="rounded-xl bg-gradient-to-r from-[#E53935] to-[#B71C1C] px-6 py-3 font-bold text-white shadow-lg hover:scale-105 transition"
                onClick={() => {
                  setWinner(null)
                  onExit
                  ? onExit()
                    : navigate(mode === 'multiplayer'? '/play/friends' : '/play/random')
                }}
              >
                Play Again
              </button>
              <button
                type="button"
                className="rounded-xl border border-[#374151] px-6 py-3 font-semibold text-gray-300 hover:bg-[#1F2937]"
                onClick={() => navigate('/')}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const YARD_COLOR = {
  red: 'bg-red-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  blue: 'bg-blue-500'
}

const LANE_COLOR = {
  red: 'bg-red-500/70',
  green: 'bg-green-500/70',
  yellow: 'bg-yellow-400/70',
  blue: 'bg-blue-500/70'
}

function BoardCellRender({ cell, tokens = [], onTokenClick }) {
  const { bgClass, type, safe, yardColor, homeLaneColor } = cell
  const isCenter = type === 'center'
  const isSafe = safe && type === 'path'

  const bg = isCenter
  ? 'bg-[#0B0F1A]'
    : type === 'yard'
  ? YARD_COLOR[yardColor]
    : homeLaneColor
  ? LANE_COLOR[homeLaneColor]
    : 'bg-white'

  return (
    <div className={`relative flex items-center justify-center border-gray-700/50 ${bg} min-w-0 min-h-0 overflow-hidden`}>

      {/* Center LUDO 3x3 */}
      {isCenter && (
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-[1px] p-[2px]">
          {['L','U','D','O','L','U','D','O','L'].map((l,i) => (
            <div key={i} className="flex items-center justify-center text-[6px] font-black text-white bg-[#111827]/90 rounded-[1px]">
              {l}
            </div>
          ))}
        </div>
      )}

      {/* Safe Star */}
      {!isCenter && isSafe && (
        <span className="absolute text-yellow-400 text-[11px] font-bold drop-shadow-[0_0_6px_#FFD700] z-20">
          ★
        </span>
      )}

      {/* Tokens - Yard me stack */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        {(tokens || []).slice(0,4).map((t, idx) => (
          <div
            key={`${t.color}-${t.tokenId}`}
            className="pointer-events-auto"
            style={type === 'yard'? {position: 'absolute', top: `${8 + idx * 18}%`, left: '50%', transform: 'translateX(-50%)'} : {}}
          >
            <Token
              color={t.color}
              active={t.movable}
              onClick={() => onTokenClick(t.tokenId)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}