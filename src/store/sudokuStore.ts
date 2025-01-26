// src/store/sudokuStore.ts
import { defineStore } from 'pinia'
import {Difficulty, DifficultyKey, generateSudoku} from "../utils/sudokuGenerator";
import {validateCell} from "../utils/sudokuValidator";

export interface LeaderboardRecord {
    name: string
    score: number
    date: string
}

export interface Move {
    row: number
    col: number
    oldValue: number
    newValue: number
    timestamp: number
}

export const useSudokuStore = defineStore('sudoku', {
    state: () => ({
        puzzle: [] as number[][],      // 0 = empty
        solution: [] as number[][],
        difficulty: 'beginner' as DifficultyKey,
        score: 0,
        hintsUsed: 0,
        errors: 0,
        startTime: 0,
        paused: false,
        // Undo/Redo
        moves: [] as Move[],
        currentMoveIndex: -1,
        // Leaderboard
        leaderboard: {
            [Difficulty.BEGINNER]: [] as LeaderboardRecord[],
            [Difficulty.INTERMEDIATE]: [],
            [Difficulty.HARD]: [],
            [Difficulty.EXPERT]: []
        },
        // Draft / Pencil
        isDraftMode: false,
        draft: Array.from({ length: 9 }, () =>
            Array.from({ length: 9 }, () => new Set<number>())
        ) as Set<number>[][],
    }),

    actions: {
        initGame(difficulty: DifficultyKey) {
            this.difficulty = difficulty
            const { puzzle, solution } = generateSudoku(difficulty)
            this.puzzle = puzzle
            this.solution = solution

            // reset
            this.score = 0
            this.hintsUsed = 0
            this.errors = 0
            this.moves = []
            this.currentMoveIndex = -1
            this.startTime = Date.now()
            this.paused = false

            this.draft = Array.from({ length: 9 }, () =>
                Array.from({ length: 9 }, () => new Set<number>())
            )

            this.loadLeaderboard()
        },

        validateAndSet(row: number, col: number, value: number) {
            // If cell matches solution from the get-go, it was 'prefilled'
            if (this.isCellPrefilled(row, col)) return

            const oldVal = this.puzzle[row][col]
            if (oldVal === value) return // no change

            const isValid = validateCell(this.puzzle, row, col, value)
            if (!isValid) {
                this.score -= 1
                this.errors++
                return
            }

            // place the value
            this.puzzle[row][col] = value
            // scoring
            if (value === this.solution[row][col]) {
                this.score += 5
            } else {
                this.score -= 1
            }

            // record move for Undo/Redo
            const move: Move = {
                row,
                col,
                oldValue: oldVal,
                newValue: value,
                timestamp: Date.now()
            }
            // If we've undone some moves, remove future moves
            if (this.currentMoveIndex < this.moves.length - 1) {
                this.moves.splice(this.currentMoveIndex + 1)
            }
            this.moves.push(move)
            this.currentMoveIndex++

            // Clear the draft for that cell if we finalize a digit
            this.draft[row][col].clear()

            this.checkWin()
        },

        // For the puzzle's original (non-zero) cell that matches solution, treat as prefilled
        isCellPrefilled(row: number, col: number) {
            // If puzzle cell equals solution and wasn't changed by user,
            // we can consider it prefilled.
            // Another approach is to store an initial mask.
            return this.solution[row][col] === this.puzzle[row][col] && this.moves.length === 0
        },

        checkWin() {
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (this.puzzle[r][c] !== this.solution[r][c]) {
                        return
                    }
                }
            }
            // Completed
            this.endGame()
        },

        endGame() {
            const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000)
            const finalScore = this.score + (500 - timeElapsed)
            this.score = finalScore
            // add to leaderboard
            this.updateLeaderboard(finalScore)
        },

        updateLeaderboard(finalScore: number) {
            const diff = this.difficulty as Difficulty
            const record: LeaderboardRecord = {
                name: 'Player', // or prompt user for name
                score: finalScore,
                date: new Date().toISOString()
            }
            const arr = this.leaderboard[diff]
            arr.push(record)
            arr.sort((a, b) => b.score - a.score)
            this.leaderboard[diff] = arr.slice(0, 3)
            localStorage.setItem(`leaderboard_${diff}`, JSON.stringify(this.leaderboard[diff]))
        },

        loadLeaderboard() {
            Object.values(Difficulty).forEach((diff) => {
                const data = localStorage.getItem(`leaderboard_${diff}`)
                if (data) {
                    this.leaderboard[diff] = JSON.parse(data) as LeaderboardRecord[]
                }
            })
        },

        useHint() {
            if (this.hintsUsed >= 10) return

            // find an empty cell
            let row = -1, col = -1
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (this.puzzle[r][c] === 0) {
                        row = r
                        col = c
                        break
                    }
                }
                if (row !== -1) break
            }
            if (row === -1) return // no empty cells

            const oldVal = this.puzzle[row][col]
            const correctVal = this.solution[row][col]
            this.puzzle[row][col] = correctVal
            this.hintsUsed++

            // scoring: +5 for correct cell, minus progressive penalty
            this.score += 5
            const penalty = 3 + (this.hintsUsed - 1) // 1st: -3, 2nd: -4...
            this.score -= penalty

            // record as a move
            if (this.currentMoveIndex < this.moves.length - 1) {
                this.moves.splice(this.currentMoveIndex + 1)
            }
            this.moves.push({
                row,
                col,
                oldValue: oldVal,
                newValue: correctVal,
                timestamp: Date.now()
            })
            this.currentMoveIndex++

            this.checkWin()
        },

        // Draft toggling
        toggleDraft(row: number, col: number, digit: number) {
            if (this.isCellPrefilled(row, col)) return
            const s = this.draft[row][col]
            if (s.has(digit)) {
                s.delete(digit)
            } else {
                s.add(digit)
            }
        },

        clearDraft(row: number, col: number) {
            this.draft[row][col].clear()
        },

        // Undo/Redo
        undo() {
            if (this.currentMoveIndex >= 0) {
                const move = this.moves[this.currentMoveIndex]
                this.puzzle[move.row][move.col] = move.oldValue
                this.currentMoveIndex--
            }
        },
        redo() {
            if (this.currentMoveIndex < this.moves.length - 1) {
                this.currentMoveIndex++
                const move = this.moves[this.currentMoveIndex]
                this.puzzle[move.row][move.col] = move.newValue
            }
        },

        // Auto-pause
        pauseGame() {
            if (!this.paused) {
                this.paused = true
                // (If you have a timer that increments every second, you'd stop it here.)
            }
        },
        resumeGame() {
            if (this.paused) {
                this.paused = false
                // (Restart the timer.)
            }
        }
    }
})
