import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/Addons.js'

//游戏角色：企鹅
export class Penguin {
  model?: THREE.Group
  private _loaded: Promise<void>

  constructor() {
    this._loaded = new Promise((resolve, reject) => {
      const loader = new GLTFLoader()
      loader.load(
        '/models/高松灯企鹅/企鹅高松灯.glb',
        (gltf: GLTF) => {
          this.model = gltf.scene
          this.model.scale.set(1, 1, 1)
          resolve()
        },
        undefined,
        (error) => {
          console.error('企鹅模型加载失败', error)
          reject(error)
        },
      )
    })
  }

  /** 等待模型加载完成 */
  async ready(): Promise<THREE.Group> {
    await this._loaded
    return this.model!
  }
}

//跑道
export class Rode {
  geometry = new THREE.PlaneGeometry(5, 5)
  material = new THREE.MeshStandardMaterial({ color: 0x44aa88, side: THREE.DoubleSide })
  plane = new THREE.Mesh(this.geometry, this.material)
}

//金币
export class Coin {}

//障碍物
export class Barrier {}
