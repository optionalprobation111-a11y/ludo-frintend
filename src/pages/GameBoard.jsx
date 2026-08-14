import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import DiceRoller from '../components/DiceRoller.jsx'
import Token from '../components/Token.jsx'
import { useSocket } from '../hooks/useSocket'
import { joinRoom, rollDice, moveToken, onGameState, onGameOver } from '../services/socket'
import { useUser } from '../context/UserContext.jsx'

const YARD_POS = [
  { top: '12.5%', left: '12.5%' },
  { top: '12.5%', right: '12.5%' },
  { bottom: '12.5%', left: '12.5%' },
  { bottom: '12.5%', right: '12.5%' }
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
    <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center p-2">
      <PageHeader showBack />
      
      <div className="flex gap-2 justify-center mb-2 flex-wrap">
        {opponents.map((o) => <span key={o.name} className={`rounded-full border px-3 py-1 text-xs font-semibold ${currentTurn === o.name? 'border-[#FFD700] text-[#FFD700]' : 'border-[#374151] text-gray-400'}`}>{o.name}</span>)}
      </div>

      {/* RESPONSIVE BOARD - 90vw max 600px */}
      <div className="w-[90vw] h-[90vw] max-w-[600px] max-h-[600px] border-[1px] border-red-500 bg-white relative shadow-2xl">
        
        {/* ROW 1 - 40% height */}
        <div className="h-[40%] w-full">
          {/* Red Yard - 26.66% width */}
          <div className="h-full w-[26.66%] float-left border-[6.66%] border-red-600 relative">
            {[0,1,2,3].map(i => tokensData.red?.[i] && <div key={i} className="absolute" style={{...YARD_POS[i], width:'20%', height:'20%'}}><Token color="red" active={legalMoves.includes(tokensData.red[i].id) && currentTurn==='red'} onClick={() => handleTokenMove(tokensData.red[i].id)} /></div>)}
          </div>
          {/* Green Ladder - 20% width */}
          <div className="h-full w-[20%] float-left"></div>
          {/* Green Yard */}
          <div className="h-full w-[26.66%] float-left border-[6.66%] border-green-600 relative">
            {[0,1,2,3].map(i => tokensData.green?.[i] && <div key={i} className="absolute" style={{...YARD_POS[i], width:'20%', height:'20%'}}><Token color="green" active={legalMoves.includes(tokensData.green[i].id) && currentTurn==='green'} onClick={() => handleTokenMove(tokensData.green[i].id)} /></div>)}
          </div>
        </div>

        {/* MIDDLE ROW - 20% height */}
        <div className="h-[20%] w-full">
          <div className="h-full w-[40%] float-left"></div>
          {/* Center Diamond */}
          <div className="w-0 h-0 float-left 
            border-l-[10%] border-l-red-600 
            border-r-[10%] border-r-yellow-400 
            border-t-[10%] border-t-green-600 
            border-b-[10%] border-b-blue-600"></div>
          <div className="h-full w-[40%] float-left"></div>
        </div>

        {/* ROW 3 - 40% height */}
        <div className="h-[40%] w-full">
          {/* Blue Yard */}
          <div className="h-full w-[26.66%] float-left border-[6.66%] border-blue-600 relative">
            {[0,1,2,3].map(i => tokensData.blue?.[i] && <div key={i} className="absolute" style={{...YARD_POS[i], width:'20%', height:'20%'}}><Token color="blue" active={legalMoves.includes(tokensData.blue[i].id) && currentTurn==='blue'} onClick={() => handleTokenMove(tokensData.blue[i].id)} /></div>)}
          </div>
          {/* Blue Ladder */}
          <div className="h-full w-[20%] float-left"></div>
          {/* Yellow Yard */}
          <div className="h-full w-[26.66%] float-left border-[6.66%] border-yellow-500 relative">
            {[0,1,2,3].map(i => tokensData.yellow?.[i] && <div key={i} className="absolute" style={{...YARD_POS[i], width:'20%', height:'20%'}}><Token color="yellow" active={legalMoves.includes(tokensData.yellow[i].id) && currentTurn==='yellow'} onClick={() => handleTokenMove(tokensData.yellow[i].id)} /></div>)}
          </div>
        </div>
      </div>

      <div className="mt-4"><DiceRoller value={diceValue} onRoll={handleRoll} rolling={rolling} disabled={!roomId || Boolean(winner)} /></div>

      {winner && <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/80"><div className="p-6 rounded-2xl bg-white text-center"><h2 className="text-xl font-bold">{winner} wins!</h2></div></div>}
    </div>
  )
}