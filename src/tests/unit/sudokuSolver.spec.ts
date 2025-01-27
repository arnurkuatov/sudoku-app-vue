import { describe, it, expect } from 'vitest'
import {countSolutions} from "../../utils/sudokuSolver";

const singleSolutionPuzzle: number[][] = [
    [5,3,0,  0,7,0,  0,0,0],
    [6,0,0,  1,9,5,  0,0,0],
    [0,9,8,  0,0,0,  0,6,0],

    [8,0,0,  0,6,0,  0,0,3],
    [4,0,0,  8,0,3,  0,0,1],
    [7,0,0,  0,2,0,  0,0,6],

    [0,6,0,  0,0,0,  2,8,0],
    [0,0,0,  4,1,9,  0,0,5],
    [0,0,0,  0,8,0,  0,7,9]
]

const multiSolutionPuzzle: number[][] = [
    [0,0,0,  0,0,0,  0,0,0],
    [0,0,0,  0,0,0,  0, 0,0,0],
    [0,0,0,  0,0,0,  0, 0,0,0],

    [0,0,0,  0,0,0,  0, 0,0,0],
    [0,0,0,  0,0,0,  0, 0,0,0],
    [0,0,0,  0,0,0,  0, 0,0,0],

    [0,0,0,  0,0,0,  0, 0,0,0],
    [0,0,0,  0,0,0,  0, 0,0,0],
    [0,0,0,  0,0,0,  0, 0,0,0]
]

describe('sudokuSolver', () => {
    it('counts exactly 1 solution for a known single-solution puzzle', () => {
        const result = countSolutions(singleSolutionPuzzle)
        expect(result).toBe(1)
    })

    it('detects multiple solutions for a puzzle missing many clues', () => {
        const result = countSolutions(multiSolutionPuzzle)
        expect(result).toBeGreaterThan(1)
    })

    it('returns 0 if puzzle is unsolvable', () => {
        const unsolvablePuzzle: number[][] = JSON.parse(JSON.stringify(singleSolutionPuzzle))
        unsolvablePuzzle[0][0] = 5
        unsolvablePuzzle[0][1] = 5

        const result = countSolutions(unsolvablePuzzle)
        expect(result).toBe(0)
    })
})
