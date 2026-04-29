import type { BuildingType, DemandZone } from '../types'

export interface BuildingConfig {
  label: string
  /** One-time placement cost. */
  price: number
  /** Gross income per tick (5s). Only paid when served by a road. */
  incomePerTick: number
  /** Recurring upkeep per tick — paid every tick whether served or not. */
  maintenancePerTick: number
  /** Demand zone the building consumes when placed; null for utility/decor. */
  zone: DemandZone | null
  /** Population/jobs contribution. */
  population: number
}

/**
 * Économie (1 tick = 5s, donc 720 ticks/h):
 *
 * Chiffres choisis pour qu'un quartier ~16 maisons rapporte ~46 000 €/h
 * (au lieu des 280 k€/h initiaux), tout en gardant un payback proche de
 * 3-4 minutes par bâtiment et une maintenance qui pèse vraiment.
 */
export const BUILDING_CONFIG: Record<BuildingType, BuildingConfig> = {
  house:    { label: 'Maison',    price: 800,  incomePerTick: 6,  maintenancePerTick: 2, zone: 'residential', population: 4 },
  office:   { label: 'Bureau',    price: 4000, incomePerTick: 20, maintenancePerTick: 7, zone: 'commercial',  population: 10 },
  industry: { label: 'Industrie', price: 2500, incomePerTick: 12, maintenancePerTick: 4, zone: 'industrial',  population: 8 },
  park:     { label: 'Parc',      price: 200,  incomePerTick: 0,  maintenancePerTick: 2, zone: null,          population: 0 },
  road:     { label: 'Route',     price: 80,   incomePerTick: 0,  maintenancePerTick: 1, zone: null,          population: 0 },
}
