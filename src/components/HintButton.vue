<template>
  <button :disabled="hintsUsed >= 10 || puzzleComplete" @click="giveHint">
    Hint ({{ 10 - hintsUsed }} left)
  </button>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import {useSudokuStore} from "../store/sudokuStore";

export default defineComponent({
  name: 'HintButton',
  setup() {
    const store = useSudokuStore()

    const hintsUsed = computed(() => store.hintsUsed)
    const puzzleComplete = computed(() => {
      return store.puzzle.flat().every(val => val !== 0)
    })

    function giveHint() {
      store.useHint()
    }

    return {
      hintsUsed,
      puzzleComplete,
      giveHint
    }
  }
})
</script>
