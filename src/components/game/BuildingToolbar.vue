<script setup lang="ts">
import type { BuildingType } from '../../types'
import { BUILDING_CONFIG } from '../../game/BuildingConfig'
import BuildingIcon from './BuildingIcon.vue'

defineProps<{ selected: BuildingType }>()
defineEmits<{ select: [BuildingType] }>()

interface Item {
  type: BuildingType
  label: string
  color: string
}

const ITEMS: Item[] = [
  { type: 'house', label: 'Maison', color: '#e8864a' },
  { type: 'office', label: 'Bureau', color: '#5b8dd9' },
  { type: 'industry', label: 'Industrie', color: '#fbbf24' },
  { type: 'park', label: 'Parc', color: '#4caf50' },
  { type: 'road', label: 'Route', color: '#a1a1aa' },
]
</script>

<template>
  <div class="toolbar">
    <button
      v-for="item in ITEMS"
      :key="item.type"
      type="button"
      class="btn"
      :class="{ active: selected === item.type }"
      :style="{ '--accent': item.color }"
      :title="`${item.label} — ${BUILDING_CONFIG[item.type].price} €`"
      :aria-label="`${item.label}, ${BUILDING_CONFIG[item.type].price} euros`"
      :aria-pressed="selected === item.type"
      @click="$emit('select', item.type)"
    >
      <BuildingIcon :type="item.type" />
      <span class="price">{{ BUILDING_CONFIG[item.type].price }} €</span>
    </button>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
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
.btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}
.btn:active {
  transform: scale(0.95);
}
.btn.active {
  background: color-mix(in srgb, var(--accent) 18%, transparent);
  border-color: var(--accent);
  color: var(--accent);
}
.price {
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.02em;
}
.btn.active .price {
  color: var(--accent);
}
</style>
