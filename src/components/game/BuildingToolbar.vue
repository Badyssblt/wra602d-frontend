<script setup lang="ts">
import { computed } from 'vue'
import type { BuildingType } from '../../types'
import { BUILDING_CONFIG, BUILDING_ORDER } from '../../game/BuildingConfig'
import BuildingIcon from './BuildingIcon.vue'

const props = defineProps<{
  selected: BuildingType
  /** Next-placement price per type, recomputed each tick (quadratic curve). */
  prices: Record<BuildingType, number>
  /** Player's current account level — gates advanced buildings. */
  playerLevel: number
}>()
defineEmits<{ select: [BuildingType] }>()

interface Item {
  type: BuildingType
  label: string
  color: string
  unlockLevel: number
}

const COLOR: Record<BuildingType, string> = {
  house:      '#e8864a',
  office:     '#5b8dd9',
  industry:   '#fbbf24',
  park:       '#4caf50',
  road:       '#a1a1aa',
  university: '#a78bfa',
  powerplant: '#ef4444',
  port:       '#14b8a6',
}

const items = computed<Item[]>(() =>
  BUILDING_ORDER.map((type) => ({
    type,
    label: BUILDING_CONFIG[type].label,
    color: COLOR[type],
    unlockLevel: BUILDING_CONFIG[type].unlockLevel,
  })),
)

const fmt = (n: number) => n.toLocaleString('fr-FR')

function isLocked(unlockLevel: number): boolean {
  return props.playerLevel < unlockLevel
}
</script>

<template>
  <div class="toolbar">
    <button
      v-for="item in items"
      :key="item.type"
      type="button"
      class="btn"
      :class="{ active: selected === item.type, locked: isLocked(item.unlockLevel) }"
      :style="{ '--accent': item.color }"
      :disabled="isLocked(item.unlockLevel)"
      :title="
        isLocked(item.unlockLevel)
          ? `${item.label} — débloqué au niveau ${item.unlockLevel}`
          : `${item.label} — ${fmt(prices[item.type])} €`
      "
      :aria-label="
        isLocked(item.unlockLevel)
          ? `${item.label}, verrouillé, niveau ${item.unlockLevel} requis`
          : `${item.label}, ${fmt(prices[item.type])} euros`
      "
      :aria-pressed="selected === item.type"
      @click="!isLocked(item.unlockLevel) && $emit('select', item.type)"
    >
      <BuildingIcon :type="item.type" />
      <span v-if="isLocked(item.unlockLevel)" class="lock">Lvl {{ item.unlockLevel }}</span>
      <span v-else class="price">{{ fmt(prices[item.type]) }} €</span>
    </button>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
}
.btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 60px;
  height: 60px;
  border-radius: 10px;
  border: 2px solid transparent;
  background: transparent;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s, transform 0.08s;
}
.btn:hover:not(.locked) {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}
.btn:active:not(.locked) {
  transform: scale(0.95);
}
.btn.active {
  background: color-mix(in srgb, var(--accent) 18%, transparent);
  border-color: var(--accent);
  color: var(--accent);
}
.btn.locked {
  opacity: 0.4;
  cursor: not-allowed;
  color: rgba(255, 255, 255, 0.45);
}
.price {
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
}
.btn.active .price {
  color: var(--accent);
}
.lock {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
}
</style>
