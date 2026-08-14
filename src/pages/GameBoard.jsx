import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import DiceRoller from '../components/DiceRoller.jsx'
import Token from '../components/Token.jsx'
import { useSocket } from '../hooks/useSocket'
import { joinRoom, rollDice, moveToken, onGameState, onGameOver } from '../services/socket'
import { useUser } from '../context/UserContext.jsx'

// Ye mapping: steps -> kaunse yard/path cell me token dikhega
// 0-3 = yard, 4-59 = path, 60-65 = home
const getCellPosition = (color, steps) => {
  if (steps < 4) return { type: 'yard', index: steps } // 4 token yard me
  // Baaki sab ke liye abhi path pe center me daal denge
  return { type: 'path', id: `${color}-${steps}` }
}

const YARD_POS = [
  { top: '25px', left: '25px' },
  { top: '25px', right: '25px' },
  { bottom: '25px', left: '25px' },
  { bottom: '25px', right: '25px' }
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
    <div className="min-h-screen bg-[#0B0F1A] py-6 flex justify-center">
      <div>
        <PageHeader showBack />
        <div className="flex gap-3 justify-center mb-4">
          {opponents.map((o) => <span key={o.name} className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold ${currentTurn === o.name? 'border-[#FFD700] text-[#FFD700]' : 'border-[#374151] text-gray-400'}`}>{o.name}</span>)}
        </div>

        {/* YAHI TERA HTML BOARD HAI */}
        <div className="w-[750px] h-[750px] border-2 border-red-500 bg-white relative">

          {/* ROW 1 */}
          <div className="h-[300px] w-[750px]">
            <div className="h-[200px] w-[200px] float-left border-[50px] border-red-600 relative">
              {[0,1,2,3].map(i => tokensData.red?.[i] && <div key={i} style={{position:'absolute',...YARD_POS[i]}}><Token color="red" active={legalMoves.includes(tokensData.red[i].id) && currentTurn==='red'} onClick={() => handleTokenMove(tokensData.red[i].id)} /></div>)}
            </div>
            <div className="h-[300px] w-[150px] float-left"> {/* Green v_lad - static hai abhi */} </div>
            <div className="h-[200px] w-[200px] float-left border-[50px] border-green-600 relative">
              {[0,1,2,3].map(i => tokensData.green?.[i] && <div key={i} style={{position:'absolute',...YARD_POS[i]}}><Token color="green" active={legalMoves.includes(tokensData.green[i].id) && currentTurn==='green'} onClick={() => handleTokenMove(tokensData.green[i].id)} /></div>)}
            </div>
          </div>

          {/* MIDDLE ROW */}
          <div className="h-[150px] w-[750px]">
            <div className="h-[150px] w-[300px] float-left"> {/* Red h_lad */} </div>
            <div className="w-0 h-0 float-left border-l-[75px] border-l-red-600 border-r-[75px] border-r-yellow-400 border-t-[75px] border-t-green-600 border-b-[75px] border-b-blue-600"></div>
            <div className="h-[150px] w-[300px] float-left"> {/* Yellow h_lad */} </div>
          </div>

          {/* ROW 3 */}
          <div className="h-[300px] w-[750px]">
            <div className="h-[200px] w-[200px] float-left border-[50px] border-blue-600 relative">
              {[0,1,2,3].map(i => tokensData.blue?.[i] && <div key={i} style={{position:'absolute',...YARD_POS[i]}}><Token color="blue" active={legalMoves.includes(tokensData.blue[i].id) && currentTurn==='blue'} onClick={() => handleTokenMove(tokensData.blue[i].id)} /></div>)}
            </div>
            <div className="h-[300px] w-[150px] float-left"> {/* Blue v_lad */} </div>
            <div className="h-[200px] w-[200px] float-left border-[50px] border-yellow-500 relative">
              {[0,1,2,3].map(i => tokensData.yellow?.[i] && <div key={i} style={{position:'absolute',...YARD_POS[i]}}><Token color="yellow" active={legalMoves.includes(tokensData.yellow[i].id) && currentTurn==='yellow'} onClick={() => handleTokenMove(tokensData.yellow[i].id)} /></div>)}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-4"><DiceRoller value={diceValue} onRoll={handleRoll} rolling={rolling} disabled={!roomId || Boolean(winner)} /></div>
      </div>
    </div>
  )
}