<script setup lang="ts">
import { computed } from 'vue'
import type { PendingWave } from '../../game/DisasterSystem'

const props = defineProps<{ wave: PendingWave }>()

const FLAVOR_LABEL: Record<PendingWave['flavor'], string> = {
  storm:     'Tempete en approche',
  recession: 'Recession imminente',
  outage:    'Coupure reseau imminente',
}

const eta = computed(() => Math.max(0, Math.ceil(props.wave.etaS)))
const label = computed(() => FLAVOR_LABEL[props.wave.flavor])
</script>

<template>
  <div class="wave-banner" role="alert" aria-live="assertive">
    <div class="icon" aria-hidden="true">!</div>
    <div class="text">
      <div class="title">{{ label }}</div>
      <div class="meta">{{ wave.severity }} batiment(s) touches dans <strong>{{ eta }}s</strong></div>
    </div>
  </div>
</template>

<style scoped>
.wave-banner {
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  background: #c0392b;
  border: 1px solid rgba(255,200,200,0.3);
  border-top: 3px solid rgba(255,255,255,0.3);
  color: white;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  pointer-events: none;
  z-index: 60;
  animation: pulse 1s ease-in-out infinite;
}
.icon {
  font-size: 22px;
  font-weight: 900;
  font-family: ui-monospace, monospace;
  line-height: 1;
  opacity: 0.9;
}
.title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.meta {
  font-size: 12px;
  opacity: 0.85;
  font-variant-numeric: tabular-nums;
}
.meta strong {
  font-weight: 700;
}
@keyframes pulse {
  0%, 100% { transform: translateX(-50%) scale(1); }
  50%       { transform: translateX(-50%) scale(1.02); }
}
</style>
