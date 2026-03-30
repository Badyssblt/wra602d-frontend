import type { Grid } from './Grid'
import type { MoneyManager } from '../core/MoneyManager'
import { BUILDING_CONFIG } from './BuildingConfig'

const INCOME_INTERVAL_SECONDS = 5

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
    const income = this.calculateIncome()
    if (income > 0) this.moneyManager.addMoney(income)
  }

  private calculateIncome(): number {
    return this.grid
      .getAllBuildings()
      .reduce((total, type) => total + (BUILDING_CONFIG[type]?.incomePerTick ?? 0), 0)
  }
}
