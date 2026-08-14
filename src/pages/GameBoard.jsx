import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import DiceRoller from '../components/DiceRoller.jsx'
import Token from '../components/Token.jsx'
import { useSocket } from '../hooks/useSocket'
import { joinRoom, rollDice, moveToken, onGameState, onGameOver } from '../services/socket'
import { useUser } from '../context/UserContext.jsx'

// Responsive Ludo Styles Auto-Injected
const ludoStyles = `
  :root {
    --board-size: min(92vw, 480px);
    --u: calc(var(--board-size) / 15);
  }

  .ludo-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: #0B0F1A;
    padding: 8px;
    box-sizing: border-box;
  }

  .outer {
    height: var(--board-size);
    width: var(--board-size);
    margin: 0 auto;
    background: white;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    box-sizing: border-box;
    position: relative;
    user-select: none;
    border-radius: 4px;
    overflow: hidden;
  }

  .box_row {
    height: calc(6 * var(--u));
    width: var(--board-size);
    clear: both;
  }

  .box {
    height: calc(4 * var(--u));
    width: calc(4 * var(--u));
    float: left;
    box-sizing: content-box;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    align-items: center;
    justify-items: center;
  }

  .box-red { border: calc(1 * var(--u)) solid #ef4444; }
  .box-green { border: calc(1 * var(--u)) solid #22c55e; }
  .box-blue { border: calc(1 * var(--u)) solid #3b82f6; }
  .box-yellow { border: calc(1 * var(--u)) solid #eab308; }

  .v_lad {
    height: calc(6 * var(--u));
    width: calc(3 * var(--u));
    float: left;
  }

  .circle {
    height: calc(1.3 * var(--u));
    width: calc(1.3 * var(--u));
    border-radius: 50%;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .border_red { border: calc(0.12 * var(--u)) solid #ef4444; }
  .border_green { border: calc(0.12 * var(--u)) solid #22c55e; }
  .border_blue { border: calc(0.12 * var(--u)) solid #3b82f6; }
  .border_yellow { border: calc(0.12 * var(--u)) solid #eab308; }

  .v_lad_row {
    height: calc(1 * var(--u));
    width: calc(3 * var(--u));
  }

  .v_lad_cell {
    height: calc(1 * var(--u));
    width: calc(1 * var(--u));
    border: 1px solid #e2e8f0;
    box-sizing: border-box;
    float: left;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .red { background: #ef4444; }
  .green { background: #22c55e; }
  .blue { background: #3b82f6; }
  .yellow { background: #eab308; }

  .middle_row {
    height: calc(3 * var(--u));
    width: var(--board-size);
    clear: both;
  }

  .h_lad {
    height: calc(3 * var(--u));
    width: calc(6 * var(--u));
    float: left;
  }

  .h_lad_row {
    height: calc(1 * var(--u));
    width: calc(6 * var(--u));
    float: left;
  }

  .h_lad_cell {
    height: calc(1 * var(--u));
    width: calc(1 * var(--u));
    border: 1px solid #e2e8f0;
    float: left;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .ludo_home {
    height: 0;
    width: 0;
    border-left: calc(1.5 * var(--u)) solid #ef4444;
    border-right: calc(1.5 * var(--u)) solid #eab308;
    border-top: calc(1.5 * var(--u)) solid #22c55e;
    border-bottom: calc(1.5 * var(--u)) solid #3b82f6;
    float: left;
  }

  .star {
    font-size: calc(0.65 * var(--u));
    line-height: 1;
    color: #475569;
  }
`;

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
    joinRoom({ roomId, token, name: name || (isSolo ? 'You' : 'Player'), isSolo, botName, botDifficulty, anonId: !token ? anonId : undefined })

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
  }, [roomId, token, anonId, name, isSolo, botName, botDifficulty])

  const handleRoll = () => { if (!roomId) return; setRolling(true); rollDice({ roomId }) }
  const handleTokenMove = (tokenId) => { if (!roomId) return; moveToken({ roomId, tokenId }) }

  // Yard Me Tokens Render Karne Ke Liye Helper Function
  const renderYardToken = (color, index) => {
    const tData = tokensData[color]?.[index]
    if (!tData) return null
    return (
      <Token
        color={color}
        active={legalMoves.includes(tData.id) && currentTurn === color}
        onClick={() => handleTokenMove(tData.id)}
      />
    )
  }

  return (
    <div className="ludo-container">
      {/* Auto-Loaded Inline Styles */}
      <style>{ludoStyles}</style>

      <PageHeader showBack />

      {/* Opponents List Header */}
      <div className="flex gap-2 justify-center my-3 flex-wrap">
        {opponents.map((o) => (
          <span
            key={o.name}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              currentTurn === o.name ? 'border-[#FFD700] text-[#FFD700]' : 'border-[#374151] text-gray-400'
            }`}
          >
            {o.name}
          </span>
        ))}
      </div>

      {/* 100% RESPONSIVE LUDO BOARD */}
      <div className="outer">
        {/* TOP ROW */}
        <div className="box_row">
          <div className="box box-red">
            <div className="circle border_red">{renderYardToken('red', 0)}</div>
            <div className="circle border_red">{renderYardToken('red', 1)}</div>
            <div className="circle border_red">{renderYardToken('red', 2)}</div>
            <div className="circle border_red">{renderYardToken('red', 3)}</div>
          </div>

          <div className="v_lad">
            <div className="v_lad_row">
              <div className="v_lad_cell"></div>
              <div className="v_lad_cell"></div>
              <div className="v_lad_cell"></div>
            </div>
            <div className="v_lad_row">
              <div className="v_lad_cell"></div>
              <div className="v_lad_cell green"></div>
              <div className="v_lad_cell green"><span className="star">★</span></div>
            </div>
            <div className="v_lad_row">
              <div className="v_lad_cell green"><span className="star">★</span></div>
              <div className="v_lad_cell green"></div>
              <div className="v_lad_cell"></div>
            </div>
            <div className="v_lad_row">
              <div className="v_lad_cell"></div>
              <div className="v_lad_cell green"></div>
              <div className="v_lad_cell"></div>
            </div>
            <div className="v_lad_row">
              <div className="v_lad_cell"></div>
              <div className="v_lad_cell green"></div>
              <div className="v_lad_cell"></div>
            </div>
            <div className="v_lad_row">
              <div className="v_lad_cell"></div>
              <div className="v_lad_cell green"></div>
              <div className="v_lad_cell"></div>
            </div>
          </div>

          <div className="box box-green">
            <div className="circle border_green">{renderYardToken('green', 0)}</div>
            <div className="circle border_green">{renderYardToken('green', 1)}</div>
            <div className="circle border_green">{renderYardToken('green', 2)}</div>
            <div className="circle border_green">{renderYardToken('green', 3)}</div>
          </div>
        </div>

        {/* MIDDLE ROW */}
        <div className="middle_row">
          <div className="h_lad">
            <div className="h_lad_row">
              <div className="h_lad_cell"></div>
              <div className="h_lad_cell red"><span className="star">★</span></div>
              <div className="h_lad_cell"></div>
              <div className="h_lad_cell"></div>
              <div className="h_lad_cell"></div>
              <div className="h_lad_cell"></div>
            </div>
            <div className="h_lad_row">
              <div className="h_lad_cell"></div>
              <div className="h_lad_cell red"></div>
              <div className="h_lad_cell red"></div>
              <div className="h_lad_cell red"></div>
              <div className="h_lad_cell red"></div>
              <div className="h_lad_cell red"></div>
            </div>
            <div className="h_lad_row">
              <div className="h_lad_cell"></div>
              <div className="h_lad_cell"></div>
              <div className="h_lad_cell red"><span className="star">★</span></div>
              <div className="h_lad_cell"></div>
              <div className="h_lad_cell"></div>
              <div className="h_lad_cell"></div>
            </div>
          </div>

          <div className="ludo_home"></div>

          <div className="h_lad">
            <div className="h_lad_row">
              <div className="h_lad_cell"></div>
              <div className="h_lad_cell"></div>
              <div className="h_lad_cell"></div>
              <div className="h_lad_cell yellow"><span className="star">★</span></div>
              <div className="h_lad_cell"></div>
              <div className="h_lad_cell"></div>
            </div>
            <div className="h_lad_row">
              <div className="h_lad_cell yellow"></div>
              <div className="h_lad_cell yellow"></div>
              <div className="h_lad_cell yellow"></div>
              <div className="h_lad_cell yellow"></div>
              <div className="h_lad_cell yellow"></div>
              <div className="h_lad_cell"></div>
            </div>
            <div className="h_lad_row">
              <div className="h_lad_cell"></div>
              <div className="h_lad_cell"></div>
              <div className="h_lad_cell"></div>
              <div className="h_lad_cell"></div>
              <div className="h_lad_cell yellow"><span className="star">★</span></div>
              <div className="h_lad_cell"></div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="box_row">
          <div className="box box-blue">
            <div className="circle border_blue">{renderYardToken('blue', 0)}</div>
            <div className="circle border_blue">{renderYardToken('blue', 1)}</div>
            <div className="circle border_blue">{renderYardToken('blue', 2)}</div>
            <div className="circle border_blue">{renderYardToken('blue', 3)}</div>
          </div>

          <div className="v_lad">
            <div className="v_lad_row">
              <div className="v_lad_cell"></div>
              <div className="v_lad_cell blue"></div>
              <div className="v_lad_cell"></div>
            </div>
            <div className="v_lad_row">
              <div className="v_lad_cell"></div>
              <div className="v_lad_cell blue"></div>
              <div className="v_lad_cell"></div>
            </div>
            <div className="v_lad_row">
              <div className="v_lad_cell"></div>
              <div className="v_lad_cell blue"></div>
              <div className="v_lad_cell"></div>
            </div>
            <div className="v_lad_row">
              <div className="v_lad_cell"></div>
              <div className="v_lad_cell blue"></div>
              <div className="v_lad_cell blue"><span className="star">★</span></div>
            </div>
            <div className="v_lad_row">
              <div className="v_lad_cell blue"><span className="star">★</span></div>
              <div className="v_lad_cell blue"></div>
              <div className="v_lad_cell"></div>
            </div>
            <div className="v_lad_row">
              <div className="v_lad_cell"></div>
              <div className="v_lad_cell"></div>
              <div className="v_lad_cell"></div>
            </div>
          </div>

          <div className="box box-yellow">
            <div className="circle border_yellow">{renderYardToken('yellow', 0)}</div>
            <div className="circle border_yellow">{renderYardToken('yellow', 1)}</div>
            <div className="circle border_yellow">{renderYardToken('yellow', 2)}</div>
            <div className="circle border_yellow">{renderYardToken('yellow', 3)}</div>
          </div>
        </div>
      </div>

      {/* Dice Roller Controls */}
      <div className="mt-4">
        <DiceRoller
          value={diceValue}
          onRoll={handleRoll}
          rolling={rolling}
          disabled={!roomId || Boolean(winner)}
        />
      </div>
    </div>
  )
}
