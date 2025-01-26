<template>
  <div class="scoreboard">
    <div class="current-score">
      <span>Score: {{ score }}</span>
      <span>Time: {{ timeElapsed }}s</span>
    </div>
    <div>
      <h3>Leaderboard (Top 3) - {{ difficulty }}</h3>
      <ol>
        <li v-for="(rec, idx) in topRecords" :key="idx">
          {{ rec.name }} - {{ rec.score }} pts
          ({{ formatDate(rec.date) }})
        </li>
      </ol>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref } from 'vue'
import {useSudokuStore} from "../store/sudokuStore";

export default defineComponent({
  name: 'ScoreBoard',
  setup() {
    const store = useSudokuStore()
    const timeElapsed = ref(0)

    const score = computed(() => store.score)
    const difficulty = computed(() => store.difficulty)
    const topRecords = computed(() => {
      return store.leaderboard[store.difficulty] || []
    })

    // simple local timer
    onMounted(() => {
      const timer = setInterval(() => {
        if (!store.paused && store.startTime) {
          const now = Date.now()
          const elapsed = Math.floor((now - store.startTime) / 1000)
          timeElapsed.value = elapsed
        }
      }, 1000)
    })

    function formatDate(dateStr: string) {
      return new Date(dateStr).toLocaleString()
    }

    return {
      score,
      difficulty,
      timeElapsed,
      topRecords,
      formatDate
    }
  }
})
</script>

<style scoped>
.scoreboard {
  text-align: left;
}
.current-score {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 0.5rem;
}
</style>
