<script setup lang="ts">
import { reactive, onMounted, onUnmounted } from 'vue'
import { GameWin, MoveType } from '../stores/game2048'

const game = reactive(new GameWin())

// 触摸手势
const touchStart = { x: 0, y: 0 }
const MIN_SWIPE = 30

function handleTouchStart(e: TouchEvent) {
  touchStart.x = e.touches[0]!.clientX
  touchStart.y = e.touches[0]!.clientY
}

function handleTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0]!.clientX - touchStart.x
  const dy = e.changedTouches[0]!.clientY - touchStart.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  if (Math.max(absDx, absDy) < MIN_SWIPE) return

  if (absDx > absDy) {
    game.move(dx > 0 ? MoveType.right : MoveType.left)
  } else {
    game.move(dy > 0 ? MoveType.down : MoveType.up)
  }
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
</script>

<template>
  <div
    class="game-2048"
    @touchstart="handleTouchStart"
    @touchmove.prevent
    @touchend="handleTouchEnd"
  >
    <div class="header">
      <div class="score">分数: {{ game.valueUpCnt }}</div>
      <button class="undo-btn" @click="game.rollbackMove()">撤回</button>
    </div>
    <div class="grid">
      <div
        v-for="(cell, idx) in game.valueUp.flat()"
        :key="idx"
        class="cell"
        :style="{
          backgroundColor: cellColors[cell.level]?.bg ?? '#3c3a32',
          color: cellColors[cell.level]?.color ?? '#f9f6f2',
          fontSize: cell.level >= 10 ? 'min(3.5vw, 18px)' : 'min(5vw, 26px)',
        }"
      >
        {{ cell.level > 0 ? 2 ** cell.level : '' }}
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

.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 8px;
  background: #bbada0;
  border-radius: 8px;
  aspect-ratio: 1;
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-radius: 4px;
  aspect-ratio: 1;
}
</style>
