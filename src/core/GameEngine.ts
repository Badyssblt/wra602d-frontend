import * as THREE from 'three'
import type { Ref } from 'vue'
import type { BuildingType, GridCoords } from '../types'
import { Grid, type GridState } from '../game/Grid'
import { BuildingPlacer } from '../game/BuildingPlacer'
import { GridMesh, type HighlightKind } from '../objects/GridMesh'
import { createBuildingMesh } from '../objects/BuildingMesh'
import { createWarningSprite } from '../objects/WarningSprite'
import { createIncidentSprite } from '../objects/IncidentSprite'
import { IncomeSystem } from '../game/IncomeSystem'
import { DemandSystem } from '../game/DemandSystem'
import { EventSystem, type IncidentKind } from '../game/EventSystem'
import { DisasterSystem, type PendingWave } from '../game/DisasterSystem'
import { BUILDING_CONFIG, priceOf } from '../game/BuildingConfig'
import { cellKey, computeRoadAccess } from '../game/RoadAccess'
import { MoneyManager } from './MoneyManager'
import { SceneManager } from './SceneManager'
import { InputManager } from './InputManager'

export interface CellAction {
  kind: 'place' | 'buy' | 'repair' | 'invalid' | 'none'
  coords: GridCoords | null
  /** Set when kind === 'repair': euros required to fix the cell. */
  repairCost?: number
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
const INCIDENT_SPRITE_HEIGHT = 2.0

interface IncidentSpriteEntry {
  sprite: THREE.Sprite
  kind: IncidentKind
  escalated: boolean
}

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
  readonly events: EventSystem
  readonly disasters: DisasterSystem

  private readonly scene: SceneManager
  private readonly input: InputManager
  private readonly placer: BuildingPlacer
  private readonly gridMesh: GridMesh
  private readonly placedMeshes = new Map<string, THREE.Object3D>()
  private readonly warningSprites = new Map<string, THREE.Sprite>()
  private readonly incidentSprites = new Map<string, IncidentSpriteEntry>()
  private readonly resizeHandler: () => void
  private paused = false

  constructor(private readonly opts: GameEngineOptions) {
    const gridSize = opts.tilesPerSide * opts.tileSize
    this.scene = new SceneManager(opts.canvas, gridSize)
    this.grid = new Grid(opts.tilesPerSide, opts.tileSize)
    this.placer = new BuildingPlacer()
    this.gridMesh = new GridMesh(this.grid)
    this.input = new InputManager(opts.canvas, (mouse) => this.handleClick(mouse))
    this.moneyManager = new MoneyManager(opts.money)
    this.events = new EventSystem(this.grid)
    this.disasters = new DisasterSystem(this.grid, this.events)
    this.income = new IncomeSystem(this.grid, this.moneyManager, this.events)
    this.demand = new DemandSystem()

    this.scene.scene.add(this.gridMesh.object)

    this.resizeHandler = () => this.scene.resize(window.innerWidth, window.innerHeight)
    window.addEventListener('resize', this.resizeHandler)
  }

  start(): void {
    this.scene.start((delta) => {
      this.updateHoverHighlight()
      if (this.paused) return
      this.income.tick(delta)
      this.demand.tick(delta)
      this.events.tick(delta)
      this.disasters.tick(delta)
      this.refreshIncidentVisuals()
      this.opts.onTick?.(delta)
    })
  }

  pause(): void { this.paused = true }
  resume(): void { this.paused = false }
  isPaused(): boolean { return this.paused }

  /** Pending disaster wave (if any) so the UI can render a countdown banner. */
  getPendingWave(): PendingWave | null {
    return this.disasters.getPendingWave()
  }

  tryPlaceBuilding(coords: GridCoords): boolean {
    const type = this.opts.getSelectedType()
    const config = BUILDING_CONFIG[type]
    const price = priceOf(type, this.countOf(type))
    if (!this.moneyManager.canBuy(price)) return false
    if (!this.grid.place(coords, type)) return false
    this.moneyManager.removeMoney(price)
    this.spawnMesh(coords.x, coords.z, type)
    this.demand.onPlaced(config.zone)
    this.refreshRoadAccessVisuals()
    return true
  }

