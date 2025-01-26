<template>
  <div>
    <label for="difficulty">Difficulty: </label>
    <select id="difficulty" v-model="selectedDifficulty">
      <option value="beginner">Beginner</option>
      <option value="intermediate">Intermediate</option>
      <option value="hard">Hard</option>
      <option value="expert">Expert</option>
    </select>
    <button @click="onNewGame">New Game</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import {useSudokuStore} from "../store/sudokuStore";

export default defineComponent({
  name: 'DifficultySelector',
  setup() {
    const store = useSudokuStore()
    const selectedDifficulty = ref('beginner')

    function onNewGame() {
      store.initGame(selectedDifficulty.value)
    }

    return {
      selectedDifficulty,
      onNewGame
    }
  }
})
</script>
