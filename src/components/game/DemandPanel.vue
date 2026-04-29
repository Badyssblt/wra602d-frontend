<script setup lang="ts">
import type { DemandZone } from '../../types'
import { DEMAND_COLORS, DEMAND_LABELS, type DemandState } from '../../game/DemandSystem'

defineProps<{ demand: DemandState }>()

interface Row {
  zone: DemandZone
  letter: string
  shortLabel: string
}

const ROWS: Row[] = [
  { zone: 'residential', letter: 'R', shortLabel: 'Hab.' },
  { zone: 'commercial',  letter: 'C', shortLabel: 'Cmrc.' },
  { zone: 'industrial',  letter: 'I', shortLabel: 'Ind.' },
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
        :aria-label="DEMAND_LABELS[row.zone]"
      >
        {{ row.letter }}
      </div>
      <div class="track">
        <div
          class="fill"
          :style="{ width: demand[row.zone] + '%', background: DEMAND_COLORS[row.zone] }"
        />
      </div>
      <div class="value">{{ Math.round(demand[row.zone]) }}</div>
    </div>
  </aside>
</template>

<style scoped>
.demand {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  width: 200px;
  background: linear-gradient(180deg, rgba(11, 18, 32, 0.78), rgba(7, 11, 22, 0.88));
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-top-color: rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  color: white;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  z-index: 40;
}
.title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 2px;
}
.row {
  display: grid;
  grid-template-columns: 22px 1fr 26px;
  align-items: center;
  gap: 8px;
}
.badge {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.7);
  letter-spacing: 0;
}
.track {
  position: relative;
  height: 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  overflow: hidden;
}
.fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
  box-shadow: 0 0 8px var(--accent, rgba(255, 255, 255, 0.2));
}
.value {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: rgba(255, 255, 255, 0.6);
  text-align: right;
}
</style>
