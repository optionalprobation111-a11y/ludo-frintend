const SIZE = 15

export const COLORS = ['red', 'green', 'yellow', 'blue']

export const ENTRY_INDEX = { red: 0, green: 13, yellow: 26, blue: 39 }

export const SAFE_POSITIONS = new Set([0, 8, 13, 21, 26, 34, 39, 47])

export const FINISH_STEPS = 57

// Yard cells for tokens not yet entered
const YARD_CELL = {
  red: { row: 1, col: 1 },
  green: { row: 1, col: 13 },
  yellow: { row: 13, col: 1 },
  blue: { row: 13, col: 13 }
}

// Home lane cells (steps 51-56)
const HOME_LANE_CELL = {
  red: [
    { row: 7, col: 5 }, { row: 7, col: 4 }, { row: 7, col: 3 },
    { row: 7, col: 2 }, { row: 7, col: 1 }, { row: 7, col: 0 }
  ],
  green: [
    { row: 5, col: 7 }, { row: 4, col: 7 }, { row: 3, col: 7 },
    { row: 2, col: 7 }, { row: 1, col: 7 }, { row: 0, col: 7 }
  ],
  blue: [
    { row: 7, col: 9 }, { row: 7, col: 10 }, { row: 7, col: 11 },
    { row: 7, col: 12 }, { row: 7, col: 13 }, { row: 7, col: 14 }
  ],
  yellow: [
    { row: 9, col: 7 }, { row: 10, col: 7 }, { row: 11, col: 7 },
    { row: 12, col: 7 }, { row: 13, col: 7 }, { row: 14, col: 7 }
  ]
}

// Shared track cells (0-51)
export const SHARED_TRACK_CELLS = [
  { row: 6, col: 1 }, { row: 6, col: 0 }, { row: 5, col: 0 }, { row: 4, col: 0 },
  { row: 3, col: 0 }, { row: 2, col: 0 }, { row: 1, col: 0 }, { row: 0, col: 0 },
  { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 },
  { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 1, col: 6 }, { row: 2, col: 6 },
  { row: 3, col: 6 }, { row: 4, col: 6 }, { row: 5, col: 6 }, { row: 6, col: 6 },
  { row: 6, col: 7 }, { row: 6, col: 8 }, { row: 6, col: 9 }, { row: 6, col: 10 },
  { row: 6, col: 11 }, { row: 6, col: 12 }, { row: 7, col: 12 }, { row: 8, col: 12 },
  { row: 8, col: 13 }, { row: 8, col: 14 }, { row: 7, col: 14 }, { row: 6, col: 14 },
  { row: 5, col: 14 }, { row: 4, col: 14 }, { row: 3, col: 14 }, { row: 2, col: 14 },
  { row: 1, col: 14 }, { row: 0, col: 14 }, { row: 0, col: 13 }, { row: 0, col: 12 },
  { row: 0, col: 11 }, { row: 0, col: 10 }, { row: 0, col: 9 }, { row: 0, col: 8 },
  { row: 1, col: 8 }, { row: 2, col: 8 }, { row: 3, col: 8 }, { row: 4, col: 8 },
  { row: 5, col: 8 }, { row: 6, col: 5 }, { row: 6, col: 4 }, { row: 6, col: 3 },
  { row: 6, col: 2 }
]

export function getCellForSteps(color, steps) {
  if (steps === -1) return YARD_CELL[color]
  if (steps === FINISH_STEPS) return null
  if (steps >= 0 && steps <= 50) {
    const absPos = (ENTRY_INDEX[color] + steps) % 52
    return SHARED_TRACK_CELLS[absPos] || YARD_CELL[color]
  }
  if (steps >= 51 && steps <= 56) {
    return HOME_LANE_CELL[color][steps - 51] || YARD_CELL[color]
  }
  return YARD_CELL[color]
}

// Safe/star cells
const SAFE_CELL_SET = new Set([
  '6,1', '8,13', '1,8', '13,6', // arm entry safe cells
  '2,6', '6,12', '12,8', '8,2'  // star cells
])

export function buildBoard() {
  const cells = []
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const inCrossRows = r >= 6 && r <= 8
      const inCrossCols = c >= 6 && c <= 8
      const isSafe = SAFE_CELL_SET.has(`${r},${c}`)

      let type = 'path'
      let yardColor = null
      let homeLaneColor = null
      let bgClass = 'bg-white'

      if (inCrossRows && inCrossCols) {
        type = 'center'
        bgClass = 'bg-[#0B0F1A]'
      } else if (inCrossRows || inCrossCols) {
        type = 'path'
        bgClass = 'bg-white'
      } else {
        type = 'yard'
        if (r < 6 && c < 6) {
          yardColor = 'red'
          bgClass = 'bg-red-500'
        } else if (r < 6 && c > 8) {
          yardColor = 'green'
          bgClass = 'bg-green-500'
        } else if (r > 8 && c < 6) {
          yardColor = 'yellow'
          bgClass = 'bg-yellow-400'
        } else if (r > 8 && c > 8) {
          yardColor = 'blue'
          bgClass = 'bg-blue-500'
        }
      }

      // Home lanes
      if (r === 7 && c >= 0 && c <= 5) {
        homeLaneColor = 'red'
        bgClass = 'bg-red-500'
      }
      if (c === 7 && r >= 0 && r <= 5) {
        homeLaneColor = 'green'
        bgClass = 'bg-green-500'
      }
      if (r === 7 && c >= 9 && c <= 14) {
        homeLaneColor = 'blue'
        bgClass = 'bg-blue-500'
      }
      if (c === 7 && r >= 9 && r <= 14) {
        homeLaneColor = 'yellow'
        bgClass = 'bg-yellow-400'
      }

      cells.push({
        row: r,
        col: c,
        type,
        yardColor,
        homeLaneColor,
        safe: isSafe,
        bgClass
      })
    }
  }
  return cells
}

export const BOARD_SIZE = SIZE