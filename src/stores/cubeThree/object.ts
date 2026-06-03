import * as THREE from 'three'

//三阶魔方类
export class Cube {
  geometry = new THREE.BoxGeometry(1, 1, 1)
  materials = [
    new THREE.MeshStandardMaterial({ color: 0x00ff00 }), // 右 (x+) : 绿色
    new THREE.MeshStandardMaterial({ color: 0x0000ff }), // 左 (x-) : 蓝色
    new THREE.MeshStandardMaterial({ color: 0xffffff }), // 上 (y+) : 白色
    new THREE.MeshStandardMaterial({ color: 0xffff00 }), // 下 (y-) : 黄色
    new THREE.MeshStandardMaterial({ color: 0xff0000 }), // 前 (z+) : 红色
    new THREE.MeshStandardMaterial({ color: 0xffa500 }), // 后 (z-) : 橙色（#ffa500）
  ]
  // 添加黑色边框
  edgesGeo = new THREE.EdgesGeometry(this.geometry)
  edgesMat = new THREE.LineBasicMaterial({ color: 0x000000 })
  wireframe = new THREE.LineSegments(this.edgesGeo, this.edgesMat)

  //魔方主体
  public cube = new THREE.Group()
  public meshs: THREE.Mesh[] = []

  // 面映射: 面 → { axis, layer, cw(顺时针角度倍率) }
  FACES: Record<string, { axis: 'x' | 'y' | 'z'; layer: number; cw: number }> = {
    U: { axis: 'y', layer: 1, cw: -1 },
    D: { axis: 'y', layer: -1, cw: 1 },
    R: { axis: 'x', layer: 1, cw: -1 },
    L: { axis: 'x', layer: -1, cw: 1 },
    F: { axis: 'z', layer: 1, cw: -1 },
    B: { axis: 'z', layer: -1, cw: 1 },
  }

  constructor() {
    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++) {
          const box = new THREE.Mesh(this.geometry, this.materials)
          box.position.set(x, y, z)
          const wf = this.wireframe.clone()
          wf.raycast = () => {}
          box.add(wf)
          box.userData = { id: { x: x, y: y, z: z } }
          this.cube.add(box)
          this.meshs.push(box)
        }
  }

  //给数组位置，返回box坐标
  getLocation(n: number): { x: number; y: number; z: number } {
    let cnt = 0
    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++) {
          if (cnt++ === n)
            return {
              x: x,
              y: y,
              z: z,
            }
        }
    return { x: 11, y: 45, z: 14 }
  }

  // 给box坐标，返回数组位置
  getPos(x: number, y: number, z: number): number {
    return (x + 1) * 9 + (y + 1) * 3 + (z + 1)
  }

  private _rotating = false

  /** 旋转一层（带动画） */
  rotateLayer(
    rotAxis: 'x' | 'y' | 'z',
    layer: number,
    angle: number = Math.PI / 2,
    filterAxis?: 'x' | 'y' | 'z',
  ): Promise<void> {
    if (this._rotating) return Promise.resolve()

    const pivot = this._attachLayer(rotAxis, layer, filterAxis)
    if (!pivot) return Promise.resolve()

    const duration = 250
    const start = performance.now()

    return new Promise((resolve) => {
      const tick = () => {
        const t = Math.min((performance.now() - start) / duration, 1)
        const eased = 1 - Math.pow(1 - t, 3)
        pivot.rotation[rotAxis] = angle * eased
        if (t < 1) {
          requestAnimationFrame(tick)
        } else {
          pivot.rotation[rotAxis] = angle
          this._detachLayer(pivot)
          resolve()
        }
      }
      tick()
    })
  }
  //旋转处理
  rotateFace(name: string, clockwise: boolean) {
    const face = this.FACES[name]
    if (!face) return
    const angle = ((clockwise ? face.cw : -face.cw) * Math.PI) / 2
    this.rotateLayer(face.axis, face.layer, angle)
  }

  // 内部：挂载层到 pivot
  private _attachLayer(
    rotAxis: 'x' | 'y' | 'z',
    layer: number,
    filterAxis?: 'x' | 'y' | 'z',
  ): THREE.Group | null {
    const fIdx = { x: 0, y: 1, z: 2 }[filterAxis ?? rotAxis]
    const meshes = this.meshs.filter((m) => Math.round(m.position.getComponent(fIdx)) === layer)
    if (meshes.length === 0) return null

    this._rotating = true
    const pivot = new THREE.Group()
    pivot.userData._meshes = meshes
    this.cube.add(pivot)
    meshes.forEach((m) => pivot.attach(m))
    return pivot
  }

  // 内部：从 pivot 拆回主组
  private _detachLayer(pivot: THREE.Group) {
    const meshes = pivot.userData._meshes as THREE.Mesh[]
    meshes.forEach((m) => this.cube.attach(m))
    this.cube.remove(pivot)
    this._rotating = false
  }
}
