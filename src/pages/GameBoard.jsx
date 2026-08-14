import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import DiceRoller from '../components/DiceRoller.jsx'
import Token from '../components/Token.jsx'
import { useSocket } from '../hooks/useSocket'
import { joinRoom, rollDice, moveToken, onGameState, onGameOver } from '../services/socket'
import { useUser } from '../context/UserContext.jsx'

const YARD_POS = [
  { top: '12%', left: '12%' },
  { top: '12%', right: '12%' },
  { bottom: '12%', left: '12%' },
  { bottom: '12%', right: '12%' }
]

export default function GameBoard({ mode = 'multiplayer', roomId: roomIdProp, opponents = [], onExit, isSolo = false, botName, botDifficulty }) {
  const navigate = useNavigate()
  const params = useParams()
  const roomId = roomIdProp || params.roomId
  const { token, anonId, name } = useUser()

  const [diceValue, setDiceValue] = useState(1)
  const [currentTurn, setCurrentTurn] = useState(null)
  const [tokensData, setTokensData] = useState({})
  const [legalMoves, setLegalMoves] = useState([])
  const [winner, setWinner] = useState(null)
  const [rolling, setRolling] = useState(false)

  useSocket({ enabled: Boolean(roomId) })

  useEffect(() => {
    if (!roomId) return
    joinRoom({ roomId, token, name: name || (isSolo? 'You' : 'Player'), isSolo, botName, botDifficulty, anonId:!token? anonId : undefined })

    const offState = onGameState((state) => {
      const { tokens, currentTurn: turn, diceValue: dv, legalMoves: lm } = state || {}
      if (typeof dv === 'number') setDiceValue(dv)
      if (turn) setCurrentTurn(turn)
      if (Array.isArray(lm)) setLegalMoves(lm)
      if (tokens) setTokensData(tokens)
      setRolling(false)
    })
    const offOver = onGameOver(({ winnerName }) => { setWinner(winnerName) })
    return () => { offState(); offOver() }
  }, [roomId, token, anonId, name, isSolo, botName, botDifficulty, legalMoves])

  const handleRoll = () => { if (!roomId) return; setRolling(true); rollDice({ roomId }) }
  const handleTokenMove = (tokenId) => { if (!roomId) return; moveToken({ roomId, tokenId }) }

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex-col items-center justify-center p-2">
      <PageHeader showBack />
      <div className="flex gap-2 justify-center mb-3 flex-wrap">
        {opponents.map((o) => <span key={o.name} className={`rounded-full border px-3 py-1 text-xs font-semibold ${currentTurn === o.name? 'border-[#FFD700] text-[#FFD700]' : 'border-[#374151] text-gray-400'}`}>{o.name}</span>)}
      </div>

      {/* 3x3 GRID BOARD - Responsive */}
      <div className="grid grid-cols-[2fr_1fr_2fr] grid-rows-[2fr_1fr_2fr] w-[92vw] h-[92vw] max-w-[500px] max-h-[500px] border-2 border-gray-800 bg-white shadow-2xl">
        
        {/* 1. TOP LEFT - RED YARD */}
        <div className="border-[7%] border-red-600 relative">
          {[0,1,2,3].map(i => tokensData.red?.[i] && <div key={i} className="absolute" style={{...YARD_POS[i], width:'22%', height:'22%'}}><Token color="red" active={legalMoves.includes(tokensData.red[i].id) && currentTurn==='red'} onClick={() => handleTokenMove(tokensData.red[i].id)} /></div>)}
        </div>

        {/* 2. TOP MIDDLE - GREEN PATH */}
        <div className="grid grid-rows-6">
          {[...Array(6)].map((_, i) => <div key={i} className="border border-gray-300 flex items-center justify-center">
            {(i===1 || i===2) && <span className="text-[10px]">★</span>}
            <div className={`w-full h-full ${i>0? 'bg-green-600' : ''}`}></div>
          </div>)}
        </div>

        {/* 3. TOP RIGHT - GREEN YARD */}
        <div className="border-[7%] border-green-600 relative">
          {[0,1,2,3].map(i => tokensData.green?.[i] && <div key={i} className="absolute" style={{...YARD_POS[i], width:'22%', height:'22%'}}><Token color="green" active={legalMoves.includes(tokensData.green[i].id) && currentTurn==='green'} onClick={() => handleTokenMove(tokensData.green[i].id)} /></div>)}
        </div>

        {/* 4. MIDDLE LEFT - RED PATH */}
        <div className="grid grid-cols-6">
          {[...Array(6)].map((_, i) => <div key={i} className="border border-gray-300 flex items-center justify-center">
            {(i===1 || i===2) && <span className="text-[10px]">★</span>}
            <div className={`w-full h-full ${i>0? 'bg-red-600' : ''}`}></div>
          </div>)}
        </div>

        {/* 5. CENTER - 4 TRIANGLES */}
        <div className="relative">
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-green-600" style={{clipPath: 'polygon(0 0, 100% 0, 0 100%)'}}></div>
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-yellow-400" style={{clipPath: 'polygon(100% 0, 100% 100%, 0 0)'}}></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-red-600" style={{clipPath: 'polygon(0 100%, 100% 100%, 0 0)'}}></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-600" style={{clipPath: 'polygon(100% 100%, 100% 0, 0 100%)'}}></div>
        </div>

        {/* 6. MIDDLE RIGHT - YELLOW PATH */}
        <div className="grid grid-cols-6">
          {[...Array(6)].map((_, i) => <div key={i} className="border border-gray-300 flex items-center justify-center">
            {(i===3 || i===4) && <span className="text-[10px]">★</span>}
            <div className={`w-full h-full ${i<5? 'bg-yellow-400' : ''}`}></div>
          </div>)}
        </div>

        {/* 7. BOTTOM LEFT - BLUE YARD */}
        <div className="border-[7%] border-blue-600 relative">
          {[0,1,2,3].map(i => tokensData.blue?.[i] && <div key={i} className="absolute" style={{...YARD_POS[i], width:'22%', height:'22%'}}><Token color="blue" active={legalMoves.includes(tokensData.blue[i].id) && currentTurn==='blue'} onClick={() => handleTokenMove(tokensData.blue[i].id)} /></div>)}
        </div>

        {/* 8. BOTTOM MIDDLE - BLUE PATH */}
        <div className="grid grid-rows-6">
          {[...Array(6)].map((_, i) => <div key={i} className="border border-gray-300 flex items-center justify-center">
            {(i===3 || i===4) && <span className="text-[10px]">★</span>}
            <div className={`w-full h-full ${i<5? 'bg-blue-600' : ''}`}></div>
          </div>)}
        </div>

        {/* 9. BOTTOM RIGHT - YELLOW YARD */}
        <div className="border-[7%] border-yellow-500 relative">
          {[0,1,2,3].map(i => tokensData.yellow?.[i] && <div key={i} className="absolute" style={{...YARD_POS[i], width:'22%', height:'22%'}}><Token color="yellow" active={legalMoves.includes(tokensData.yellow[i].id) && currentTurn==='yellow'} onClick={() => handleTokenMove(tokensData.yellow[i].id)} /></div>)}
        </div>
      </div>

      <div className="mt-4"><DiceRoller value={diceValue} onRoll={handleRoll} rolling={rolling} disabled={!roomId || Boolean(winner)} /></div>
    </div>
  )
}