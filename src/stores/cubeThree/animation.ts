// three/animation.ts
import * as THREE from 'three'
import type { ThreeContext } from './scene'

export function startAnimationLoop(
  context: ThreeContext,
  updateCallback?: (deltaTime: number) => void,
): number {
  let lastTime = performance.now()

  const animate = (now: number) => {
    const delta = Math.min(1 / 30, (now - lastTime) / 1000)
    lastTime = now

    if (updateCallback) {
      updateCallback(delta)
    }

    context.renderer.render(context.scene, context.camera)
    requestAnimationFrame(animate)
  }

  const frameId = requestAnimationFrame(animate)
  return frameId
}

export function stopAnimationLoop(frameId: number) {
  cancelAnimationFrame(frameId)
}
