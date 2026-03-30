import * as THREE from 'three'
import type { GridCoords } from '../types'

export class GridMesh {
  readonly object: THREE.Group
  private readonly highlight: THREE.Mesh

  constructor(private readonly gridSize: number) {
    this.object = new THREE.Group()
    this.object.add(this.buildGround())
    this.object.add(this.buildGridLines())
    this.highlight = this.buildHighlight()
    this.object.add(this.highlight)
  }

  private buildGround(): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(this.gridSize, this.gridSize)
    const mat = new THREE.MeshLambertMaterial({ color: 0x7aad7a })
    const ground = new THREE.Mesh(geo, mat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    return ground
  }

  private buildGridLines(): THREE.Group {
    const group = new THREE.Group()
    const mat = new THREE.LineBasicMaterial({ color: 0x5a9e5a, opacity: 0.4, transparent: true })
    const half = this.gridSize / 2

    for (let i = 0; i <= this.gridSize; i++) {
      const t = i - half
      group.add(this.makeLine(mat, -half, t, half, t)) // horizontal
      group.add(this.makeLine(mat, t, -half, t, half)) // vertical
    }

    return group
  }

  private makeLine(
    mat: THREE.LineBasicMaterial,
    x1: number,
    z1: number,
    x2: number,
    z2: number,
  ): THREE.Line {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x1, 0.01, z1),
      new THREE.Vector3(x2, 0.01, z2),
    ])
    return new THREE.Line(geo, mat)
  }

  private buildHighlight(): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(0.94, 0.94)
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      opacity: 0.3,
      transparent: true,
      depthWrite: false,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.x = -Math.PI / 2
    mesh.position.y = 0.02
    mesh.visible = false
    return mesh
  }

  setHighlight(coords: GridCoords | null): void {
    if (!coords) {
      this.highlight.visible = false
      return
    }
    const half = this.gridSize / 2
    this.highlight.position.set(coords.x - half + 0.5, 0.02, coords.z - half + 0.5)
    this.highlight.visible = true
  }
}
