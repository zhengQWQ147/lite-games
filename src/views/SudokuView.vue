<script setup lang="ts">
import { useRouter } from 'vue-router'
import TheSudoku from '../components/TheSudoku.vue';

const router = useRouter()
</script>

<template>
  <div class="sudoku-view">
    <button class="back-btn" @click="router.push('/')">← 返回</button>
    <TheSudoku />
  </div>
</template>

<style scoped>
.sudoku-view {
  height: 100dvh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.back-btn {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 100;
  padding: 6px 14px;
  font-size: 14px;
  color: #776e65;
  background: rgba(255,255,255,0.85);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}
.back-btn:active {
  background: #eee;
}
</style>
