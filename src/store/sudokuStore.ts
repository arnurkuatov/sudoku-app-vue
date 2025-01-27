import { defineStore } from 'pinia'
import { ref } from 'vue'
import {validateCell} from "../utils/sudokuValidator";
import {Difficulty, DifficultyKey, generateSudoku} from "../utils/sudokuGenerator";

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

export const useSudokuStore = defineStore('sudoku', () => {
    // Puzzle and solution
    const puzzle = ref<number[][]>([])
    const solution = ref<number[][]>([])
    const difficulty = ref<DifficultyKey>('beginner')

    // Keep a 9×9 boolean for which cells are prefilled from the start:
    const prefilled = ref<boolean[][]>(Array.from({ length: 9 }, () =>
        Array.from({ length: 9 }, () => false)
    ))

    // Score, hints, errors, time
    const score = ref(0)
    const hintsUsed = ref(0)
    const errors = ref(0)
    const startTime = ref(0)
    const paused = ref(false)

    // Undo/Redo
    const moves = ref<Move[]>([])
    const currentMoveIndex = ref(-1)

    // Leaderboard
    const leaderboard = ref({
        [Difficulty.BEGINNER]: [] as LeaderboardRecord[],
        [Difficulty.INTERMEDIATE]: [],
        [Difficulty.HARD]: [],
        [Difficulty.EXPERT]: []
    })

    // Draft / Pencil
    const isDraftMode = ref(false)
    const draft = ref<Array<Array<Set<number>>>>(
        Array.from({ length: 9 }, () =>
            Array.from({ length: 9 }, () => new Set<number>())
        )
    )

    function initGame(diffKey: DifficultyKey) {
        difficulty.value = diffKey

        const { puzzle: newPuzzle, solution: newSolution } = generateSudoku(diffKey)
        puzzle.value = newPuzzle
        solution.value = newSolution

        // Mark prefilled cells (where puzzle != 0):
        prefilled.value = Array.from({ length: 9 }, (_, r) =>
            Array.from({ length: 9 }, (_, c) => puzzle.value[r][c] !== 0)
        )

        // reset
        score.value = 0
        hintsUsed.value = 0
        errors.value = 0
        moves.value = []
        currentMoveIndex.value = -1
        draft.value = Array.from({ length: 9 }, () =>
            Array.from({ length: 9 }, () => new Set<number>())
        )

        startTime.value = Date.now()
        paused.value = false

        loadLeaderboard()
    }

    // When checking prefilled, we ONLY rely on `prefilled[row][col]`, never puzzle==solution
    function isCellPrefilled(row: number, col: number) {
        return prefilled.value[row][col]
    }

    function validateAndSet(row: number, col: number, value: number) {
        // If it's truly an original prefilled cell, do not allow changing
        if (isCellPrefilled(row, col)) {
            return false
        }

        // oldVal = the current puzzle digit
        const oldVal = puzzle.value[row][col]

        // 1) Check if conflict
        if (!validateCell(puzzle.value, row, col, value)) {
            // e.g. subtract error points if you do scoring
            return false
        }

        // 2) Overwrite the cell with the new digit
        puzzle.value[row][col] = value

        // 3) Score: If correct vs. solution
        if (value === solution.value[row][col]) {
            score.value += 5
        } else {
            score.value -= 1
        }

        // 4) Record for undo/redo
        const move: Move = {
            row,
            col,
            oldValue: oldVal,
            newValue: value,
            timestamp: Date.now()
        }
        // (If you truncated future moves after currentMoveIndex, do that here)
        moves.value.push(move)
        currentMoveIndex.value++

        // 5) Check if the entire puzzle is solved, etc.
        checkWin()

        return true
    }

    function checkWin() {
        // If puzzle == solution for all cells
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (puzzle.value[r][c] !== solution.value[r][c]) return
            }
        }
        endGame()
    }

    function endGame() {
        const timeElapsed = Math.floor((Date.now() - startTime.value) / 1000)
        const finalScore = score.value + (500 - timeElapsed)
        score.value = finalScore
        updateLeaderboard(finalScore)
    }

    function updateLeaderboard(finalScore: number) {
        const diff = difficulty.value as Difficulty
        const record: LeaderboardRecord = {
            name: 'Player',
            score: finalScore,
            date: new Date().toISOString()
        }
        leaderboard.value[diff].push(record)
        leaderboard.value[diff].sort((a, b) => b.score - a.score)
        leaderboard.value[diff] = leaderboard.value[diff].slice(0, 3)
        localStorage.setItem(`leaderboard_${diff}`, JSON.stringify(leaderboard.value[diff]))
    }

    function loadLeaderboard() {
        Object.values(Difficulty).forEach((diff) => {
            const data = localStorage.getItem(`leaderboard_${diff}`)
            if (data) {
                leaderboard.value[diff] = JSON.parse(data) as LeaderboardRecord[]
            }
        })
    }

    // Hints
    function useHint() {
        if (hintsUsed.value >= 10) return
        // find an empty cell
        let row = -1, col = -1
        outer: for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (puzzle.value[r][c] === 0) {
                    row = r
                    col = c
                    break outer
                }
            }
        }
        if (row === -1) return // no empty cells

        const oldVal = puzzle.value[row][col]
        const correctVal = solution.value[row][col]
        puzzle.value[row][col] = correctVal
        hintsUsed.value++

        // +5 for correct, then progressive penalty
        score.value += 5
        const penalty = 3 + (hintsUsed.value - 1)
        score.value -= penalty

        // record move
        if (currentMoveIndex.value < moves.value.length - 1) {
            moves.value.splice(currentMoveIndex.value + 1)
        }
        moves.value.push({ row, col, oldValue: oldVal, newValue: correctVal, timestamp: Date.now() })
        currentMoveIndex.value++

        checkWin()
    }

    // Draft
    function toggleDraft(row: number, col: number, digit: number) {
        if (isCellPrefilled(row, col)) return
        const set = draft.value[row][col]
        if (set.has(digit)) set.delete(digit)
        else set.add(digit)
    }

    function clearDraft(row: number, col: number) {
        draft.value[row][col].clear()
    }

    // Undo/Redo
    function undo() {
        if (currentMoveIndex.value >= 0) {
            const move = moves.value[currentMoveIndex.value]
            puzzle.value[move.row][move.col] = move.oldValue
            currentMoveIndex.value--
        }
    }
    function redo() {
        if (currentMoveIndex.value < moves.value.length - 1) {
            currentMoveIndex.value++
            const move = moves.value[currentMoveIndex.value]
            puzzle.value[move.row][move.col] = move.newValue
        }
    }

    // Auto-pause
    function pauseGame() {
        if (!paused.value) {
            paused.value = true
        }
    }
    function resumeGame() {
        if (paused.value) {
            paused.value = false
        }
    }

    return {
        puzzle,
        solution,
        difficulty,
        prefilled,

        score,
        hintsUsed,
        errors,
        startTime,
        paused,

        moves,
        currentMoveIndex,

        leaderboard,

        isDraftMode,
        draft,

        initGame,
        isCellPrefilled,
        validateAndSet,
        checkWin,
        endGame,
        updateLeaderboard,
        loadLeaderboard,
        useHint,
        toggleDraft,
        clearDraft,
        undo,
        redo,
        pauseGame,
        resumeGame
    }
})
