import type { BuildingType, GridCoords } from '../types'

export interface Cell {
  building: BuildingType | null
  unlocked: boolean
}

export interface SerializedBuilding {
  type: BuildingType
  posX: number
  posZ: number
}

export interface TileCoords {
  tx: number
  tz: number
}

export interface GridState {
  buildings: SerializedBuilding[]
  /** List of unlocked tile coordinates (each tile = TILE_SIZE × TILE_SIZE cells). */
  unlockedTiles: TileCoords[]
}

/**
 * Cell-level grid where unlocks happen at the *tile* level: a tile is a square
 * of `tileSize × tileSize` cells. The user starts with the center tile and can
 * purchase any tile orthogonally adjacent to one already unlocked.
 */
export class Grid {
  readonly size: number
  readonly tileSize: number
  readonly tilesPerSide: number

  private readonly cells: Cell[][]
  /** tilesUnlocked[tx][tz] === true when the whole tile (tx,tz) is unlocked. */
  private readonly tilesUnlocked: boolean[][]

  constructor(tilesPerSide: number, tileSize: number) {
    this.tilesPerSide = tilesPerSide
    this.tileSize = tileSize
    this.size = tilesPerSide * tileSize

    this.cells = Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => ({ building: null, unlocked: false })),
    )
    this.tilesUnlocked = Array.from({ length: tilesPerSide }, () =>
      Array<boolean>(tilesPerSide).fill(false),
    )

    this.unlockCenterTile()
  }

  // ---------- Cell-level queries ----------

  isInBounds(x: number, z: number): boolean {
    return x >= 0 && x < this.size && z >= 0 && z < this.size
  }

  getCell(x: number, z: number): Cell | null {
    if (!this.isInBounds(x, z)) return null
    return this.cells[x]![z]!
  }

  isUnlocked(x: number, z: number): boolean {
    return this.getCell(x, z)?.unlocked === true
  }

  // ---------- Tile-level API ----------

  /** Returns the tile coordinates a cell belongs to. */
  tileOf(x: number, z: number): TileCoords {
    return { tx: Math.floor(x / this.tileSize), tz: Math.floor(z / this.tileSize) }
  }

  isTileInBounds(tx: number, tz: number): boolean {
    return tx >= 0 && tx < this.tilesPerSide && tz >= 0 && tz < this.tilesPerSide
  }

  isTileUnlocked(tx: number, tz: number): boolean {
    if (!this.isTileInBounds(tx, tz)) return false
    return this.tilesUnlocked[tx]![tz]!
  }

  /** A tile is buyable if it's locked but adjacent (4-way) to an unlocked tile. */
  isTileBuyable(tx: number, tz: number): boolean {
    if (!this.isTileInBounds(tx, tz)) return false
    if (this.tilesUnlocked[tx]![tz]!) return false
    return this.hasUnlockedTileNeighbor(tx, tz)
  }

  unlockTile(tx: number, tz: number): boolean {
    if (!this.isTileBuyable(tx, tz)) return false
    this.markTileUnlocked(tx, tz)
    return true
  }

  /** Returns the world-space center of a tile (used for highlight placement). */
  tileCenter(tx: number, tz: number): { cx: number; cz: number } {
    const half = this.size / 2
    return {
      cx: tx * this.tileSize + this.tileSize / 2 - half,
      cz: tz * this.tileSize + this.tileSize / 2 - half,
    }
  }

  unlockedTilesCount(): number {
    let n = 0
    for (let tx = 0; tx < this.tilesPerSide; tx++) {
      for (let tz = 0; tz < this.tilesPerSide; tz++) {
        if (this.tilesUnlocked[tx]![tz]!) n++
      }
    }
    return n
  }

  // ---------- Mutations ----------

  /** Places a building if its cell is unlocked and empty. */
  place(coords: GridCoords, building: BuildingType): boolean {
    const cell = this.getCell(coords.x, coords.z)
    if (!cell || !cell.unlocked || cell.building !== null) return false
    cell.building = building
    return true
  }

  clear(): void {
    for (let x = 0; x < this.size; x++) {
      for (let z = 0; z < this.size; z++) {
        const cell = this.cells[x]![z]!
        cell.building = null
        cell.unlocked = false
      }
    }
    for (let tx = 0; tx < this.tilesPerSide; tx++) {
      this.tilesUnlocked[tx]!.fill(false)
    }
  }

  reset(): void {
    this.clear()
    this.unlockCenterTile()
  }

  loadFrom(state: GridState): void {
    this.clear()
    if (state.unlockedTiles.length === 0) {
      this.unlockCenterTile()
    } else {
      for (const t of state.unlockedTiles) {
        if (this.isTileInBounds(t.tx, t.tz)) this.markTileUnlocked(t.tx, t.tz)
      }
    }
    for (const b of state.buildings) {
      const cell = this.getCell(b.posX, b.posZ)
      if (cell) {
        // Defensive: a saved building forces its tile to be unlocked.
        const { tx, tz } = this.tileOf(b.posX, b.posZ)
        if (!this.tilesUnlocked[tx]![tz]!) this.markTileUnlocked(tx, tz)
        cell.building = b.type
      }
    }
  }

  // ---------- Queries ----------

  getAllBuildings(): BuildingType[] {
    const out: BuildingType[] = []
    for (let x = 0; x < this.size; x++) {
      for (let z = 0; z < this.size; z++) {
        const b = this.cells[x]![z]!.building
        if (b !== null) out.push(b)
      }
    }
    return out
  }

  serialize(): GridState {
    const buildings: SerializedBuilding[] = []
    const unlockedTiles: TileCoords[] = []
    for (let x = 0; x < this.size; x++) {
      for (let z = 0; z < this.size; z++) {
        const b = this.cells[x]![z]!.building
        if (b !== null) buildings.push({ type: b, posX: x, posZ: z })
      }
    }
    for (let tx = 0; tx < this.tilesPerSide; tx++) {
      for (let tz = 0; tz < this.tilesPerSide; tz++) {
        if (this.tilesUnlocked[tx]![tz]!) unlockedTiles.push({ tx, tz })
      }
    }
    return { buildings, unlockedTiles }
  }

  // ---------- Internal ----------

  private hasUnlockedTileNeighbor(tx: number, tz: number): boolean {
    const deltas: ReadonlyArray<readonly [number, number]> = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    for (const [dx, dz] of deltas) {
      if (this.isTileUnlocked(tx + dx, tz + dz)) return true
    }
    return false
  }

  private markTileUnlocked(tx: number, tz: number): void {
    this.tilesUnlocked[tx]![tz] = true
    const x0 = tx * this.tileSize
    const z0 = tz * this.tileSize
    for (let x = x0; x < x0 + this.tileSize; x++) {
      for (let z = z0; z < z0 + this.tileSize; z++) {
        this.cells[x]![z]!.unlocked = true
      }
    }
  }

  private unlockCenterTile(): void {
    const center = Math.floor(this.tilesPerSide / 2)
    this.markTileUnlocked(center, center)
  }
}