  /**
   * Repairs the incident at (coords) for its euro cost.
   * Returns the amount paid, or null if there was no incident /
   * the player can't afford it.
   */
  tryRepair(coords: GridCoords): number | null {
    const cost = this.events.repairCost(coords.x, coords.z)
    if (cost === null) return null
    if (!this.moneyManager.canBuy(cost)) return null
    if (!this.events.clearAt(coords.x, coords.z)) return null
    this.moneyManager.removeMoney(cost)
    this.refreshIncidentVisuals()
    return cost
  }

  /** Snapshot of the next placement price for every building type. */
  currentPrices(): Record<BuildingType, number> {
    const counts = this.countAll()
    return {
      house: priceOf('house', counts.house),
      office: priceOf('office', counts.office),
      industry: priceOf('industry', counts.industry),
      park: priceOf('park', counts.park),
      road: priceOf('road', counts.road),
      university: priceOf('university', counts.university),
      powerplant: priceOf('powerplant', counts.powerplant),
      port: priceOf('port', counts.port),
    }
  }

  private countOf(type: BuildingType): number {
    let n = 0
    for (const t of this.grid.getAllBuildings()) if (t === type) n++
    return n
  }

  private countAll(): Record<BuildingType, number> {
    const counts: Record<BuildingType, number> = {
      house: 0, office: 0, industry: 0, park: 0, road: 0,
      university: 0, powerplant: 0, port: 0,
    }
    for (const t of this.grid.getAllBuildings()) counts[t]++
    return counts
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
    this.events.reset()
    this.disasters.reset()
    this.gridMesh.refreshAll()
  }

  loadState(state: GridState): void {
    this.removeAllMeshesAndSprites()
    this.grid.loadFrom(state)
    for (const b of state.buildings) {
      this.spawnMesh(b.posX, b.posZ, b.type)
    }
    this.demand.reset()
    this.events.reset()
    this.disasters.reset()
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
    const action = this.actionForCoords(coords)
    const event: CellAction = { kind: action, coords }
    if (action === 'repair' && coords) {
      event.repairCost = this.events.repairCost(coords.x, coords.z) ?? undefined
    }
    this.opts.onClick(event)
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
    // Active incident takes priority — a click on an incident cell repairs it.
    if (this.events.getIncident(coords.x, coords.z) !== null) return 'repair'
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

  private refreshIncidentVisuals(): void {
    const half = this.grid.size / 2
    const active = this.events.getActiveCells()

    // Remove sprites for cells that no longer have an incident.
    for (const [key, entry] of this.incidentSprites) {
      if (!active.has(key)) {
        this.scene.scene.remove(entry.sprite)
        entry.sprite.material.dispose()
        this.incidentSprites.delete(key)
      }
    }

    // Add or refresh sprites for current incidents.
    for (const key of active) {
      const [xs, zs] = key.split(',')
      const x = Number(xs)
      const z = Number(zs)
      const incident = this.events.getIncident(x, z)
      if (!incident) continue
      const existing = this.incidentSprites.get(key)
      if (existing && existing.kind === incident.kind && existing.escalated === incident.escalated) continue
      if (existing) {
        this.scene.scene.remove(existing.sprite)
        existing.sprite.material.dispose()
      }
      const sprite = createIncidentSprite(incident.kind, incident.escalated)
      sprite.position.set(x - half + 0.5, INCIDENT_SPRITE_HEIGHT, z - half + 0.5)
      this.scene.scene.add(sprite)
      this.incidentSprites.set(key, { sprite, kind: incident.kind, escalated: incident.escalated })
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
    for (const entry of this.incidentSprites.values()) {
      this.scene.scene.remove(entry.sprite)
      entry.sprite.material.dispose()
    }
    this.incidentSprites.clear()
  }
}

export type { HighlightKind }
