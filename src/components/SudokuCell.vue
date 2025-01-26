<template>
  <div class="cell-wrapper">
    <!-- If the cell was "prefilled" (store logic says it's original puzzle), show a bold digit -->
    <div v-if="isPreFilled" class="prefilled">
      {{ value }}
    </div>
    <!-- Otherwise, it's user-editable -->
    <div v-else>
      <!-- If the cell has a final value (non-zero in puzzle), show that digit -->
      <div v-if="value !== 0" class="final-value">
        {{ value }}
      </div>

      <!-- If the cell is empty (value === 0), show either the draft grid or an <input> -->
      <div v-else>
        <!-- If in draft mode OR we have draft digits, show the mini draft area -->
        <div v-if="draftDigits.size > 0 || isDraftMode" class="drafts">
          <!-- Nine mini-spots for digits 1-9 -->
          <span
              v-for="n in 9"
              :key="n"
              class="draft-number"
              :class="{ active: draftDigits.has(n) }"
              @click="toggleDraft(n)"
          >
            {{ n }}
          </span>
        </div>

        <!-- Otherwise, show a single input field for direct entry -->
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
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue'
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

    /**
     * This local ref holds the text displayed in the <input>.
     * If the puzzle value is 0 (empty), we display '' (empty string).
     */
    const cellValue = ref(props.value === 0 ? '' : String(props.value))

    // Watch for external changes (undo/redo, new puzzle, etc.)
    watch(
        () => props.value,
        (newVal) => {
          cellValue.value = newVal === 0 ? '' : String(newVal)
        }
    )

    // Draft mode is toggled at the store level
    const isDraftMode = computed(() => store.isDraftMode)

    // The set of draft digits for this cell
    const draftDigits = computed(() => {
      return store.draft[props.row][props.col]
    })

    /**
     * Toggle a single digit in draft mode (pencil marks).
     */
    function toggleDraft(n: number) {
      if (props.isPreFilled) return
      store.toggleDraft(props.row, props.col, n)
    }

    /**
     * Prevent invalid keys.
     * - If cell is prefilled, block editing entirely.
     * - Allow digits 1-9, backspace, etc.
     */
    function onKeydown(e: KeyboardEvent) {
      if (props.isPreFilled) {
        e.preventDefault()
        return
      }
      const validKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']
      if (!validKeys.includes(e.key) && !/^[1-9]$/.test(e.key)) {
        e.preventDefault()
      }
    }

    /**
     * On every keystroke in the <input>, check if it's a digit 1-9.
     * If in draft mode, toggle the draft set instead of finalizing the cell.
     * Otherwise, we call store.validateAndSet(row, col, digit).
     */
    function onInput(e: Event) {
      const val = (e.target as HTMLInputElement).value
      if (!/^[1-9]$/.test(val)) {
        // If user typed something invalid, revert to empty
        cellValue.value = ''
        return
      }
      const digit = parseInt(val, 10)
      if (isDraftMode.value) {
        toggleDraft(digit)
        // Clear the input display so that visually it stays empty
        cellValue.value = ''
      } else {
        store.validateAndSet(props.row, props.col, digit)
      }
    }

    return {
      cellValue,
      isDraftMode,
      draftDigits,
      toggleDraft,
      onKeydown,
      onInput
    }
  }
})
</script>

<style scoped>
.cell-wrapper {
  /* This parent <div> ensures the cell layout is controlled by the SudokuGrid styles. */
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.prefilled {
  font-weight: bold;
  font-size: 1.1rem;
  background-color: #e2e2e2;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.final-value {
  font-size: 1.1rem;
}
.cell-input {
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: 1rem;
  border: none;
  outline: none;
  background: transparent;
  caret-color: #333;
}
.drafts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  width: 100%;
  height: 100%;
  place-items: center;
}
.draft-number {
  font-size: 0.6rem;
  color: #aaa;
  cursor: pointer;
}
.draft-number.active {
  font-weight: bold;
  color: #333;
}
</style>
