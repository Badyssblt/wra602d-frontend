import * as THREE from 'three'
import type { GridCoords } from '../types'

const GROUND_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

export class BuildingPlacer {
  private readonly raycaster = new THREE.Raycaster()
  private readonly hitPoint = new THREE.Vector3()

  getHoveredCell(
    mouse: THREE.Vector2,
    camera: THREE.Camera,
    gridSize: number,
  ): GridCoords | null {
    this.raycaster.setFromCamera(mouse, camera)
    const hit = this.raycaster.ray.intersectPlane(GROUND_PLANE, this.hitPoint)
    if (!hit) return null

    const half = gridSize / 2
    const x = Math.floor(this.hitPoint.x + half)
    const z = Math.floor(this.hitPoint.z + half)

    if (x < 0 || x >= gridSize || z < 0 || z >= gridSize) return null
    return { x, z }
  }
}
