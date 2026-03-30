import type { BuildingType, GridCoords } from '../types'

export interface Cell {
  building: BuildingType | null
}

export class Grid {
  readonly size: number
  private readonly cells: Cell[][]

  constructor(size: number) {
    this.size = size
    this.cells = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => ({ building: null })),
    )
  }

  isInBounds(x: number, z: number): boolean {
    return x >= 0 && x < this.size && z >= 0 && z < this.size
  }

  getCell(x: number, z: number): Cell | null {
    if (!this.isInBounds(x, z)) return null
    return this.cells[x]![z]!
  }

  place(coords: GridCoords, building: BuildingType): boolean {
    const cell = this.getCell(coords.x, coords.z)
    if (!cell || cell.building !== null) return false
    cell.building = building
    return true
  }

  getAllBuildings(): BuildingType[] {
    return this.cells
      .flat()
      .map((cell) => cell.building)
      .filter((b): b is BuildingType => b !== null)
  }
}
