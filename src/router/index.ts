import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/sudoku',
      name: 'sudoku',
      component: () => import('../views/SudokuView.vue'),
    },
    {
      path: '/2048',
      name: '2048',
      component: () => import('../views/Game2048View.vue'),
    },
    {
      path: '/cube',
      name: 'cube',
      component: () => import('../views/CubeView.vue'),
    },
    {
      path: '/pgRun',
      name: 'penguinRunning',
      component: () => import('../views/PenguinRuning.vue'),
    },
  ],
})

export default router
