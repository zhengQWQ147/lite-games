import * as THREE from 'three'

export interface ThreeContext {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  container: HTMLElement
}

//初始化场景
export function initScene(container: HTMLElement): ThreeContext {
  const width = container.clientWidth
  const height = container.clientHeight

  //场景
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x282a36)

  //摄像机
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.set(2, 2, 5)
  camera.lookAt(0, 0, 0)

  //创建WebGL渲染器
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.appendChild(renderer.domElement)

  //环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
  scene.add(ambientLight)
  //方向光
  // const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  // directionalLight.position.set(1, 2, 1)
  // scene.add(directionalLight)

  return { scene, camera, renderer, container }
}

//窗口大小自适应函数
export function onWindowResize(context: ThreeContext) {
  const width = context.container.clientWidth
  const height = context.container.clientHeight
  context.camera.aspect = width / height
  context.camera.updateProjectionMatrix()
  context.renderer.setSize(width, height)
}
