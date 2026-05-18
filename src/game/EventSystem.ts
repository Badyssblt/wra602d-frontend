import type { Grid } from './Grid'
import { BUILDING_CONFIG } from './BuildingConfig'
import { cellKey } from './RoadAccess'

export type IncidentKind = 'fire' | 'breakdown' | 'strike'

export interface ActiveIncident {
  kind: IncidentKind
  /** Seconds elapsed since the incident started. */
  age: number
  /** True once {@link ESCALATION_DELAY_S} has been crossed without repair. */
  escalated: boolean
}

/** Time-window settings for spontaneous incidents. */
export const INCIDENT_MIN_INTERVAL_S = 35
export const INCIDENT_MAX_INTERVAL_S = 60
/** Delay before an un-fixed incident starts charging x3 maintenance. */
export const ESCALATION_DELAY_S = 25
/** Repair cost = round(basePrice * REPAIR_COST_RATIO). */
export const REPAIR_COST_RATIO = 0.3
/** Maintenance multiplier applied to escalated incidents. */
export const ESCALATED_MAINTENANCE_MULT = 3

/**
 * Tracks transient incidents (fire / breakdown / strike) that periodically hit
 * productive buildings. While an incident is active:
 *   - the building generates no gross income (IncomeSystem skips it)
 *   - after {@link ESCALATION_DELAY_S} seconds without repair, its maintenance
 *     is multiplied by {@link ESCALATED_MAINTENANCE_MULT}.
 *
 * Player resolves an incident by clicking the affected cell — the cost is
 * {@link REPAIR_COST_RATIO} × basePrice of the building type.
 *
 * Incidents are runtime-only and are NOT serialized.
 */
export class EventSystem {
  private readonly active = new Map<string, ActiveIncident>()
  private timer = 0
  private nextSpawnIn = randomInterval()

  constructor(private readonly grid: Grid) {}

  tick(delta: number): void {
    // Age existing incidents and escalate when their timer is up.
    for (const incident of this.active.values()) {
      incident.age += delta
      if (!incident.escalated && incident.age >= ESCALATION_DELAY_S) {
        incident.escalated = true
      }
    }

    // Spawn a new incident periodically.
    this.timer += delta
    if (this.timer < this.nextSpawnIn) return
    this.timer = 0
    this.nextSpawnIn = randomInterval()
    this.spawnIncident()
  }

  /** Snapshot of the cells that are currently affected (income disabled). */
  getActiveCells(): Set<string> {
    return new Set(this.active.keys())
  }

  /** Cells that have passed the escalation threshold (maintenance penalty). */
  getEscalatedCells(): Set<string> {
    const out = new Set<string>()
    for (const [key, incident] of this.active) {
      if (incident.escalated) out.add(key)
    }
    return out
  }

  getIncident(x: number, z: number): ActiveIncident | null {
    return this.active.get(cellKey(x, z)) ?? null
  }

  /**
   * Returns the euro cost to repair the cell, or `null` if no incident.
   * Computed from the building's basePrice, not the current quadratic price.
   */
  repairCost(x: number, z: number): number | null {
    if (!this.active.has(cellKey(x, z))) return null
    const cell = this.grid.getCell(x, z)
    if (!cell || cell.building === null) return null
    return Math.max(50, Math.round(BUILDING_CONFIG[cell.building].basePrice * REPAIR_COST_RATIO))
  }

  /** Clears an incident at (x, z). Returns true if one was present. */
  clearAt(x: number, z: number): boolean {
    return this.active.delete(cellKey(x, z))
  }

  /**
   * Force-creates an incident at (x, z). Used by the DisasterSystem to inflict
   * pre-escalated incidents during a wave. Silently no-ops if the cell already
   * has an active incident or no productive building.
   */
  forceIncident(x: number, z: number, kind: IncidentKind, escalated: boolean): boolean {
    const cell = this.grid.getCell(x, z)
    if (!cell || cell.building === null) return false
    if (BUILDING_CONFIG[cell.building].zone === null) return false
    const key = cellKey(x, z)
    if (this.active.has(key)) return false
    this.active.set(key, { kind, age: escalated ? ESCALATION_DELAY_S : 0, escalated })
    return true
  }

  reset(): void {
    this.active.clear()
    this.timer = 0
    this.nextSpawnIn = randomInterval()
  }

  // ---------- Internal ----------

  private spawnIncident(): void {
    const candidates: Array<[number, number]> = []
    for (let x = 0; x < this.grid.size; x++) {
      for (let z = 0; z < this.grid.size; z++) {
        const cell = this.grid.getCell(x, z)
        if (!cell || cell.building === null) continue
        // Only productive buildings can break down (residential/commercial/industrial).
        if (BUILDING_CONFIG[cell.building].zone === null) continue
        if (this.active.has(cellKey(x, z))) continue
        candidates.push([x, z])
      }
    }
    if (candidates.length === 0) return
    const [x, z] = candidates[Math.floor(Math.random() * candidates.length)]!
    this.active.set(cellKey(x, z), {
      kind: pickIncidentKind(),
      age: 0,
      escalated: false,
    })
  }
}

function randomInterval(): number {
  const span = INCIDENT_MAX_INTERVAL_S - INCIDENT_MIN_INTERVAL_S
  return INCIDENT_MIN_INTERVAL_S + Math.random() * span
}

function pickIncidentKind(): IncidentKind {
  const r = Math.random()
  if (r < 0.34) return 'fire'
  if (r < 0.67) return 'breakdown'
  return 'strike'
}
