<script setup lang="ts">
import type { DemandZone } from '../../types'
import { DEMAND_COLORS, DEMAND_LABELS, type DemandState } from '../../game/DemandSystem'

defineProps<{ demand: DemandState }>()

interface Row {
  zone: DemandZone
  letter: string
}

const ROWS: Row[] = [
  { zone: 'residential', letter: 'R' },
  { zone: 'commercial',  letter: 'C' },
  { zone: 'industrial',  letter: 'I' },
]
</script>

<template>
  <aside class="demand">
    <div class="title">Demande</div>
    <div v-for="row in ROWS" :key="row.zone" class="row">
      <div
        class="badge"
        :style="{ background: DEMAND_COLORS[row.zone] }"
        :title="DEMAND_LABELS[row.zone]"
      >{{ row.letter }}</div>
      <div class="track">
        <div class="fill" :style="{ width: demand[row.zone] + '%', background: DEMAND_COLORS[row.zone] }" />
      </div>
      <div class="value">{{ Math.round(demand[row.zone]) }}</div>
    </div>
  </aside>
</template>

<style scoped>
.demand {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  width: 180px;
  background: #0f0f0f;
  border: 1px solid rgba(255,255,255,0.1);
  border-left: 2px solid #c0392b;
  color: white;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  z-index: 40;
}
.title {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(255,255,255,0.35);
  font-weight: 700;
  margin-bottom: 2px;
}
.row {
  display: grid;
  grid-template-columns: 20px 1fr 24px;
  align-items: center;
  gap: 7px;
}
.badge {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  font-size: 11px;
  font-weight: 700;
  color: rgba(0,0,0,0.75);
}
.track {
  position: relative;
  height: 5px;
  background: rgba(255,255,255,0.06);
  overflow: hidden;
}
.fill {
  height: 100%;
  transition: width 0.3s ease;
}
.value {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: rgba(255,255,255,0.5);
  text-align: right;
  font-family: ui-monospace, monospace;
}
</style>
