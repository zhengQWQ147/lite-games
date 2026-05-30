<script setup lang="ts">
import { useRouter } from 'vue-router'
import TheGame2048 from '@/components/TheGame2048.vue';

const router = useRouter()
</script>

<template>
  <main>
    <button class="back-btn" @click="router.push('/')">← 返回</button>
    <TheGame2048 />
  </main>
</template>

<style scoped>
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