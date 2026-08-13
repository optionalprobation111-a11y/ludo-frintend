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
      } catch {
        // non-blocking
      }
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
    <div className="board-backdrop min-h-screen bg-gradient-to-br from-[#0B0F1A] via-[#111827] to-[#0B0F1A]">
      <PageHeader showBack />

      <main className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 pb-16">
        <div className="flex w-full flex-wrap items-center justify-center gap-3">
          {opponents.map((o) => (
            <span
              key={o.name}
              className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold
                ${currentTurn === o.name
                 ? 'border-[#FFD700] text-[#FFD700] bg-[#FFD700]/10'
                  : 'border-[#374151] text-gray-400'}`}
            >
              {o.name}
            </span>
          ))}
        </div>

        <div className="aspect-square w-full max-w-[600px] overflow-hidden p-4 rounded-3xl
          bg-gradient-to-br from-[#111827] to-[#0B0F1A]
          shadow-[0_20px_50px_rgba(0,0,0,0.6)]
          border-2 border-[#374151]">
          <div className="grid h-full w-full grid-cols-[repeat(15,1fr)] grid-rows-[repeat(15,1fr)] gap-[2px]">
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
          <div className="w-full max-w-sm animate-rise-in p-8 text-center rounded-2xl
            bg-gradient-to-br from-[#111827] to-[#0B0F1A] border-2 border-[#374151]">
            <span className="text-5xl">🏆</span>
            <h2 className="mt-4 font-display text-2xl font-bold text-white">{winner} wins!</h2>
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                className="rounded-xl bg-gradient-to-r from-[#E53935] to-[#B71C1C] px-6 py-3 font-bold text-white shadow-lg hover:scale-105 transition"
                onClick={() => {
                  setWinner(null)
                  onExit? onExit() : navigate(mode === 'multiplayer'? '/play/friends' : '/play/random')
                }}
              >
                Play Again
              </button>
              <button type="button" className="rounded-xl border-[#374151] px-6 py-3 font-semibold text-gray-300 hover:bg-[#1F2937]" onClick={() => navigate('/')}>
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
  red: 'bg-[#E53935]/20',
  green: 'bg-[#43A047]/20',
  yellow: 'bg-[#FDD835]/20',
  blue: 'bg-[#1E88E5]/20'
}

const LANE_BG = {
  red: 'bg-[#E53935]/40',
  green: 'bg-[#43A047]/40',
  yellow: 'bg-[#FDD835]/40',
  blue: 'bg-[#1E88E5]/40'
}

function BoardCellRender({ cell, tokens = [], onTokenClick }) {
  const isCenter = cell.type === 'center'
  const isSafe = cell.safe && cell.type === 'path'

  const bg = isCenter
  ? 'bg-[#0B0F1A]'
    : cell.type === 'yard'
    ? YARD_BG[cell.yardColor]
      : cell.homeLaneColor
      ? LANE_BG[cell.homeLaneColor]
        : isSafe
        ? 'bg-[#FFD700]/25'
          : 'bg-[#1F2937]'

  return (
    <div className={`relative flex items-center justify-center border border-[#374151]/50 ${isCenter? 'rounded-full' : 'rounded-[2px]'} ${bg}`}>

      {isCenter && (
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-[#E53935]" style={{clipPath: 'polygon(0 0, 100% 0, 0 100%)'}}/>
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[#43A047]" style={{clipPath: 'polygon(100% 0, 100% 100%, 0 0)'}}/>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[#FDD835]" style={{clipPath: 'polygon(0 100%, 100% 100%, 0 0)'}}/>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[#1E88E5]" style={{clipPath: 'polygon(100% 100%, 100% 0, 0 100%)'}}/>
          <div className="absolute inset-0 flex items-center justify-center text-white font-black text-[10px] tracking-wider">LUDO</div>
        </div>
      )}

      {isSafe && (
        <span className="absolute text-[#FFD700] text-[11px] font-bold drop-shadow-[0_0_6px_#FFD700]">★</span>
      )}

      <div className="flex flex-wrap items-center justify-center gap-[2px] z-10">
        {(tokens || []).map((t) => (
          <Token
            key={`${t.color}-${t.tokenId}`}
            color={t.color}
            active={t.movable}
            onClick={() => onTokenClick(t.tokenId)}
          />
        ))}
      </div>
    </div>
  )
}