import type { Ref } from 'vue'

export class MoneyManager {
  constructor(private readonly money: Ref<number>) {}

  canBuy(price: number): boolean {
    return this.money.value >= price
  }

  addMoney(amount: number): void {
    this.money.value += amount
  }

  removeMoney(amount: number): void {
    this.money.value -= amount
  }
}
