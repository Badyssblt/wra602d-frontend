import type { BuildingType } from '../types'
import { BUILDING_CONFIG } from './BuildingConfig'
import type { Grid } from './Grid'

/** Sums the configured population/jobs of every placed building. */
export function computePopulation(grid: Grid): number {
  return grid.getAllBuildings().reduce((acc, type) => acc + BUILDING_CONFIG[type].population, 0)
}

/**
 * Score = trésor + valeur agrégée des revenus + temps joué.
 * A balanced city (R/C/I close to each other) gets a small bonus.
 */
export function computeScore(money: number, grid: Grid, ticksPlayed: number): number {
  const buildings = grid.getAllBuildings()
  const incomeValue = buildings.reduce(
    (acc, type) => acc + BUILDING_CONFIG[type].incomePerTick * 10,
    0,
  )
  const balanceBonus = computeBalanceBonus(grid)
  return Math.max(0, money + incomeValue + ticksPlayed + balanceBonus)
}

/** Counts how many of each type are placed. */
export function buildingTypesPresent(grid: Grid): Record<BuildingType, number> {
  const counts: Record<BuildingType, number> = {
    house: 0, office: 0, industry: 0, park: 0, road: 0,
    university: 0, powerplant: 0, port: 0,
  }
  for (const t of grid.getAllBuildings()) {
    counts[t]++
  }
  return counts
}

/** Bonus when the three productive zones are near a 1:1:1 ratio; penalty otherwise. */
function computeBalanceBonus(grid: Grid): number {
  const counts = buildingTypesPresent(grid)
  // Group by demand zone so advanced buildings (university → residential, etc.) count too.
  const r = counts.house + counts.university
  const c = counts.office + counts.port
  const i = counts.industry + counts.powerplant
  const total = r + c + i
  if (total < 3) return 0

  const ideal = total / 3
  const deviation = Math.abs(r - ideal) + Math.abs(c - ideal) + Math.abs(i - ideal)
  // Lower deviation -> higher bonus, max ~ total * 50.
  return Math.max(0, total * 50 - deviation * 50)
}
