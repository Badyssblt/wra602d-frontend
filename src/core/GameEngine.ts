import * as THREE from 'three'
import type { Ref } from 'vue'
import type { BuildingType, GridCoords } from '../types'
import { Grid, type GridState } from '../game/Grid'
import { BuildingPlacer } from '../game/BuildingPlacer'
import { GridMesh, type HighlightKind } from '../objects/GridMesh'
import { createBuildingMesh } from '../objects/BuildingMesh'
import { createWarningSprite } from '../objects/WarningSprite'
import { IncomeSystem } from '../game/IncomeSystem'
import { DemandSystem } from '../game/DemandSystem'
import { BUILDING_CONFIG } from '../game/BuildingConfig'
import { cellKey, computeRoadAccess } from '../game/RoadAccess'
import { MoneyManager } from './MoneyManager'
import { SceneManager } from './SceneManager'
import { InputManager } from './InputManager'

export interface CellAction {
  kind: 'place' | 'buy' | 'invalid' | 'none'
  coords: GridCoords | null
}

export interface GameEngineOptions {
  canvas: HTMLCanvasElement
  tilesPerSide: number
  tileSize: number
  money: Ref<number>
  /** Returns the building type currently selected by the UI. */
  getSelectedType: () => BuildingType
  onClick: (action: CellAction) => void
  onTick?: (delta: number) => void
}

const WARNING_SPRITE_HEIGHT = 1.6

/**
 * Encapsulates Three.js scene, grid, input and game systems.
 * App-layer code interacts with this single object instead of juggling
 * a dozen `let` references and lifecycle hooks.
 */
export class GameEngine {
  readonly grid: Grid
  readonly moneyManager: MoneyManager
  readonly demand: DemandSystem
  readonly income: IncomeSystem

  private readonly scene: SceneManager
  private readonly input: InputManager
  private readonly placer: BuildingPlacer
  private readonly gridMesh: GridMesh
  private readonly placedMeshes = new Map<string, THREE.Object3D>()
  private readonly warningSprites = new Map<string, THREE.Sprite>()
  private readonly resizeHandler: () => void

  constructor(private readonly opts: GameEngineOptions) {
    const gridSize = opts.tilesPerSide * opts.tileSize
    this.scene = new SceneManager(opts.canvas, gridSize)
    this.grid = new Grid(opts.tilesPerSide, opts.tileSize)
    this.placer = new BuildingPlacer()
    this.gridMesh = new GridMesh(this.grid)
    this.input = new InputManager(opts.canvas, (mouse) => this.handleClick(mouse))
    this.moneyManager = new MoneyManager(opts.money)
    this.income = new IncomeSystem(this.grid, this.moneyManager)
    this.demand = new DemandSystem()

    this.scene.scene.add(this.gridMesh.object)

    this.resizeHandler = () => this.scene.resize(window.innerWidth, window.innerHeight)
    window.addEventListener('resize', this.resizeHandler)
  }

  start(): void {
    this.scene.start((delta) => {
      this.updateHoverHighlight()
      this.income.tick(delta)
      this.demand.tick(delta)
      this.opts.onTick?.(delta)
    })
  }

  tryPlaceBuilding(coords: GridCoords): boolean {
    const type = this.opts.getSelectedType()
    const config = BUILDING_CONFIG[type]
    if (!this.moneyManager.canBuy(config.price)) return false
    if (!this.grid.place(coords, type)) return false
    this.moneyManager.removeMoney(config.price)
    this.spawnMesh(coords.x, coords.z, type)
    this.demand.onPlaced(config.zone)
    this.refreshRoadAccessVisuals()
    return true
  }

  tryUnlockTile(coords: GridCoords, price: number): boolean {
    const { tx, tz } = this.grid.tileOf(coords.x, coords.z)
    if (!this.grid.isTileBuyable(tx, tz)) return false
    if (!this.moneyManager.canBuy(price)) return false
    if (!this.grid.unlockTile(tx, tz)) return false
    this.moneyManager.removeMoney(price)
    this.gridMesh.refreshTile(tx, tz)
    return true
  }

