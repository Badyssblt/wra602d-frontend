import type { Grid } from './Grid'
import { BUILDING_CONFIG } from './BuildingConfig'
import type { BuildingType } from '../types'

export interface RoadAccessReport {
  /** "x,z" keys of productive buildings reached by a road (directly or via cluster). */
  served: Set<string>
  /** "x,z" keys of productive buildings without road access. */
  unserved: Set<string>
}

const NEIGHBOURS: ReadonlyArray<readonly [number, number]> = [[-1, 0], [1, 0], [0, -1], [0, 1]]

export function cellKey(x: number, z: number): string {
  return `${x},${z}`
}

/** A productive building (=> needs road access for income). */
function isProductive(type: BuildingType): boolean {
  return BUILDING_CONFIG[type].zone !== null
}

/**
 * Walks the grid and returns the set of productive cells that have road access,
 * either directly (a road touches them on a 4-neighbour) or transitively
 * through other productive buildings forming a cluster.
 */
export function computeRoadAccess(grid: Grid): RoadAccessReport {
  const served = new Set<string>()
  const unserved = new Set<string>()
  const visited = new Set<string>()

  for (let x = 0; x < grid.size; x++) {
    for (let z = 0; z < grid.size; z++) {
      const cell = grid.getCell(x, z)
      if (!cell || cell.building === null || !isProductive(cell.building)) continue
      const key = cellKey(x, z)
      if (visited.has(key)) continue

      // BFS this connected component (productive buildings only).
      const component: string[] = []
      let touchesRoad = false
      const queue: Array<[number, number]> = [[x, z]]
      visited.add(key)

      while (queue.length > 0) {
        const [cx, cz] = queue.shift()!
        component.push(cellKey(cx, cz))

        for (const [dx, dz] of NEIGHBOURS) {
          const nx = cx + dx
          const nz = cz + dz
          const ncell = grid.getCell(nx, nz)
          if (!ncell || ncell.building === null) continue

          if (ncell.building === 'road') {
            touchesRoad = true
            continue
          }
          if (!isProductive(ncell.building)) continue

          const nkey = cellKey(nx, nz)
          if (!visited.has(nkey)) {
            visited.add(nkey)
            queue.push([nx, nz])
          }
        }
      }

      const target = touchesRoad ? served : unserved
      for (const k of component) target.add(k)
    }
  }

  return { served, unserved }
}
