// Generates metadata for a classic 15x15 Ludo board so GameBoard can render
// it purely from static layout rules. Actual move legality and positions
// come from the backend (game:state) — this only describes the static grid.

const SIZE = 15
const YARD_COLOR = {
  topLeft: 'red',
  topRight: 'green',
  bottomLeft: 'yellow',
  bottomRight: 'blue'
}

const SAFE_CELLS = new Set([
  '6,1', '8,13', '1,8', '13,6', // arm entry safe cells
  '2,6', '6,12', '12,8', '8,2' // star cells
])

const HOME_LANE = {
  red: (r, c) => r === 7 && c >= 1 && c <= 5,
  green: (r, c) => c === 7 && r >= 1 && r <= 5,
  blue: (r, c) => r === 7 && c >= 9 && c <= 13,
  yellow: (r, c) => c === 7 && r >= 9 && r <= 13
}

export function buildBoard() {
  const cells = []
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const inCrossRows = r >= 6 && r <= 8
      const inCrossCols = c >= 6 && c <= 8

      let type = 'yard'
      let yardColor = null
      let homeLaneColor = null

      if (inCrossRows && inCrossCols) {
        type = 'center'
      } else if (inCrossRows || inCrossCols) {
        type = 'path'
        for (const [color, test] of Object.entries(HOME_LANE)) {
          if (test(r, c)) homeLaneColor = color
        }
      } else {
        type = 'yard'
        if (r < 6 && c < 6) yardColor = YARD_COLOR.topLeft
        else if (r < 6 && c > 8) yardColor = YARD_COLOR.topRight
        else if (r > 8 && c < 6) yardColor = YARD_COLOR.bottomLeft
        else yardColor = YARD_COLOR.bottomRight
      }

      cells.push({
        row: r,
        col: c,
        type,
        yardColor,
        homeLaneColor,
        safe: SAFE_CELLS.has(`${r},${c}`)
      })
    }
  }
  return cells
}

export const BOARD_SIZE = SIZE
