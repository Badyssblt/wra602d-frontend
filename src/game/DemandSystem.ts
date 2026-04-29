import type { DemandZone } from '../types'

export interface DemandState {
  residential: number
  commercial: number
  industrial: number
}

export const DEMAND_LABELS: Record<DemandZone, string> = {
  residential: 'Résidentiel',
  commercial: 'Commercial',
  industrial: 'Industriel',
}

export const DEMAND_COLORS: Record<DemandZone, string> = {
  residential: '#22c55e',
  commercial: '#3b82f6',
  industrial: '#fbbf24',
}

/** Croissance naturelle: il faut ~3 minutes pour qu'une zone passe de 0 à 100. */
const NATURAL_GROWTH_PER_SECOND = 0.55
const COMMERCIAL_GROWTH_FACTOR = 0.8
const INDUSTRIAL_GROWTH_FACTOR = 0.7

/** Effet d'une pose : la zone consommée perd 8, les deux autres gagnent 2. */
const PLACEMENT_CONSUMPTION = 8
const PLACEMENT_OPPOSITE_BOOST = 2

const MIN = 0
const MAX = 100

const INITIAL_STATE: DemandState = { residential: 50, commercial: 30, industrial: 25 }

/**
 * Tracks residential / commercial / industrial demand on a 0-100 scale.
 *
 * - Demand grows naturally over time (population pressure simulation).
 * - Placing a zoned building consumes demand for its zone and slightly
 *   increases demand for the two others.
 *
 * Pure logic, no Vue / Three.js dependency — easy to unit-test.
 */
export class DemandSystem {
  private state: DemandState = { ...INITIAL_STATE }

  getState(): DemandState {
    return { ...this.state }
  }

  tick(delta: number): void {
    const base = delta * NATURAL_GROWTH_PER_SECOND
    this.state.residential = clamp(this.state.residential + base)
    this.state.commercial = clamp(this.state.commercial + base * COMMERCIAL_GROWTH_FACTOR)
    this.state.industrial = clamp(this.state.industrial + base * INDUSTRIAL_GROWTH_FACTOR)
  }

  onPlaced(zone: DemandZone | null): void {
    if (zone === null) return
    this.state[zone] = clamp(this.state[zone] - PLACEMENT_CONSUMPTION)
    for (const other of (Object.keys(this.state) as DemandZone[])) {
      if (other !== zone) {
        this.state[other] = clamp(this.state[other] + PLACEMENT_OPPOSITE_BOOST)
      }
    }
  }

  reset(): void {
    this.state = { ...INITIAL_STATE }
  }
}

function clamp(v: number): number {
  return Math.max(MIN, Math.min(MAX, v))
}
