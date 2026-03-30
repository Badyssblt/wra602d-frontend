import type { BuildingType } from '../types'

export interface BuildingConfig {
  label: string
  price: number
  incomePerTick?: number
  roadNeeded?: number
}

export const BUILDING_CONFIG: Record<BuildingType, BuildingConfig> = {
    house: { label: 'Maison', price: 120, incomePerTick: 10 },
    office: { label: 'Bureau', price: 300, incomePerTick: 20 },
    park: { label: 'Parc', price: 50 },
    road: { label: 'Route', price: 20 }
}