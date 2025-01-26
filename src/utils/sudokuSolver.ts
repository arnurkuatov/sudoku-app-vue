// src/utils/sudokuSolver.ts

import {validateCell} from "./sudokuValidator";

export function countSolutions(board: number[][]): number {
    // Clone board to avoid modifying original
    const puzzle = board.map((row) => [...row])

    function findEmptyCell(): [number, number] | null {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (puzzle[r][c] === 0) return [r, c]
            }
        }
        return null
    }

    let solutionsFound = 0

    function canPlace(row: number, col: number, val: number): boolean {
        for (let x = 0; x < 9; x++) {
            if (puzzle[row][x] === val) return false
            if (puzzle[x][col] === val) return false
        }
        const boxRow = Math.floor(row / 3) * 3
        const boxCol = Math.floor(col / 3) * 3
        for (let rr = 0; rr < 3; rr++) {
            for (let cc = 0; cc < 3; cc++) {
                if (puzzle[boxRow + rr][boxCol + cc] === val) return false
            }
        }
        return true
    }

    function backtrack() {
        if (solutionsFound > 1) return // early stop if >1
        const empty = findEmptyCell()
        if (!empty) {
            solutionsFound++
            return
        }
        const [row, col] = empty
        for (let val = 1; val <= 9; val++) {
            if (canPlace(row, col, val)) {
                puzzle[row][col] = val
                backtrack()
                puzzle[row][col] = 0
                if (solutionsFound > 1) return
            }
        }
    }

    backtrack()
    return solutionsFound
}

// export function validateAndSetWithResult(row: number, col: number, value: number): boolean {
//     // If prefilled, ignore
//     if (this.isCellPrefilled(row, col)) return false
//
//     const isValid = validateCell(this.puzzle, row, col, value)
//     if (!isValid) {
//         this.score -= 1
//         this.errors++
//         return false
//     }
//
//     const oldVal = this.puzzle[row][col]
//     if (oldVal === value) return true // no change
//     this.puzzle[row][col] = value
//
//     if (value === this.solution[row][col]) {
//         this.score += 5
//     } else {
//         this.score -= 1
//     }
//
//     // record a move for undo/redo if desired...
//     // then checkWin()...
//     return true
// }
