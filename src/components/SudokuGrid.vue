<template>
  <div class="sudoku-grid">
    <div
        v-for="(rowData, rowIndex) in puzzle"
        :key="rowIndex"
        class="sudoku-row"
        :class="{
        'highlight-row': completedRows.has(rowIndex)
      }"
    >
      <SudokuCell
          v-for="(cellValue, colIndex) in rowData"
          :key="colIndex"
          :row="rowIndex"
          :col="colIndex"
          :value="cellValue"
          :isPreFilled="isCellPrefilled(rowIndex, colIndex)"
          :class="cellBoxClass(rowIndex, colIndex)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue'
import SudokuCell from './SudokuCell.vue'
import {useSudokuStore} from "../store/sudokuStore";

export default defineComponent({
  name: 'SudokuGrid',
  components: { SudokuCell },
  setup() {
    const sudokuStore = useSudokuStore()
    const puzzle = computed(() => sudokuStore.puzzle)

    // Row & Box ephemeral highlight
    const completedRows = ref<Set<number>>(new Set())
    const completedBoxes = ref<Set<number>>(new Set())

    // A deep watch on puzzle to detect changes
    watch(puzzle, () => {
      checkCompletion()
    }, { deep: true })

    onMounted(() => {
      checkCompletion()
    })

    function isCellPrefilled(row: number, col: number) {
      return sudokuStore.isCellPrefilled(row, col)
    }

    function checkCompletion() {
      const newCompleteRows = findCompleteRows()
      const newCompleteBoxes = findCompleteBoxes()

      // highlight newly completed rows
      newCompleteRows.forEach(r => {
        if (!completedRows.value.has(r)) {
          completedRows.value.add(r)
          // remove after 1 second
          setTimeout(() => {
            completedRows.value.delete(r)
          }, 1000)
        }
      })

      // highlight newly completed boxes
      newCompleteBoxes.forEach(b => {
        if (!completedBoxes.value.has(b)) {
          completedBoxes.value.add(b)
          setTimeout(() => {
            completedBoxes.value.delete(b)
          }, 1000)
        }
      })
    }

    function findCompleteRows(): number[] {
      const rowsDone: number[] = []
      for (let r = 0; r < 9; r++) {
        const rowVals = puzzle.value[r]
        if (isGroupComplete(rowVals)) {
          rowsDone.push(r)
        }
      }
      return rowsDone
    }

    function findCompleteBoxes(): number[] {
      const boxesDone: number[] = []
      for (let boxRow = 0; boxRow < 3; boxRow++) {
        for (let boxCol = 0; boxCol < 3; boxCol++) {
          const arr: number[] = []
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
              arr.push(puzzle.value[boxRow * 3 + r][boxCol * 3 + c])
            }
          }
          if (isGroupComplete(arr)) {
            const boxIndex = boxRow * 3 + boxCol
            boxesDone.push(boxIndex)
          }
        }
      }
      return boxesDone
    }

    // A row or box is "complete" if it has 1..9 distinct, no 0
    function isGroupComplete(nums: number[]): boolean {
      if (nums.includes(0)) return false
      const set = new Set(nums)
      return set.size === 9
    }

    // For each cell, if its box is complete, we add a highlight class
    function cellBoxClass(row: number, col: number): Record<string, boolean> {
      const boxRow = Math.floor(row / 3)
      const boxCol = Math.floor(col / 3)
      const boxIndex = boxRow * 3 + boxCol
      return {
        'highlight-box': completedBoxes.value.has(boxIndex)
      }
    }

    return {
      puzzle,
      isCellPrefilled,
      completedRows,
      completedBoxes,
      cellBoxClass
    }
  }
})
</script>

<style scoped>
.sudoku-grid {
  display: inline-block;
  border: 2px solid #000;
}
.sudoku-row {
  display: flex;
  border-bottom: 1px solid #ccc;
}
.sudoku-row:nth-child(3n) {
  border-bottom: 2px solid #000;
}
.highlight-row {
  animation: row-flash 1s ease;
}
@keyframes row-flash {
  0% { background-color: inherit; }
  50% { background-color: #d8ffc1; }
  100% { background-color: inherit; }
}

/* highlight-box is added to each cell in that 3×3 box for 1s */
.highlight-box {
  animation: box-flash 1s ease;
}
@keyframes box-flash {
  0% { background-color: inherit; }
  50% { background-color: #f6e49c; }
  100% { background-color: inherit; }
}
</style>
