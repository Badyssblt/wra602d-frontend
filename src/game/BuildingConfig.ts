import type { BuildingType, DemandZone } from '../types'

export interface BuildingConfig {
  label: string
  /** Base placement cost when zero copies are placed. */
  basePrice: number
  /**
   * Growth coefficient for the quadratic price curve:
   *   price(n) = basePrice * (1 + priceGrowth * n)^2
   * Productive zones grow faster (~0.08) to force diversification;
   * utility/decor grow slowly (~0.02–0.04) so the city stays buildable.
   */
  priceGrowth: number
  /** Gross income per tick. Only paid when served by a road. */
  incomePerTick: number
  /** Recurring upkeep per tick — paid every tick whether served or not. */
  maintenancePerTick: number
  /** Demand zone the building consumes when placed; null for utility/decor. */
  zone: DemandZone | null
  /** Population/jobs contribution. */
  population: number
  /** Minimum account level required to place this type (0 = always unlocked). */
  unlockLevel: number
}

/**
 * Économie (1 tick = 3s, donc 1200 ticks/h réel = 12 ticks par "heure de jeu"):
 *
 * Le prix devient quadratique en fonction du nombre déjà posé : le 10ᵉ bureau
 * coûte ~3× le 1ᵉʳ, ce qui force à diversifier au lieu de spammer un seul type.
 * Les bâtiments avancés (université, centrale, port) se débloquent au fur et à
 * mesure que le joueur monte en niveau via {@link ProgressionPolicy}.
 */
export const BUILDING_CONFIG: Record<BuildingType, BuildingConfig> = {
  house:      { label: 'Maison',     basePrice: 800,   priceGrowth: 0.08, incomePerTick: 6,  maintenancePerTick: 2,  zone: 'residential', population: 4,  unlockLevel: 0 },
  office:     { label: 'Bureau',     basePrice: 4000,  priceGrowth: 0.08, incomePerTick: 20, maintenancePerTick: 7,  zone: 'commercial',  population: 10, unlockLevel: 0 },
  industry:   { label: 'Industrie',  basePrice: 2500,  priceGrowth: 0.08, incomePerTick: 12, maintenancePerTick: 4,  zone: 'industrial',  population: 8,  unlockLevel: 0 },
  park:       { label: 'Parc',       basePrice: 200,   priceGrowth: 0.03, incomePerTick: 0,  maintenancePerTick: 2,  zone: null,          population: 0,  unlockLevel: 0 },
  road:       { label: 'Route',      basePrice: 80,    priceGrowth: 0.02, incomePerTick: 0,  maintenancePerTick: 1,  zone: null,          population: 0,  unlockLevel: 0 },
  university: { label: 'Université', basePrice: 8000,  priceGrowth: 0.10, incomePerTick: 25, maintenancePerTick: 8,  zone: 'residential', population: 25, unlockLevel: 3 },
  powerplant: { label: 'Centrale',   basePrice: 12000, priceGrowth: 0.12, incomePerTick: 50, maintenancePerTick: 18, zone: 'industrial',  population: 15, unlockLevel: 5 },
  port:       { label: 'Port',       basePrice: 15000, priceGrowth: 0.12, incomePerTick: 70, maintenancePerTick: 22, zone: 'commercial',  population: 20, unlockLevel: 7 },
}

/** Quadratic price curve: see {@link BuildingConfig.priceGrowth}. */
export function priceOf(type: BuildingType, alreadyPlaced: number): number {
  const cfg = BUILDING_CONFIG[type]
  const factor = 1 + cfg.priceGrowth * Math.max(0, alreadyPlaced)
  return Math.round(cfg.basePrice * factor * factor)
}

/** All building types ordered for UI display (matches palette layout). */
export const BUILDING_ORDER: readonly BuildingType[] = [
  'house', 'office', 'industry', 'park', 'road', 'university', 'powerplant', 'port',
]
