import { describe, it, expect } from 'vitest'
import {Difficulty, generateSudoku} from "../../utils/sudokuGenerator";
import {countSolutions} from "../../utils/sudokuSolver";

describe('sudokuGenerator', () => {
    it('generates puzzles within the correct range of visible cells for each difficulty', () => {
        const difficulties = [
            Difficulty.BEGINNER,
            Difficulty.INTERMEDIATE,
            Difficulty.HARD,
            Difficulty.EXPERT
        ]

        const expectedRanges: Record<Difficulty, [number, number]> = {
            [Difficulty.BEGINNER]: [36, 40],
            [Difficulty.INTERMEDIATE]: [32, 36],
            [Difficulty.HARD]: [28, 32],
            [Difficulty.EXPERT]: [24, 28]
        }

        difficulties.forEach(diff => {
            const { puzzle } = generateSudoku(diff)
            const visibleCount = puzzle.flat().filter(x => x !== 0).length

            const [minCells, maxCells] = expectedRanges[diff]
            expect(visibleCount).toBeGreaterThanOrEqual(minCells)
            expect(visibleCount).toBeLessThanOrEqual(maxCells)
        })
    })

    it('generates puzzles that have exactly one solution', () => {
        for (let i = 0; i < 3; i++) {
            const { puzzle } = generateSudoku(Difficulty.BEGINNER)
            const solutions = countSolutions(puzzle)
            expect(solutions).toBe(1)
        }
    })
})
