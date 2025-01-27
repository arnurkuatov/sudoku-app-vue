import { describe, it, expect } from 'vitest'
import {validateCell} from "../../utils/sudokuValidator";

describe('sudokuValidator', () => {
    it('returns true for a valid placement', () => {
        const puzzle = [
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
        expect(validateCell(puzzle, 0, 2, 1)).toBe(true)
    })

    it('returns false if digit duplicates in the row', () => {
        const puzzle = [
            [5,3,0,  0,7,0,  0,0,0],
            [6,0,0,  1,9,5,  0,0,0],
            [0,9,8,  0,0,0,  0,6,0],
        ]
        expect(validateCell(puzzle, 0, 2, 5)).toBe(false)
    })

    it('returns false if digit duplicates in the column', () => {
        const puzzle = [
            [5,3,0,  0,7,0,  0,0,0],
            [6,0,0,  1,9,5,  0,0,0],
            [0,9,8,  0,0,0,  0,6,0],
        ]
        expect(validateCell(puzzle, 1, 0, 5)).toBe(false)
    })

    it('returns false if digit duplicates in the 3x3 box', () => {
        const puzzle = [
            [5,3,0,  0,7,0,  0,0,0],
            [6,0,0,  1,9,5,  0,0,0],
            [0,9,8,  0,0,0,  0,6,0],
        ]
        expect(validateCell(puzzle, 2, 2, 5)).toBe(false)
    })

    it('returns false if digit <1 or >9', () => {
        const puzzle = [
            [0,0,0, 0,0,0, 0,0,0],
        ]
        expect(validateCell(puzzle, 0, 0, 0)).toBe(false)
        expect(validateCell(puzzle, 0, 0, 10)).toBe(false)
    })
})
