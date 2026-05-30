<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="home">
    <h1 class="title">Lite Games</h1>
    <p class="subtitle">精选小游戏</p>
    <div class="game-list">
      <div class="game-card" @click="router.push('/sudoku')">
        <span class="game-icon">🗺️</span>
        <span class="game-name">数独</span>
        <span class="game-desc">经典九宫格</span>
      </div>
      <div class="game-card" @click="router.push('/2048')">
        <span class="game-icon">🔢</span>
        <span class="game-name">2048</span>
        <span class="game-desc">合并方块</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #faf8ef;
}

.title {
  font-size: 36px;
  font-weight: 800;
  color: #776e65;
  margin: 0;
}

.subtitle {
  font-size: 14px;
  color: #999;
  margin: 8px 0 40px;
}

.game-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 320px;
}

.game-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 28px 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.game-card:active {
  transform: scale(0.97);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

.game-icon {
  font-size: 36px;
}

.game-name {
  font-size: 20px;
  font-weight: 700;
  color: #776e65;
}

.game-desc {
  font-size: 13px;
  color: #999;
}
</style>
