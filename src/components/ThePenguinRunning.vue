<template>
  <div ref="container" class="three-container" tabindex="0"></div>
</template>


<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { initScene, onWindowResize, type ThreeContext } from '../stores/penguinRunning/scence';
import { Penguin, Rode } from '../stores/penguinRunning/object'
import { ObjectPool } from '../stores/penguinRunning/roPool'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


const container = ref<HTMLElement | null>(null);
let context: ThreeContext | null = null;
let frameId: number | null = null;
let controls: OrbitControls | null = null;
let penguin: Penguin | null = null;

const rodePool: ObjectPool<Rode> = new ObjectPool<Rode>(() => (new Rode), 10, 2);

onMounted(async () => {
  if (!container.value) return;

  context = initScene(container.value);

  controls = new OrbitControls(context.camera, context.renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  const initRode: Rode = rodePool.acquire();
  initRode.plane.rotateX(Math.PI / 2)
  context.scene.add(initRode.plane)


  // for (let i = 0; i < 5; i++) {
  // for (let j = 0; j < 5; j++) {
  penguin = new Penguin();
  const model = await penguin.ready()
  model.position.set(0, 0, 0)
  context.scene.add(model)

  // 启动渲染循环
  function animate() {
    controls!.update()
    context!.renderer.render(context!.scene, context!.camera)
    frameId = requestAnimationFrame(animate)
  }
  animate()

  window.addEventListener('resize', () => onWindowResize(context!));
});

onBeforeUnmount(() => {
  if (frameId !== null) cancelAnimationFrame(frameId)
  controls?.dispose()
  if (context) context.renderer.dispose()
})
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 100vh;
}
</style>