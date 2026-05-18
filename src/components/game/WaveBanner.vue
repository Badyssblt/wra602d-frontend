<script setup lang="ts">
import { computed } from 'vue'
import type { PendingWave } from '../../game/DisasterSystem'

const props = defineProps<{ wave: PendingWave }>()

const FLAVOR_LABEL: Record<PendingWave['flavor'], string> = {
  storm:     'Tempête en approche',
  recession: 'Récession imminente',
  outage:    'Coupure réseau imminente',
}

const eta = computed(() => Math.max(0, Math.ceil(props.wave.etaS)))
const label = computed(() => FLAVOR_LABEL[props.wave.flavor])
</script>

<template>
  <div class="wave-banner" role="alert" aria-live="assertive">
    <div class="icon" aria-hidden="true">⚠</div>
    <div class="text">
      <div class="title">{{ label }}</div>
      <div class="meta">{{ wave.severity }} bâtiment(s) touchés dans <strong>{{ eta }}s</strong></div>
    </div>
  </div>
</template>

<style scoped>
.wave-banner {
  position: absolute;
  top: 96px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.92), rgba(180, 30, 30, 0.92));
  border: 1px solid rgba(255, 200, 200, 0.5);
  border-radius: 10px;
  color: white;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
  pointer-events: none;
  animation: pulse 1s ease-in-out infinite;
}
.icon {
  font-size: 26px;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.4));
}
.title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.meta {
  font-size: 12px;
  opacity: 0.9;
  font-variant-numeric: tabular-nums;
}
.meta strong {
  font-weight: 700;
  color: #fff7d6;
}
@keyframes pulse {
  0%, 100% { transform: translateX(-50%) scale(1); }
  50%      { transform: translateX(-50%) scale(1.03); }
}
</style>
