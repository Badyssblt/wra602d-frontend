import { onBeforeUnmount, ref, type Ref } from 'vue'
import type { BuildingType } from '../types'
import { computePopulation, computeScore } from '../game/CityState'
import type { DemandState } from '../game/DemandSystem'
import type { GridState } from '../game/Grid'
import type { IncomeRates } from '../game/IncomeSystem'
import type { PendingWave } from '../game/DisasterSystem'
import { GameEngine, type CellAction } from '../core/GameEngine'
import { useToast } from './useToast'

/** A "tile" = a 12×12 chunk of cells (à la Cities Skylines). */
export const TILE_SIZE = 12
export const TILES_PER_SIDE = 4
export const GRID_SIZE = TILES_PER_SIDE * TILE_SIZE
export const STARTING_MONEY = 50_000
export const TILE_PRICE = 15_000

/** Defeat threshold: city is bankrupt below this many euros. */
export const DEFEAT_MONEY_FLOOR = -10_000
/** Seconds the city must stay below {@link DEFEAT_MONEY_FLOOR} before defeat. */
export const DEFEAT_SUSTAINED_S = 25

const DERIVED_REFRESH_INTERVAL_S = 1

export interface CitySnapshot {
  uid: string
  name: string
  money: number
  gridSize: number
  buildings: GridState['buildings']
  unlockedTiles: GridState['unlockedTiles']
  /** Player-side score at save time. Server upserts the leaderboard from this. */
  score: number
  population: number
  ticksPlayed: number
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
  const prices = ref<Record<BuildingType, number>>({
    house: 800, office: 4000, industry: 2500, park: 200, road: 80,
    university: 8000, powerplant: 12000, port: 15000,
  })
  const pendingWave = ref<PendingWave | null>(null)
  const defeated = ref(false)
  /** Seconds the city has been continuously below the defeat floor. */
  const debtTimer = ref(0)
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
    if (defeated.value) return

    if (action.kind === 'repair') {
      const paid = engine.tryRepair(action.coords)
      if (paid === null) notify('Pas assez d’argent pour réparer', 'error')
      else {
        notify(`Incident résolu — ${paid.toLocaleString('fr-FR')} €`, 'success')
        refreshDerived()
      }
      return
    }

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

    // Track sustained debt for the defeat condition.
    if (money.value < DEFEAT_MONEY_FLOOR) {
      debtTimer.value += delta
      if (debtTimer.value >= DEFEAT_SUSTAINED_S && !defeated.value) {
        defeated.value = true
        engine?.pause()
        notify('Banqueroute — la ville a fait faillite.', 'error')
      }
    } else if (debtTimer.value > 0) {
      debtTimer.value = 0
    }

    if (derivedTimer >= DERIVED_REFRESH_INTERVAL_S) {
      derivedTimer = 0
      refreshDerived()
    }
    if (engine) {
      demand.value = engine.demand.getState()
      pendingWave.value = engine.getPendingWave()
    }
  }

  function refreshDerived(): void {
    if (!engine) return
    population.value = computePopulation(engine.grid)
    score.value = computeScore(money.value, engine.grid, ticksPlayed.value)
    unlockedTiles.value = engine.grid.unlockedTilesCount()
    demand.value = engine.demand.getState()
    rates.value = engine.income.computeRates()
    prices.value = engine.currentPrices()
    pendingWave.value = engine.getPendingWave()
  }

  function newGame(): void {
    if (!engine) return
    engine.clearCity()
    engine.resume()
    money.value = STARTING_MONEY
    ticksPlayed.value = 0
    debtTimer.value = 0
    defeated.value = false
    pendingWave.value = null
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
    engine.resume()
    money.value = snapshot.money
    cityUid.value = snapshot.uid
    cityName.value = snapshot.name
    // Restore cumulative state so quests like "survive 2 minutes" don't reset
    // each time the player reloads their city.
    ticksPlayed.value = snapshot.ticksPlayed ?? 0
    debtTimer.value = 0
    defeated.value = false
    pendingWave.value = null
    refreshDerived()
  }

  function snapshot(): CitySnapshot {
    if (!engine) throw new Error('Game not started')
    const state = engine.serialize()
    return {
      uid: cityUid.value,
      name: cityName.value,
      money: Math.max(0, Math.round(money.value)),
      gridSize: GRID_SIZE,
      buildings: state.buildings,
      unlockedTiles: state.unlockedTiles,
      score: Math.max(0, Math.round(score.value)),
      population: population.value,
      ticksPlayed: Math.max(0, Math.round(ticksPlayed.value)),
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
    prices,
    pendingWave,
    defeated,
    debtTimer,
    cityUid,
    cityName,
    start,
    newGame,
    loadCity,
    snapshot,
  }
}
