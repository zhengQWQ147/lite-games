<script setup lang="ts">
import { reactive, computed, onMounted, onUnmounted } from 'vue'
import { GameWin, MoveType } from '../stores/game2048'

const game = reactive(new GameWin())

// 滑动起点
const startPos = { x: 0, y: 0 }
const MIN_SWIPE = 30

function swipeDir(ex: number, ey: number) {
  const dx = ex - startPos.x
  const dy = ey - startPos.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  if (Math.max(absDx, absDy) < MIN_SWIPE) return

  if (absDx > absDy) {
    game.move(dx > 0 ? MoveType.right : MoveType.left)
  } else {
    game.move(dy > 0 ? MoveType.down : MoveType.up)
  }
}

// 触摸
function handleTouchStart(e: TouchEvent) {
  startPos.x = e.touches[0]!.clientX
  startPos.y = e.touches[0]!.clientY
}

function handleTouchEnd(e: TouchEvent) {
  swipeDir(e.changedTouches[0]!.clientX, e.changedTouches[0]!.clientY)
}

// 鼠标拖拽
function handleMouseDown(e: MouseEvent) {
  startPos.x = e.clientX
  startPos.y = e.clientY
}

function handleMouseUp(e: MouseEvent) {
  swipeDir(e.clientX, e.clientY)
}

// 键盘支持（桌面调试）
function handleKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowUp': game.move(MoveType.up); break
    case 'ArrowDown': game.move(MoveType.down); break
    case 'ArrowLeft': game.move(MoveType.left); break
    case 'ArrowRight': game.move(MoveType.right); break
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

// 格子颜色
const cellColors: Record<number, { bg: string; color: string }> = {
  0: { bg: 'rgba(238, 228, 218, 0.35)', color: '#776e65' },
  1: { bg: '#eee4da', color: '#776e65' },
  2: { bg: '#ede0c8', color: '#776e65' },
  3: { bg: '#f2b179', color: '#f9f6f2' },
  4: { bg: '#f59563', color: '#f9f6f2' },
  5: { bg: '#f67c5f', color: '#f9f6f2' },
  6: { bg: '#f65e3b', color: '#f9f6f2' },
  7: { bg: '#edcf72', color: '#f9f6f2' },
  8: { bg: '#edcc61', color: '#f9f6f2' },
  9: { bg: '#edc850', color: '#f9f6f2' },
  10: { bg: '#edc53f', color: '#f9f6f2' },
  11: { bg: '#edc22e', color: '#f9f6f2' },
}

// 格子列表（用于绝对定位渲染）
const tileList = computed(() => {
  const tiles: { id: number; level: number; row: number; col: number; isNew: boolean; isMerged: boolean }[] = []
  for (let r = 0; r < game.row; r++) {
    for (let c = 0; c < game.col; c++) {
      const cell = game.valueUp[r]![c]!
      if (cell.level > 0) {
        tiles.push({
          id: cell.tileId,
          level: cell.level,
          row: r,
          col: c,
          isNew: game.newCells[r]?.[c] ?? false,
          isMerged: game.mergeCells[r]?.[c] ?? false,
        })
      }
    }
  }
  return tiles
})
</script>

<template>
  <div class="game-2048" @touchstart="handleTouchStart" @touchmove.prevent @touchend="handleTouchEnd"
    @mousedown="handleMouseDown" @mouseup="handleMouseUp">
    <div class="header">
      <div class="score">分数: {{ game.score }}</div>
      <button class="undo-btn" @click="game.rollbackMove()">撤回</button>
    </div>
    <div class="board">
      <!-- 背景网格 -->
      <div class="grid-bg">
        <div v-for="(bgCell, idx) in game.valueDown.flat()" :key="idx" class="cell-bg"
          :class="`bg-${bgCell.type}`">
          <span v-if="bgCell.type === 1" class="bg-icon">🕳</span>
          <span v-else-if="bgCell.type === 2" class="bg-icon">✖2</span>
          <span v-else-if="bgCell.type === 3" class="bg-icon">!</span>
        </div>
      </div>
      <!-- 格子层 -->
      <div class="tile-layer">
        <div v-for="tile in tileList" :key="tile.id" class="tile"
          :class="{ 'tile-new': tile.isNew, 'tile-merge': tile.isMerged }" :style="{
            left: `calc(8px + ${tile.col} * (20% - 1.6px) + (20% - 9.6px) * 0.075)`,
            top: `calc(8px + ${tile.row} * (20% - 1.6px) + (20% - 9.6px) * 0.075)`,
            width: 'calc((20% - 9.6px) * 0.85)',
            height: 'calc((20% - 9.6px) * 0.85)',
            backgroundColor: cellColors[tile.level]?.bg ?? '#3c3a32',
            color: cellColors[tile.level]?.color ?? '#f9f6f2',
            fontSize: tile.level >= 10 ? 'min(3.5vw, 18px)' : 'min(5vw, 26px)',
          }">
          {{ 2 ** tile.level }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-2048 {
  touch-action: none;
  user-select: none;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  font-family: 'Arial', sans-serif;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.score {
  font-size: 24px;
  font-weight: bold;
  color: #776e65;
}

.undo-btn {
  padding: 8px 20px;
  font-size: 16px;
  font-weight: bold;
  color: #f9f6f2;
  background: #8f7a66;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.undo-btn:active {
  background: #6b5a4e;
}

.board {
  position: relative;
  width: 100%;
  max-width: 500px;
  aspect-ratio: 1;
}

.grid-bg {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 8px;
  background: #bbada0;
  border-radius: 8px;
  width: 100%;
  aspect-ratio: 1;
}

.cell-bg {
  border-radius: 4px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  transition: background 0.3s;
}

.bg-0 {
  background: rgba(238, 228, 218, 0.35);
}

.bg-1 {
  background: linear-gradient(135deg, #2d1b4e, #1a0a2e);
  box-shadow: inset 0 0 8px rgba(100, 0, 200, 0.3);
}

.bg-2 {
  background: linear-gradient(135deg, #fff3cd, #ffe69c);
  box-shadow: inset 0 0 6px rgba(255, 193, 7, 0.4);
}

.bg-3 {
  background: linear-gradient(135deg, #fce4ec, #f8bbd0);
  box-shadow: inset 0 0 6px rgba(244, 67, 54, 0.3);
}

.bg-icon {
  pointer-events: none;
  font-size: 14px;
  line-height: 1;
}

.bg-1 .bg-icon {
  color: #b388ff;
  font-size: 16px;
}

.bg-2 .bg-icon {
  color: #b8860b;
  font-size: 11px;
}

.bg-3 .bg-icon {
  color: #c62828;
  font-weight: 900;
  font-size: 16px;
}

.tile-layer {
  position: absolute;
  inset: 0;
  padding: 8px;
}

.tile {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-radius: 4px;
  transition: left 0.12s ease, top 0.12s ease;
  z-index: 1;
}

.tile-new {
  animation: pop-in 0.2s ease;
}

.tile-merge {
  animation: merge-pulse 0.2s ease;
  z-index: 2;
}

@keyframes pop-in {
  0% {
    transform: scale(0);
  }

  60% {
    transform: scale(1.08);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes merge-pulse {
  0% {
    transform: scale(1);
  }

  40% {
    transform: scale(1.15);
  }

  100% {
    transform: scale(1);
  }
}
</style>
