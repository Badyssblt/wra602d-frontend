import * as THREE from 'three'
import type { BuildingType } from '../types'

interface BuildingConfig {
  color: number
  width: number
  height: number
  depth: number
}

const CONFIGS: Record<BuildingType, BuildingConfig> = {
  house:  { color: 0xe8864a, width: 0.7,  height: 0.6,  depth: 0.7 },
  office: { color: 0x5b8dd9, width: 0.75, height: 1.4,  depth: 0.75 },
  park:   { color: 0x4caf50, width: 0.85, height: 0.05, depth: 0.85 },
  road:   { color: 0x888888, width: 1.0,  height: 0.04, depth: 1.0 },
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
  return group
}
