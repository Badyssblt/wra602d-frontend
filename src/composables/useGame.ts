import { onBeforeUnmount, ref, type Ref } from 'vue'
import type { BuildingType } from '../types'
import { computePopulation, computeScore } from '../game/CityState'
import type { DemandState } from '../game/DemandSystem'
import type { GridState } from '../game/Grid'
import type { IncomeRates } from '../game/IncomeSystem'
import { GameEngine, type CellAction } from '../core/GameEngine'
import { useToast } from './useToast'

/** A "tile" = a 12×12 chunk of cells (à la Cities Skylines). */
export const TILE_SIZE = 12
export const TILES_PER_SIDE = 4
export const GRID_SIZE = TILES_PER_SIDE * TILE_SIZE
export const STARTING_MONEY = 50_000
export const TILE_PRICE = 15_000

const DERIVED_REFRESH_INTERVAL_S = 1

export interface CitySnapshot {
  uid: string
  name: string
  money: number
  gridSize: number
  buildings: GridState['buildings']
  unlockedTiles: GridState['unlockedTiles']
}

/** Generates a 26-character ULID-compatible identifier (Crockford base32). */
export function generateCityId(): string {
  const chars = 'ABCDEFGHJKMNPQRSTVWXYZ0123456789'
  let id = ''
  for (let i = 0; i < 26; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

/**
 * Owns the whole game lifecycle: scene, reactive state, building placement,
 * derived stats, tile unlocking. Components only see refs and a few methods.
 */
export function useGame(selectedType: Ref<BuildingType>) {
  const { notify } = useToast()

  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const money = ref(STARTING_MONEY)
  const ticksPlayed = ref(0)
  const population = ref(0)
  const score = ref(0)
  const unlockedTiles = ref(1)
  const demand = ref<DemandState>({ residential: 50, commercial: 30, industrial: 25 })
  const rates = ref<IncomeRates>({
    grossPerTick: 0, maintenancePerTick: 0, netPerTick: 0,
    grossPerHour: 0, maintenancePerHour: 0, netPerHour: 0,
  })
  const cityUid = ref(generateCityId())
  const cityName = ref('MyTown')

  let engine: GameEngine | null = null
  let derivedTimer = 0

  function start(): void {
    if (!canvasRef.value) throw new Error('Canvas ref must be set before starting the game.')
    engine = new GameEngine({
      canvas: canvasRef.value,
      tilesPerSide: TILES_PER_SIDE,
      tileSize: TILE_SIZE,
      money,
      getSelectedType: () => selectedType.value,
      onClick: handleClick,
      onTick: onEngineTick,
    })
    engine.start()
  }

  function handleClick(action: CellAction): void {
    if (!engine || !action.coords) return

    if (action.kind === 'place') {
      const placed = engine.tryPlaceBuilding(action.coords)
      if (!placed) notify('Pas assez d’argent ou case occupée', 'error')
      else refreshDerived()
      return
    }

    if (action.kind === 'buy') {
      if (!confirm(`Acheter ce bloc 12×12 (${TILE_PRICE.toLocaleString('fr-FR')} €) ?`)) return
      const bought = engine.tryUnlockTile(action.coords, TILE_PRICE)
      if (!bought) notify('Achat impossible', 'error')
      else {
        notify(`Bloc débloqué — ${TILE_PRICE.toLocaleString('fr-FR')} €`, 'success')
        refreshDerived()
      }
      return
    }

    if (action.kind === 'invalid') {
      notify('Bloc inaccessible (à débloquer depuis un bloc voisin)', 'error')
    }
  }

  function onEngineTick(delta: number): void {
    ticksPlayed.value += delta
    derivedTimer += delta
    if (derivedTimer >= DERIVED_REFRESH_INTERVAL_S) {
      derivedTimer = 0
      refreshDerived()
    }
    if (engine) demand.value = engine.demand.getState()
  }

  function refreshDerived(): void {
    if (!engine) return
    population.value = computePopulation(engine.grid)
    score.value = computeScore(money.value, engine.grid, ticksPlayed.value)
    unlockedTiles.value = engine.grid.unlockedTilesCount()
    demand.value = engine.demand.getState()
    rates.value = engine.income.computeRates()
  }

  function newGame(): void {
    if (!engine) return
    engine.clearCity()
    money.value = STARTING_MONEY
    ticksPlayed.value = 0
    cityUid.value = generateCityId()
    cityName.value = `Town-${Date.now().toString(36)}`
    refreshDerived()
  }

  function loadCity(snapshot: CitySnapshot): void {
    if (!engine) return
    engine.loadState({
      buildings: snapshot.buildings,
      unlockedTiles: snapshot.unlockedTiles,
    })
    money.value = snapshot.money
    cityUid.value = snapshot.uid
    cityName.value = snapshot.name
    refreshDerived()
  }

  function snapshot(): CitySnapshot {
    if (!engine) throw new Error('Game not started')
    const state = engine.serialize()
    return {
      uid: cityUid.value,
      name: cityName.value,
      money: money.value,
      gridSize: GRID_SIZE,
      buildings: state.buildings,
      unlockedTiles: state.unlockedTiles,
    }
  }

  onBeforeUnmount(() => engine?.dispose())

  return {
    canvasRef,
    money,
    ticksPlayed,
    population,
    score,
    unlockedTiles,
    demand,
    rates,
    cityUid,
    cityName,
    start,
    newGame,
    loadCity,
    snapshot,
  }
}