  clearCity(): void {
    this.removeAllMeshesAndSprites()
    this.grid.reset()
    this.demand.reset()
    this.gridMesh.refreshAll()
  }

  loadState(state: GridState): void {
    this.removeAllMeshesAndSprites()
    this.grid.loadFrom(state)
    for (const b of state.buildings) {
      this.spawnMesh(b.posX, b.posZ, b.type)
    }
    this.demand.reset()
    this.gridMesh.refreshAll()
    this.refreshRoadAccessVisuals()
  }

  serialize(): GridState {
    return this.grid.serialize()
  }

  dispose(): void {
    window.removeEventListener('resize', this.resizeHandler)
    this.input.dispose()
    this.scene.dispose()
  }

  // ---------- Internal ----------

  private handleClick(mouse: THREE.Vector2): void {
    const coords = this.placer.getHoveredCell(mouse, this.scene.camera, this.grid.size)
    this.opts.onClick({ kind: this.actionForCoords(coords), coords })
  }

  private updateHoverHighlight(): void {
    const coords = this.placer.getHoveredCell(this.input.mouse, this.scene.camera, this.grid.size)
    if (!coords) {
      this.gridMesh.setHighlight(null, 'none')
      return
    }
    if (this.grid.isUnlocked(coords.x, coords.z)) {
      this.gridMesh.setHighlight(coords, 'placement')
      return
    }
    const tile = this.grid.tileOf(coords.x, coords.z)
    if (this.grid.isTileBuyable(tile.tx, tile.tz)) {
      this.gridMesh.setTileHighlight(tile, 'buyable')
      return
    }
    this.gridMesh.setHighlight(coords, 'invalid')
  }

  private actionForCoords(coords: GridCoords | null): CellAction['kind'] {
    if (!coords) return 'none'
    if (this.grid.isUnlocked(coords.x, coords.z)) return 'place'
    const { tx, tz } = this.grid.tileOf(coords.x, coords.z)
    if (this.grid.isTileBuyable(tx, tz)) return 'buy'
    return 'invalid'
  }

  private spawnMesh(x: number, z: number, type: BuildingType): void {
    const half = this.grid.size / 2
    const mesh = createBuildingMesh(type)
    mesh.position.set(x - half + 0.5, 0, z - half + 0.5)
    this.scene.scene.add(mesh)
    this.placedMeshes.set(cellKey(x, z), mesh)
  }

  private refreshRoadAccessVisuals(): void {
    const { unserved } = computeRoadAccess(this.grid)
    // Remove sprites that are no longer needed (cell now served or building gone).
    for (const [key, sprite] of this.warningSprites) {
      if (!unserved.has(key)) {
        this.scene.scene.remove(sprite)
        sprite.material.dispose()
        this.warningSprites.delete(key)
      }
    }
    // Add sprites for newly-unserved buildings.
    const half = this.grid.size / 2
    for (const key of unserved) {
      if (this.warningSprites.has(key)) continue
      const [xs, zs] = key.split(',')
      const x = Number(xs)
      const z = Number(zs)
      const sprite = createWarningSprite()
      sprite.position.set(x - half + 0.5, WARNING_SPRITE_HEIGHT, z - half + 0.5)
      this.scene.scene.add(sprite)
      this.warningSprites.set(key, sprite)
    }
  }

  private removeAllMeshesAndSprites(): void {
    for (const mesh of this.placedMeshes.values()) this.scene.scene.remove(mesh)
    this.placedMeshes.clear()
    for (const sprite of this.warningSprites.values()) {
      this.scene.scene.remove(sprite)
      sprite.material.dispose()
    }
    this.warningSprites.clear()
  }
}

export type { HighlightKind }
