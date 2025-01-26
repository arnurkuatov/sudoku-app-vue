<template>
  <div class="app-container">
    <h1>Sudoku Vue + TypeScript</h1>
    <div class="top-panel">
      <DifficultySelector />
      <ScoreBoard />
      <HintButton />
    </div>
    <div class="controls">
      <label>
        <input type="checkbox" v-model="isDraftMode" />
        Draft/Pencil Mode
      </label>
      <button @click="undo">Undo</button>
      <button @click="redo">Redo</button>
    </div>
    <SudokuGrid />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, computed } from 'vue'
import DifficultySelector from './components/DifficultySelector.vue'
import ScoreBoard from './components/ScoreBoard.vue'
import HintButton from './components/HintButton.vue'
import SudokuGrid from './components/SudokuGrid.vue'
import {useSudokuStore} from "./store/sudokuStore";

export default defineComponent({
  name: 'App',
  components: {
    DifficultySelector,
    ScoreBoard,
    HintButton,
    SudokuGrid
  },
  setup() {
    const sudokuStore = useSudokuStore()

    // We'll keep a global "isDraftMode" in the store for convenience:
    const isDraftMode = computed({
      get: () => sudokuStore.isDraftMode,
      set: (val: boolean) => (sudokuStore.isDraftMode = val)
    })

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        sudokuStore.pauseGame()
      } else if (document.visibilityState === 'visible') {
        sudokuStore.resumeGame()
      }
    }

    onMounted(() => {
      document.addEventListener('visibilitychange', handleVisibilityChange)
      // Start a game by default
      sudokuStore.initGame('beginner')
    })

    onUnmounted(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    })

    function undo() {
      sudokuStore.undo()
    }
    function redo() {
      sudokuStore.redo()
    }

    return {
      isDraftMode,
      undo,
      redo
    }
  }
})
</script>

<style scoped>
.app-container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}
.top-panel {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
}
.controls {
  margin-bottom: 1rem;
}
</style>
