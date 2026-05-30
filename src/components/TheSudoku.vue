<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useSudokuStore, CellStyle } from '../stores/sudoku'

const store = useSudokuStore()
const rootRef = ref<HTMLElement | null>(null)

onMounted(() => {
  store.newGame()
  calcSize()
  window.addEventListener('resize', calcSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', calcSize)
})

function calcSize() {
  const w = document.documentElement.clientWidth
  const h = document.documentElement.clientHeight

  // Width: board = cellSize * 9 + borders + padding
  const fromW = Math.floor((w - 48) / 9)
  // Height: board(cellSize*9+12) + title + numPad + btn + gaps
  const fromH = Math.floor((h - 165) / 9)

  let size = Math.min(fromW, fromH, 50)
  size = Math.max(size, 28)

  if (rootRef.value) {
    rootRef.value.style.setProperty('--cell-size', `${size}px`)
  }
}

function cellClass(cell: { value: number; style: CellStyle; isClue: boolean }) {
  return {
    cell: true,
    clue: cell.isClue,
    selected: cell.style === CellStyle.Selected,
    related: cell.style === CellStyle.Related,
    error: cell.style === CellStyle.Error,
  }
}

function onCellClick(row: number, col: number) {
  store.selectCell(row, col)
}

function onNumberClick(num: number) {
  store.fillNumber(num)
}

function onErase() {
  store.erase()
}
</script>

<template>
  <div ref="rootRef" class="sudoku">
    <h1 class="title">数独</h1>
    <h2>是否有解：{{ store.solvable ? '有解' : '无解' }}</h2>
    <div class="board">
      <div v-for="(row, r) in store.board.cells" :key="r" class="row">
        <div v-for="(cell, c) in row" :key="c" class="cell-wrapper" :class="{
          'border-right': c % 3 === 2 && c !== 8,
          'border-bottom': r % 3 === 2 && r !== 8,
        }">
          <button :class="cellClass(cell)" @click="onCellClick(r, c)">
            {{ cell.value || '' }}
          </button>
        </div>
      </div>
    </div>

    <div class="controls">
      <button v-for="n in 9" :key="n" class="num-btn" @click="onNumberClick(n)">
        {{ n }}
      </button>
      <button class="num-btn erase-btn" @click="onErase()">
        ✕
      </button>
    </div>

    <button class="new-game-btn" @click="store.newGame()">
      新游戏
    </button>
  </div>
</template>

<style scoped>
.sudoku {
  --cell-size: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--cell-size) * 0.25);
  user-select: none;
  width: 100%;
  max-width: 500px;
  padding: 0 12px;
}

.title {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  line-height: 1;
  padding: 2px 0;
}

/* Board */
.board {
  display: inline-flex;
  flex-direction: column;
  border: 3px solid #333;
  border-radius: 4px;
  overflow: hidden;
}

.row {
  display: flex;
}

.cell-wrapper {
  display: flex;
}

.cell-wrapper.border-right {
  border-right: 3px solid #333;
}

.cell-wrapper.border-bottom {
  border-bottom: 3px solid #333;
}

.cell {
  width: var(--cell-size);
  height: var(--cell-size);
  border: none;
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  background: #fff;
  font-size: calc(var(--cell-size) * 0.45);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #1565c0;
  font-weight: 400;
  transition: background-color 0.1s;
}

.row .cell-wrapper:last-child .cell {
  border-right: none;
}

.row:last-child .cell-wrapper .cell {
  border-bottom: none;
}

.cell:hover {
  background: #f5f5f5;
}

.cell.clue {
  color: #333;
  font-weight: 700;
}

.cell.selected {
  background: #bbdefb;
}

.cell.related {
  background: #e3f2fd;
}

.cell.error {
  background: #ffcdd2;
  color: #c62828;
}

/* Number pad - 底部一排 */
.controls {
  display: flex;
  gap: calc(var(--cell-size) * 0.08);
  width: calc(var(--cell-size) * 9 + 12px);
}

.num-btn {
  flex: 1;
  min-width: 0;
  aspect-ratio: 1 / 1.1;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  font-size: calc(var(--cell-size) * 0.45);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background-color 0.15s;
}

.num-btn:hover {
  background: #e3f2fd;
}

.num-btn:active {
  background: #bbdefb;
}

.erase-btn {
  font-size: calc(var(--cell-size) * 0.38);
  color: #888;
}

/* New game */
.new-game-btn {
  width: calc(var(--cell-size) * 9 + 12px);
  padding: calc(var(--cell-size) * 0.25) 0;
  border: none;
  border-radius: 8px;
  background: #1565c0;
  color: #fff;
  font-size: calc(var(--cell-size) * 0.4);
  cursor: pointer;
  transition: background-color 0.15s;
}

.new-game-btn:hover {
  background: #1976d2;
}

.new-game-btn:active {
  background: #0d47a1;
}
</style>
