import * as THREE from 'three'
import type { GridCoords } from '../types'
import type { Grid, TileCoords } from '../game/Grid'

export type HighlightKind = 'placement' | 'buyable' | 'invalid' | 'none'

const HIGHLIGHT_COLORS: Record<HighlightKind, number> = {
  placement: 0xffffff,
  buyable: 0xfbbf24,
  invalid: 0xef4444,
  none: 0xffffff,
}

/**
 * Renders the ground (unlocked vs locked cells), grid lines and two highlight
 * meshes:
 *  - a single-cell square that follows the hovered cell when placing/blocked,
 *  - a tile-sized square shown when hovering a buyable locked tile.
 */
export class GridMesh {
  readonly object: THREE.Group

  private readonly cellHighlight: THREE.Mesh
  private readonly cellHighlightMat: THREE.MeshBasicMaterial
  private readonly tileHighlight: THREE.Mesh
  private readonly tileHighlightMat: THREE.MeshBasicMaterial

  private readonly tiles: (THREE.Mesh | null)[][]

  private readonly UNLOCKED_COLOR = 0x7aad7a
  private readonly LOCKED_COLOR = 0x3f4754

  constructor(private readonly grid: Grid) {
    this.object = new THREE.Group()
    this.tiles = Array.from({ length: grid.size }, () =>
      Array<THREE.Mesh | null>(grid.size).fill(null),
    )
    this.buildCellTiles()
    this.object.add(this.buildGridLines())

    this.cellHighlightMat = new THREE.MeshBasicMaterial({
      color: HIGHLIGHT_COLORS.placement,
      opacity: 0.3,
      transparent: true,
      depthWrite: false,
    })
    this.cellHighlight = new THREE.Mesh(new THREE.PlaneGeometry(0.94, 0.94), this.cellHighlightMat)
    this.cellHighlight.rotation.x = -Math.PI / 2
    this.cellHighlight.position.y = 0.04
    this.cellHighlight.visible = false
    this.object.add(this.cellHighlight)

    this.tileHighlightMat = new THREE.MeshBasicMaterial({
      color: HIGHLIGHT_COLORS.buyable,
      opacity: 0.18,
      transparent: true,
      depthWrite: false,
    })
    this.tileHighlight = new THREE.Mesh(
      new THREE.PlaneGeometry(grid.tileSize - 0.1, grid.tileSize - 0.1),
      this.tileHighlightMat,
    )
    this.tileHighlight.rotation.x = -Math.PI / 2
    this.tileHighlight.position.y = 0.03
    this.tileHighlight.visible = false
    this.object.add(this.tileHighlight)
  }

  /** Repaint the cells inside one tile (call after unlocking it). */
  refreshTile(tx: number, tz: number): void {
    const x0 = tx * this.grid.tileSize
    const z0 = tz * this.grid.tileSize
    for (let x = x0; x < x0 + this.grid.tileSize; x++) {
      for (let z = z0; z < z0 + this.grid.tileSize; z++) {
        this.refreshCell(x, z)
      }
    }
  }

  refreshAll(): void {
    for (let x = 0; x < this.grid.size; x++) {
      for (let z = 0; z < this.grid.size; z++) {
        this.refreshCell(x, z)
      }
    }
  }

  setHighlight(coords: GridCoords | null, kind: HighlightKind): void {
    this.tileHighlight.visible = false
    if (!coords || kind === 'none') {
      this.cellHighlight.visible = false
      return
    }
    const half = this.grid.size / 2
    this.cellHighlight.position.set(coords.x - half + 0.5, 0.04, coords.z - half + 0.5)
    this.cellHighlightMat.color.setHex(HIGHLIGHT_COLORS[kind])
    this.cellHighlightMat.opacity = kind === 'invalid' ? 0.4 : 0.3
    this.cellHighlight.visible = true
  }

  setTileHighlight(tile: TileCoords, kind: 'buyable'): void {
    this.cellHighlight.visible = false
    const { cx, cz } = this.grid.tileCenter(tile.tx, tile.tz)
    this.tileHighlight.position.set(cx, 0.03, cz)
    this.tileHighlightMat.color.setHex(HIGHLIGHT_COLORS[kind])
    this.tileHighlight.visible = true
  }

  private refreshCell(x: number, z: number): void {
    const tile = this.tiles[x]?.[z]
    if (!tile) return
    const cell = this.grid.getCell(x, z)
    if (!cell) return
    const mat = tile.material as THREE.MeshLambertMaterial
    mat.color.setHex(cell.unlocked ? this.UNLOCKED_COLOR : this.LOCKED_COLOR)
  }

  private buildCellTiles(): void {
    const half = this.grid.size / 2
    const geo = new THREE.PlaneGeometry(1, 1)

    for (let x = 0; x < this.grid.size; x++) {
      for (let z = 0; z < this.grid.size; z++) {
        const cell = this.grid.getCell(x, z)!
        const mat = new THREE.MeshLambertMaterial({
          color: cell.unlocked ? this.UNLOCKED_COLOR : this.LOCKED_COLOR,
        })
        const tile = new THREE.Mesh(geo, mat)
        tile.rotation.x = -Math.PI / 2
        tile.position.set(x - half + 0.5, 0, z - half + 0.5)
        tile.receiveShadow = true
        this.object.add(tile)
        this.tiles[x]![z] = tile
      }
    }
  }

  private buildGridLines(): THREE.Group {
    const group = new THREE.Group()
    const cellMat = new THREE.LineBasicMaterial({ color: 0x5a9e5a, opacity: 0.18, transparent: true })
    const tileMat = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.35, transparent: true })
    const half = this.grid.size / 2

    for (let i = 0; i <= this.grid.size; i++) {
      const onTileBorder = i % this.grid.tileSize === 0
      const mat = onTileBorder ? tileMat : cellMat
      const t = i - half
      group.add(this.makeLine(mat, -half, t, half, t))
      group.add(this.makeLine(mat, t, -half, t, half))
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
}
