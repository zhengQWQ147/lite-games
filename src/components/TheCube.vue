<!-- ThreeScene.vue -->
<template>
  <div ref="container" class="three-container" tabindex="0"></div>
  <div class="controls">
    <div class="controls-row">
      <button v-for="f in faceList" :key="f" class="btn" @touchstart.prevent="onFaceClick(f, true)"
        @click="onFaceClick(f, true)">{{ f }}</button>
    </div>
    <div class="controls-row">
      <button v-for="f in faceList" :key="f + '-inv'" class="btn btn-inv" @touchstart.prevent="onFaceClick(f, false)"
        @click="onFaceClick(f, false)">{{ f }}'</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { initScene, onWindowResize, type ThreeContext } from '../stores/cubeThree/scene';
import { Cube } from '../stores/cubeThree/object';
import { startAnimationLoop, stopAnimationLoop } from '../stores/cubeThree/animation';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const container = ref<HTMLElement | null>(null);
let context: ThreeContext | null = null;
let frameId: number | null = null;
let controls: OrbitControls | null = null;
const cube = new Cube()

const faceList = ['U', 'D', 'R', 'L', 'F', 'B'] as const


// 按钮点击
function onFaceClick(name: string, clockwise: boolean) {
  cube.rotateFace(name, clockwise)
}

// 键盘
const handleKeyDown = (event: KeyboardEvent) => {
  const key = event.key.toUpperCase()
  const face = cube.FACES[key]
  if (!face) return
  const angle = (event.shiftKey ? -face.cw : face.cw) * Math.PI / 2
  cube.rotateLayer(face.axis, face.layer, angle)
}

const handleResize = () => {
  if (context) onWindowResize(context);
};

onMounted(() => {
  if (!container.value) return;

  context = initScene(container.value);
  controls = new OrbitControls(context.camera, context.renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  cube.cube.position.set(0, 0, 0)
  context.scene.add(cube.cube);

  frameId = startAnimationLoop(context, (delta) => {
    controls?.update();
  });

  window.addEventListener('resize', handleResize);
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  if (frameId !== null) stopAnimationLoop(frameId);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('keydown', handleKeyDown);
  controls?.dispose();
  if (context) {
    context.renderer.dispose();
  }
});
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 100vh;
  outline: none;
  touch-action: none;
}

.controls {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.55);
  padding: 10px 14px;
  border-radius: 12px;
  backdrop-filter: blur(6px);
}

.controls-row {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.btn {
  width: 40px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.btn-inv {
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.6);
}

.btn:active {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 480px) {
  .btn {
    width: 36px;
    height: 32px;
    font-size: 12px;
  }
}
</style>