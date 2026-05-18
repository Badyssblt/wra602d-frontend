import type { Grid } from './Grid'
import { BUILDING_CONFIG } from './BuildingConfig'
import type { EventSystem, IncidentKind } from './EventSystem'

/** Random window (seconds) between two waves. */
export const WAVE_MIN_INTERVAL_S = 75
export const WAVE_MAX_INTERVAL_S = 110
/** Pre-announce delay: the UI shows a countdown for this many seconds. */
export const WAVE_WARNING_S = 5
/** Severity is clamped between [MIN, MAX]. */
const SEVERITY_MIN = 2
const SEVERITY_MAX = 6

export type DisasterFlavor = 'storm' | 'recession' | 'outage'

export interface PendingWave {
  /** Seconds remaining before the wave strikes. Counts down from WAVE_WARNING_S. */
  etaS: number
  /** Number of productive buildings about to be hit. */
  severity: number
  flavor: DisasterFlavor
}

/**
 * Periodically inflicts a wave of pre-escalated incidents on the city.
 *
 * Lifecycle of a wave:
 *   1. After a random idle interval (75–110 s), schedule a wave: set
 *      {@link PendingWave} with eta = WAVE_WARNING_S, and surface it to the UI.
 *   2. Each tick, decrement eta. When eta ≤ 0, call EventSystem.forceIncident
 *      on `severity` random productive buildings (with `escalated = true`),
 *      then start the next interval.
 *
 * Severity scales with city size: ~ 1 + floor(productiveBuildings / 8).
 */
export class DisasterSystem {
  private idleTimer = 0
  private nextWaveIn = randomInterval()
  private pending: PendingWave | null = null

  constructor(
    private readonly grid: Grid,
    private readonly events: EventSystem,
  ) {}

  tick(delta: number): void {
    if (this.pending) {
      this.pending.etaS -= delta
      if (this.pending.etaS <= 0) {
        this.unleash(this.pending)
        this.pending = null
        this.idleTimer = 0
        this.nextWaveIn = randomInterval()
      }
      return
    }

    this.idleTimer += delta
    if (this.idleTimer < this.nextWaveIn) return
    this.idleTimer = 0
    this.scheduleWave()
  }

  /** Pending wave state for the UI, or null if no wave is imminent. */
  getPendingWave(): PendingWave | null {
    return this.pending
  }

  reset(): void {
    this.idleTimer = 0
    this.nextWaveIn = randomInterval()
    this.pending = null
  }

  // ---------- Internal ----------

  private scheduleWave(): void {
    const productive = this.countProductive()
    if (productive < 3) {
      // Skip waves while the city is too small to be interesting.
      this.nextWaveIn = randomInterval()
      return
    }
    this.pending = {
      etaS: WAVE_WARNING_S,
      severity: this.computeSeverity(productive),
      flavor: pickFlavor(),
    }
  }

  private unleash(wave: PendingWave): void {
    const productiveCells = this.productiveCells()
    if (productiveCells.length === 0) return
    // Pick `severity` distinct cells (or fewer if the city is small).
    const targets = sample(productiveCells, Math.min(wave.severity, productiveCells.length))
    for (const [x, z] of targets) {
      this.events.forceIncident(x, z, flavorToIncident(wave.flavor), true)
    }
  }

  private countProductive(): number {
    return this.productiveCells().length
  }

  private productiveCells(): Array<[number, number]> {
    const cells: Array<[number, number]> = []
    for (let x = 0; x < this.grid.size; x++) {
      for (let z = 0; z < this.grid.size; z++) {
        const cell = this.grid.getCell(x, z)
        if (!cell || cell.building === null) continue
        if (BUILDING_CONFIG[cell.building].zone === null) continue
        cells.push([x, z])
      }
    }
    return cells
  }

  private computeSeverity(productive: number): number {
    const sev = 1 + Math.floor(productive / 8)
    return Math.min(SEVERITY_MAX, Math.max(SEVERITY_MIN, sev))
  }
}

function randomInterval(): number {
  return WAVE_MIN_INTERVAL_S + Math.random() * (WAVE_MAX_INTERVAL_S - WAVE_MIN_INTERVAL_S)
}

function pickFlavor(): DisasterFlavor {
  const r = Math.random()
  if (r < 0.34) return 'storm'
  if (r < 0.67) return 'recession'
  return 'outage'
}

function flavorToIncident(flavor: DisasterFlavor): IncidentKind {
  switch (flavor) {
    case 'storm':     return 'fire'
    case 'recession': return 'strike'
    case 'outage':    return 'breakdown'
  }
}

/** Reservoir-sample-free Fisher-Yates shuffle of a copy, then slice. */
function sample<T>(arr: T[], n: number): T[] {
  const copy = arr.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy.slice(0, n)
}
