import { countSolutions } from './sudokuSolver'

export enum Difficulty {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    HARD = 'hard',
    EXPERT = 'expert'
}

export type DifficultyKey = 'beginner' | 'intermediate' | 'hard' | 'expert'

const DIFFICULTY_CELLS_VISIBLE: Record<Difficulty, [number, number]> = {
    [Difficulty.BEGINNER]: [36, 40],
    [Difficulty.INTERMEDIATE]: [32, 36],
    [Difficulty.HARD]: [28, 32],
    [Difficulty.EXPERT]: [24, 28]
}

// Simple backtracking to create a full solution
function generateFullSolution(): number[][] {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0))

    function canPlace(row: number, col: number, val: number): boolean {
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === val) return false
            if (board[x][col] === val) return false
        }
        const boxRow = Math.floor(row / 3) * 3
        const boxCol = Math.floor(col / 3) * 3
        for (let rr = 0; rr < 3; rr++) {
            for (let cc = 0; cc < 3; cc++) {
                if (board[boxRow + rr][boxCol + cc] === val) return false
            }
        }
        return true
    }

    function fillCell(pos: number): boolean {
        if (pos === 81) return true
        const row = Math.floor(pos / 9)
        const col = pos % 9

        const digits = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5)
        for (let d of digits) {
            if (canPlace(row, col, d)) {
                board[row][col] = d
                if (fillCell(pos + 1)) return true
                board[row][col] = 0
            }
        }
        return false
    }

    fillCell(0)
    return board
}

// Remove cells while checking uniqueness
function removeCellsUnique(board: number[][], minCells: number, maxCells: number): number[][] {
    const puzzle = board.map(row => [...row])
    const cellsToKeep = Math.floor(Math.random() * (maxCells - minCells + 1) + minCells)
    let cellsRemoved = 81 - cellsToKeep

    while (cellsRemoved > 0) {
        const row = Math.floor(Math.random() * 9)
        const col = Math.floor(Math.random() * 9)
        if (puzzle[row][col] !== 0) {
            const temp = puzzle[row][col]
            puzzle[row][col] = 0

            // Check if puzzle still has exactly 1 solution
            const solCount = countSolutions(puzzle)
            if (solCount !== 1) {
                // revert
                puzzle[row][col] = temp
            } else {
                cellsRemoved--
            }
        }
    }
    return puzzle
}

export function generateSudoku(difficulty: DifficultyKey) {
    const [minCells, maxCells] = DIFFICULTY_CELLS_VISIBLE[difficulty as Difficulty]
    const solution = generateFullSolution()
    const puzzle = removeCellsUnique(solution, minCells, maxCells)
    return { puzzle, solution }
}
