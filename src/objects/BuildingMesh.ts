import * as THREE from 'three'
import type { BuildingType } from '../types'

interface BuildingConfig {
  color: number
  width: number
  height: number
  depth: number
}

const CONFIGS: Record<BuildingType, BuildingConfig> = {
  house:      { color: 0xe8864a, width: 0.7,  height: 0.6,  depth: 0.7 },
  office:     { color: 0x5b8dd9, width: 0.75, height: 1.4,  depth: 0.75 },
  industry:   { color: 0xfbbf24, width: 0.85, height: 0.5,  depth: 0.85 },
  park:       { color: 0x4caf50, width: 0.85, height: 0.05, depth: 0.85 },
  road:       { color: 0x888888, width: 1.0,  height: 0.04, depth: 1.0 },
  university: { color: 0xa78bfa, width: 0.85, height: 0.9,  depth: 0.85 },
  powerplant: { color: 0xef4444, width: 0.85, height: 1.1,  depth: 0.85 },
  port:       { color: 0x14b8a6, width: 0.9,  height: 0.4,  depth: 0.9 },
}

const materialCache = new Map<BuildingType, THREE.MeshLambertMaterial>()

function getMaterial(type: BuildingType): THREE.MeshLambertMaterial {
  let mat = materialCache.get(type)
  if (!mat) {
    mat = new THREE.MeshLambertMaterial({ color: CONFIGS[type].color })
    materialCache.set(type, mat)
  }
  return mat
}

export function createBuildingMesh(type: BuildingType): THREE.Group {
  const { width, height, depth } = CONFIGS[type]
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), getMaterial(type))
  mesh.position.y = height / 2
  mesh.castShadow = true
  mesh.receiveShadow = true

  const group = new THREE.Group()
  group.add(mesh)

  // Distinctive silhouettes for the more interesting types.
  if (type === 'industry') {
    const chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.09, 0.55, 8),
      new THREE.MeshLambertMaterial({ color: 0x7c2d12 }),
    )
    chimney.position.set(width * 0.3, height + 0.275, depth * 0.3)
    chimney.castShadow = true
    group.add(chimney)
  } else if (type === 'university') {
    // Dome on top to read as "university".
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshLambertMaterial({ color: 0xddd6fe }),
    )
    dome.position.y = height + 0.01
    dome.castShadow = true
    group.add(dome)
  } else if (type === 'powerplant') {
    // Two cooling towers.
    const towerGeom = new THREE.CylinderGeometry(0.16, 0.2, 0.7, 12)
    const towerMat = new THREE.MeshLambertMaterial({ color: 0xdcd2d2 })
    for (const sx of [-1, 1]) {
      const t = new THREE.Mesh(towerGeom, towerMat)
      t.position.set(sx * width * 0.25, height + 0.35, 0)
      t.castShadow = true
      group.add(t)
    }
  } else if (type === 'port') {
    // Crane: a thin vertical pole with a horizontal arm.
    const pole = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.9, 0.06),
      new THREE.MeshLambertMaterial({ color: 0x0f766e }),
    )
    pole.position.set(width * 0.3, height + 0.45, depth * 0.3)
    pole.castShadow = true
    group.add(pole)
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.05, 0.05),
      new THREE.MeshLambertMaterial({ color: 0x0f766e }),
    )
    arm.position.set(width * 0.05, height + 0.85, depth * 0.3)
    arm.castShadow = true
    group.add(arm)
  }

  return group
}
