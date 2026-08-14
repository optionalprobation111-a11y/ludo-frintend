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

// DARK gradient yard
const YARD_COLOR = {
  red: 'bg-gradient-to-br from-red-900 to-red-700',
  green: 'bg-gradient-to-br from-green-900 to-green-700',
  yellow: 'bg-gradient-to-br from-yellow-800 to-yellow-600',
  blue: 'bg-gradient-to-br from-blue-900 to-blue-700'
}

// DARK gradient lane
const LANE_COLOR = {
  red: 'bg-gradient-to-br from-red-800/90 to-red-600/90',
  green: 'bg-gradient-to-br from-green-800/90 to-green-600/90',
  yellow: 'bg-gradient-to-br from-yellow-700/90 to-yellow-500/90',
  blue: 'bg-gradient-to-br from-blue-800/90 to-blue-600/90'
}

// 4 kono ki position
const YARD_POSITIONS = [
  { top: '14%', left: '14%' },
  { top: '14%', right: '14%' },
  { bottom: '14%', left: '14%' },
  { bottom: '14%', right: '14%' }
]

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
      roomId, token, name: name || (isSolo? 'You' : 'Player'),
      isSolo, botName, botDifficulty, anonId:!token? anonId : undefined
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
            mapped[key].push({ tokenId: t.id, color, movable: lm?.includes(t.id) && turn === color })
          })
        })
        setBoardState(mapped)
      }
      setRolling(false)
    })

    const offOver = onGameOver(async ({ winnerName }) => {
      setWinner(winnerName)
      try { await submitGameResult({ token: token || undefined, anonId:!token? anonId : undefined, roomId, won: false, moveStats: {} }) } catch {}
    })

    return () => { offState(); offOver() }
  }, [roomId, token, anonId, name, isSolo, botName, botDifficulty, legalMoves])

  const handleRoll = () => { if (!roomId) return; setRolling(true); rollDice({ roomId }) }
  const handleTokenMove = (tokenId) => { if (!roomId) return; moveToken({ roomId, tokenId }) }

  return (
    <div className="min-h-screen bg-[#05070F] py-6 px-2">
      <PageHeader showBack />

      <main className="mx-auto flex max-w-4xl flex-col items-center gap-6">
        <div className="flex w-full flex-wrap items-center justify-center gap-3">
          {opponents.map((o) => (
            <span key={o.name} className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold ${currentTurn === o.name? 'border-[#FFD700] text-[#FFD700] bg-[#FFD700]/10' : 'border-[#374151] text-gray-400'}`}>
              {o.name}
            </span>
          ))}
        </div>

        {/* 3D Board Container */}
        <div className="relative w-full max-w-[620px] aspect-square rounded-3xl p-[3px] bg-gradient-to-br from-gray-700 via-gray-900 to-black shadow-[0_25px_70px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]">
          <div className="grid h-full w-full grid-cols-[repeat(15,1fr)] grid-rows-[repeat(15,1fr)] gap-[0.5px] bg-gray-950 rounded-2xl overflow-hidden">
            {cells.map((cell) => (
              <BoardCellRender key={`${cell.row}-${cell.col}`} cell={cell} tokens={boardState[`${cell.row},${cell.col}`]} onTokenClick={handleTokenMove} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <DiceRoller value={diceValue} onRoll={handleRoll} rolling={rolling} disabled={!roomId || Boolean(winner)} />
          <p className="text-sm font-medium text-gray-300">{winner? 'Game over' : currentTurn? `${currentTurn}'s turn` : 'Waiting for the table…'}</p>
        </div>
      </main>

      {winner && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm p-8 text-center rounded-2xl bg-gradient-to-br from-[#111827] to-[#0B0F1A] border-2 border-[#374151]">
            <span className="text-5xl">🏆</span>
            <h2 className="mt-4 font-display text-2xl font-bold text-white">{winner} wins!</h2>
            <div className="mt-8 flex-col gap-3">
              <button type="button" className="rounded-xl bg-gradient-to-r from-[#E53935] to-[#B71C1C] px-6 py-3 font-bold text-white shadow-lg hover:scale-105 transition" onClick={() => { setWinner(null); onExit? onExit() : navigate(mode === 'multiplayer'? '/play/friends' : '/play/random') }}>Play Again</button>
              <button type="button" className="rounded-xl border-[#374151] px-6 py-3 font-semibold text-gray-300 hover:bg-[#1F2937]" onClick={() => navigate('/')}>Back to Home</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BoardCellRender({ cell, tokens = [], onTokenClick }) {
  const { type, safe, yardColor, homeLaneColor } = cell
  const isCenter = type === 'center'
  const isSafe = safe && type === 'path'

  const bg = isCenter
? 'bg-gradient-to-br from-[#0a0f1a] to-[#05070F]'
    : type === 'yard'
? YARD_COLOR[yardColor]
    : homeLaneColor
? LANE_COLOR[homeLaneColor]
    : 'bg-gradient-to-br from-gray-50 to-gray-200' // Path - off white 3D

  return (
    <div className={`relative flex items-center justify-center ${bg} shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]`}>

      {/* Center LUDO 3D */}
      {isCenter && (
        <div className="absolute inset-0 grid-cols-3 grid-rows-3 gap-[1px] p-[3px]">
          {['L','U','D','O','L','U','D','O','L'].map((l,i) => (
            <div key={i} className="flex items-center justify-center text-[6px] font-black text-white bg-gradient-to-br from-[#1f2937] to-[#111827] rounded-sm shadow-inner">
              {l}
            </div>
          ))}
        </div>
      )}

      {/* Safe Star with glow */}
      {!isCenter && isSafe && (
        <span className="absolute text-yellow-300 text-[12px] font-bold drop-shadow-[0_0_8px_#FFD700] z-20">★</span>
      )}

      {/* Tokens */}
      {type === 'yard'? (
        <div className="absolute inset-0 pointer-events-none">
          {(tokens || []).slice(0,4).map((t, idx) => (
            <div key={`${t.color}-${t.tokenId}`} className="absolute pointer-events-auto" style={YARD_POSITIONS[idx]}>
              <Token color={t.color} active={t.movable} onClick={() => onTokenClick(t.tokenId)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {(tokens || []).map((t) => (
            <div key={`${t.color}-${t.tokenId}`} className="pointer-events-auto">
              <Token color={t.color} active={t.movable} onClick={() => onTokenClick(t.tokenId)} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}