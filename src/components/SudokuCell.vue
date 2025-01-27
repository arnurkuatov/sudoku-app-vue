<template>
  <div
      class="cell-wrapper"
      :class="{
      'prefilled': isPreFilled,
      'error': isError
    }"
  >
    <!-- Prefilled cell: bold, italic, distinct background -->
    <div v-if="isPreFilled" class="prefilled-text">
      {{ value }}
    </div>

    <!-- If empty (value == 0), show input or draft approach -->
    <div v-else>
      <!-- If there's any draft digits or in draft mode, show them (omitted for brevity).
           Otherwise, show normal single input. -->
      <template v-if="draftDigits.size > 0 || isDraftMode">
        <div class="drafts">
          <span
              v-for="n in 9"
              :key="n"
              class="draft-number"
              :class="{ active: draftDigits.has(n) }"
              @click="onDraftClick(n)"
          >
            {{ n }}
          </span>
        </div>
      </template>
      <input
          v-else
          class="cell-input"
          type="text"
          maxlength="1"
          v-model="cellValue"
          @keydown="onKeydown"
          @input="onInput"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue'
import {useSudokuStore} from "../store/sudokuStore";

export default defineComponent({
  name: 'SudokuCell',
  props: {
    row: { type: Number, required: true },
    col: { type: Number, required: true },
    value: { type: Number, required: true },
    isPreFilled: { type: Boolean, required: true }
  },
  setup(props) {
    const store = useSudokuStore()

    // local input for the <input> only if puzzle cell is 0 => display ''
    const cellValue = ref(props.value === 0 ? '' : String(props.value))
    const isError = ref(false)

    // Draft logic
    const isDraftMode = computed(() => store.isDraftMode)
    const draftDigits = computed(() => {
      return store.draft[props.row][props.col]
    })

    // Watch puzzle changes from outside (undo/redo, hints, etc.)
    watch(
        () => props.value,
        (newVal) => {
          if (newVal === 0) {
            cellValue.value = ''
          } else {
            cellValue.value = String(newVal)
          }
        }
    )

    function onKeydown(e: KeyboardEvent) {
      // If the store says this is an original puzzle clue => block editing
      if (props.isPreFilled) {
        e.preventDefault()
        return
      }

      // Otherwise, user can edit freely, so just block invalid keys
      const validKeys = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab']
      if (!validKeys.includes(e.key) && !/^[1-9]$/.test(e.key)) {
        e.preventDefault()
      }
    }

    function onInput(e: Event) {
      if (props.isPreFilled) return

      const val = (e.target as HTMLInputElement).value
      if (!/^[1-9]$/.test(val)) {
        // invalid or empty => keep it blank
        cellValue.value = ''
        return
      }
      const digit = parseInt(val, 10)
      if (isDraftMode.value) {
        store.toggleDraft(props.row, props.col, digit)
        cellValue.value = ''
      } else {
        const success = store.validateAndSet(props.row, props.col, digit)
        if (!success) {
          // trigger error animation
          isError.value = true
          cellValue.value = ''
          // revert puzzle cell
          store.puzzle[props.row][props.col] = 0
          setTimeout(() => {
            isError.value = false
          }, 400)
        }
      }
    }

    // Clicking on a draft number toggles it
    function onDraftClick(n: number) {
      if (props.isPreFilled) return
      store.toggleDraft(props.row, props.col, n)
    }

    return {
      cellValue,
      isError,
      isDraftMode,
      draftDigits,
      onKeydown,
      onInput,
      onDraftClick
    }
  }
})
</script>

<style scoped>
.cell-wrapper {
  width: 40px;
  height: 40px;
  border-right: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.cell-wrapper:nth-child(3n) {
  border-right: 2px solid #000;
}

/* For prefilled cells, we do a special background + text style */
.prefilled {
  background-color: #e2e2e2;
}
.prefilled-text {
  font-weight: bold;
  font-style: italic;
  font-size: 1rem;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* If user has placed a final digit (not prefilled), just normal style */
.final-value {
  font-size: 1rem;
}

/* If cell is empty, we show either draft or an input */
.cell-input {
  width: 100%;
  height: 100%;
  text-align: center;
  border: none;
  background-color: transparent;
  outline: none;
  font-size: 1rem;
}

/* Draft mini-grid example */
.drafts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  height: 100%;
  align-items: center;
  justify-items: center;
}
.draft-number {
  font-size: 0.6rem;
  color: #aaa;
  cursor: pointer;
  width: 12px;
}
.draft-number.active {
  font-weight: bold;
  color: #333;
}

/* Error animation for a wrong digit attempt */
.error {
  background: red;
  animation: shake 0.4s;
}
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  50% { transform: translateX(3px); }
  75% { transform: translateX(-3px); }
  100% { transform: translateX(0); }
}
</style>
