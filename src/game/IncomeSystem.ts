import type { Grid } from './Grid'
import type { MoneyManager } from '../core/MoneyManager'
import { BUILDING_CONFIG } from './BuildingConfig'
import { cellKey, computeRoadAccess } from './RoadAccess'

export const INCOME_INTERVAL_SECONDS = 5
/**
 * Échelle temporelle : 1 heure de jeu = 1 minute réelle = 12 ticks.
 * Les valeurs affichées avec "/h" sont donc des heures *de jeu*, pas réelles.
 */
const TICKS_PER_INGAME_HOUR = 12

export interface IncomeRates {
  /** Gross income per tick (only served productive buildings). */
  grossPerTick: number
  /** Maintenance cost per tick (every building, served or not). */
  maintenancePerTick: number
  netPerTick: number
  netPerHour: number
  grossPerHour: number
  maintenancePerHour: number
}

/**
 * Pays net = (income for served buildings) − (maintenance for all buildings)
 * every {INCOME_INTERVAL_SECONDS}s. Net can be negative — the city goes
 * into the red when expenses exceed income.
 */
export class IncomeSystem {
  private timer = 0

  constructor(
    private readonly grid: Grid,
    private readonly moneyManager: MoneyManager,
  ) {}

  tick(delta: number): void {
    this.timer += delta
    if (this.timer < INCOME_INTERVAL_SECONDS) return

    this.timer = 0
    const rates = this.computeRates()
    if (rates.netPerTick > 0) this.moneyManager.addMoney(rates.netPerTick)
    else if (rates.netPerTick < 0) this.moneyManager.removeMoney(-rates.netPerTick)
  }

  /** Snapshot of the current per-tick / per-hour income & expenses. */
  computeRates(): IncomeRates {
    const { served } = computeRoadAccess(this.grid)
    let gross = 0
    let maintenance = 0
    for (let x = 0; x < this.grid.size; x++) {
      for (let z = 0; z < this.grid.size; z++) {
        const cell = this.grid.getCell(x, z)
        if (!cell || cell.building === null) continue
        const cfg = BUILDING_CONFIG[cell.building]
        maintenance += cfg.maintenancePerTick
        if (cfg.zone !== null && served.has(cellKey(x, z))) {
          gross += cfg.incomePerTick
        }
      }
    }
    const net = gross - maintenance
    return {
      grossPerTick: gross,
      maintenancePerTick: maintenance,
      netPerTick: net,
      grossPerHour: gross * TICKS_PER_INGAME_HOUR,
      maintenancePerHour: maintenance * TICKS_PER_INGAME_HOUR,
      netPerHour: net * TICKS_PER_INGAME_HOUR,
    }
  }
}
