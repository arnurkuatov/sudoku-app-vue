export function validateCell(
    puzzle: number[][],
    row: number,
    col: number,
    value: number
): boolean {
    if (value < 1 || value > 9) return false

    if (!puzzle || puzzle.length !== 9 || puzzle[row]?.length !== 9) {
        throw new Error("Puzzle is not a 9x9 array or row/col out of range.");
    }

    // Row check
    for (let c = 0; c < 9; c++) {
        if (c !== col && puzzle[row][c] === value) return false
    }
    // Column check
    for (let r = 0; r < 9; r++) {
        if (r !== row && puzzle[r][col] === value) return false
    }
    // Box check
    const boxRow = Math.floor(row / 3) * 3
    const boxCol = Math.floor(col / 3) * 3
    for (let rr = 0; rr < 3; rr++) {
        for (let cc = 0; cc < 3; cc++) {
            if (!(boxRow + rr === row && boxCol + cc === col)
                && puzzle[boxRow + rr][boxCol + cc] === value) {
                return false
            }
        }
    }
    return true
}
