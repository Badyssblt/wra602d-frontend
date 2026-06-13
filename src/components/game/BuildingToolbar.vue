<script setup lang="ts">
import { computed } from 'vue'
import type { BuildingType } from '../../types'
import { BUILDING_CONFIG, BUILDING_ORDER } from '../../game/BuildingConfig'
import BuildingIcon from './BuildingIcon.vue'

const props = defineProps<{
  selected: BuildingType
  prices: Record<BuildingType, number>
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
          ? `${item.label} — niveau ${item.unlockLevel} requis`
          : `${item.label} — ${fmt(prices[item.type])} €`
      "
      :aria-pressed="selected === item.type"
      @click="!isLocked(item.unlockLevel) && $emit('select', item.type)"
    >
      <BuildingIcon :type="item.type" />
      <span v-if="isLocked(item.unlockLevel)" class="sub">Lvl {{ item.unlockLevel }}</span>
      <span v-else class="sub">{{ fmt(prices[item.type]) }}</span>
    </button>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 54px;
  height: 54px;
  border: 1px solid rgba(255,255,255,0.08);
  border-bottom: 2px solid transparent;
  background: rgba(255,255,255,0.03);
  color: rgba(255,255,255,0.55);
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
}
.btn:hover:not(.locked) {
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.9);
  border-color: rgba(255,255,255,0.15);
  border-bottom-color: var(--accent);
}
.btn.active {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.12);
  border-bottom-color: var(--accent);
  color: var(--accent);
}
.btn.locked {
  opacity: 0.35;
  cursor: not-allowed;
}
.sub {
  font-size: 9px;
  font-weight: 600;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
}
.btn.active .sub { color: var(--accent); opacity: 0.8; }
</style>
