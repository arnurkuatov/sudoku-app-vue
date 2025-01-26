<template>
  <div class="sudoku-grid">
    <div
        v-for="(rowData, rowIndex) in puzzle"
        :key="rowIndex"
        class="sudoku-row"
        :class="{ 'bottom-border-thick': (rowIndex + 1) % 3 === 0 && rowIndex < 8 }"
    >
      <SudokuCell
          v-for="(cellValue, colIndex) in rowData"
          :key="colIndex"
          :row="rowIndex"
          :col="colIndex"
          :value="cellValue"
          :isPreFilled="isCellPrefilled(rowIndex, colIndex)"
          class="cell"
          :class="{ 'right-border-thick': (colIndex + 1) % 3 === 0 && colIndex < 8 }"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import SudokuCell from './SudokuCell.vue'
import {useSudokuStore} from "../store/sudokuStore";

export default defineComponent({
  name: 'SudokuGrid',
  components: { SudokuCell },
  setup() {
    const store = useSudokuStore()
    const puzzle = computed(() => store.puzzle)

    function isCellPrefilled(row: number, col: number) {
      return store.isCellPrefilled(row, col)
    }

    return {
      puzzle,
      isCellPrefilled
    }
  }
})
</script>

<style scoped>
.sudoku-grid {
  display: inline-block;
  border: 2px solid #000; /* Outer border */
}

/* Each row is displayed in flex row */
.sudoku-row {
  display: flex;
  border-bottom: 1px solid #bbb; /* Normal row border */
}

/* After each 3rd row (except the last one), a thicker border */
.bottom-border-thick {
  border-bottom: 2px solid #000 !important;
}

/* Each cell */
.cell {
  width: 40px;
  height: 40px;
  text-align: center;
  border-right: 1px solid #bbb; /* Normal column border */
  position: relative;
}

/* After each 3rd column (except the last one), a thicker border */
.right-border-thick {
  border-right: 2px solid #000 !important;
}

/* The last row and last column won't need extra bottom/right border if you want a neat final edge. */
.sudoku-row:last-child {
  border-bottom: none;
}
</style>
