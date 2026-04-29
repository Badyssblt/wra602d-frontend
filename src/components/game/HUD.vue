<script setup lang="ts">
import type { BuildingType } from '../../types'
import BuildingToolbar from './BuildingToolbar.vue'

defineProps<{
  cityName: string
  username: string | null
  money: number
  population: number
  score: number
  /** Net €/h (positive = revenue, negative = deficit). */
  netPerHour: number
  /** Gross €/h (income before maintenance). */
  grossPerHour: number
  /** Maintenance €/h (negative number when displayed). */
  maintenancePerHour: number
  selectedType: BuildingType
  busy: boolean
}>()

defineEmits<{
  'update:cityName': [string]
  select: [BuildingType]
  new: []
  save: []
  load: []
  submit: []
  toggleLeaderboard: []
}>()

const fmt = (n: number) => n.toLocaleString('fr-FR')
const fmtSigned = (n: number) => `${n >= 0 ? '+' : '−'}${fmt(Math.abs(Math.round(n)))}`
</script>

<template>
  <div class="hud">
    <!-- City info -->
    <section class="panel city">
      <div class="emblem" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
          <path d="M3 21h18" />
          <path d="M5 21V10l7-5 7 5v11" />
          <path d="M9 21v-7h6v7" />
          <circle cx="12" cy="9" r="1" />
        </svg>
      </div>
      <div class="city-text">
        <input
          :value="cityName"
          class="city-name"
          :disabled="busy"
          spellcheck="false"
          maxlength="80"
          aria-label="Nom de la ville"
          @input="$emit('update:cityName', ($event.target as HTMLInputElement).value)"
        />
        <div v-if="username" class="city-meta">par <strong>{{ username }}</strong></div>
      </div>
    </section>

    <!-- Stats -->
    <section class="panel stats">
      <div
        class="stat money"
        :title="`Revenu brut : +${fmt(Math.round(grossPerHour))} €/h\nMaintenance : −${fmt(Math.round(maintenancePerHour))} €/h`"
      >
        <div class="stat-label">Trésor</div>
        <div class="stat-value">{{ fmt(money) }} <span class="unit">€</span></div>
        <div class="stat-rate" :class="{ negative: netPerHour < 0, positive: netPerHour > 0 }">
          {{ fmtSigned(netPerHour) }} €/h
        </div>
      </div>
      <div class="stat pop">
        <div class="stat-label">Population</div>
        <div class="stat-value">{{ population }} <span class="unit">hab.</span></div>
      </div>
      <div class="stat score">
        <div class="stat-label">Score</div>
        <div class="stat-value">{{ fmt(Math.round(score)) }} <span class="unit">pts</span></div>
      </div>
    </section>

    <!-- Build toolbar -->
    <section class="panel build">
      <div class="panel-title">Construction</div>
      <BuildingToolbar :selected="selectedType" @select="$emit('select', $event)" />
    </section>

    <!-- Actions -->
    <section class="panel actions">
      <button :disabled="busy" title="Nouvelle partie" @click="$emit('new')">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14" /></svg>
        <span>Nouvelle</span>
      </button>
      <button :disabled="busy" title="Sauvegarder" @click="$emit('save')">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8" /><path d="M7 3v5h8" /></svg>
        <span>Sauver</span>
      </button>
      <button :disabled="busy" title="Charger une ville" @click="$emit('load')">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h6l2 2h10v10a2 2 0 0 1-2 2H3Z" /></svg>
        <span>Charger</span>
      </button>
      <button :disabled="busy" title="Soumettre votre score" @click="$emit('submit')">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" /></svg>
        <span>Soumettre</span>
      </button>
      <button class="ghost" title="Voir le classement" @click="$emit('toggleLeaderboard')">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v6a5 5 0 0 1-10 0Z" /><path d="M17 4h3v3a3 3 0 0 1-3 3" /><path d="M7 4H4v3a3 3 0 0 0 3 3" /></svg>
        <span>Classement</span>
      </button>
    </section>
  </div>
</template>

<style scoped>
.hud {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  pointer-events: none;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  color: white;
}

.panel {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 16px;
  background: linear-gradient(180deg, rgba(11, 18, 32, 0.78), rgba(7, 11, 22, 0.88));
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
}

/* ===== City panel ===== */
.city { min-width: 220px; }
.emblem {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(91, 141, 217, 0.25), rgba(91, 141, 217, 0.05));
  border: 1px solid rgba(91, 141, 217, 0.4);
  color: #93c5fd;
  flex-shrink: 0;
}
.city-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.city-name {
  background: transparent;
  border: none;
  border-bottom: 1px dashed transparent;
  color: white;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 1px 2px;
  width: 100%;
  font-family: inherit;
  text-transform: uppercase;
}
.city-name:hover { border-bottom-color: rgba(255, 255, 255, 0.15); }
.city-name:focus {
  outline: none;
  border-bottom-color: rgba(147, 197, 253, 0.6);
}
.city-meta {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.04em;
}
.city-meta strong { color: rgba(255, 255, 255, 0.85); font-weight: 500; }

/* ===== Stats panel ===== */
.stats { gap: 22px; }
.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-left: 2px solid rgba(255, 255, 255, 0.1);
  padding-left: 12px;
}
.stat:first-child { border-left: none; padding-left: 0; }
.stat-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
}
.stat-value {
  font-size: 22px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}
.stat-value .unit { font-size: 12px; font-weight: 500; opacity: 0.6; margin-left: 2px; }
.stat-rate {
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  margin-top: 1px;
  color: rgba(255, 255, 255, 0.5);
}
.stat-rate.positive { color: #4ade80; }
.stat-rate.negative { color: #f87171; }
.stat.money .stat-value { color: #fbbf24; }
.stat.pop   .stat-value { color: #93c5fd; }
.stat.score .stat-value { color: #c4b5fd; }
.stat.pop   { border-color: rgba(147, 197, 253, 0.3); }
.stat.score { border-color: rgba(196, 181, 253, 0.3); }

/* ===== Build panel ===== */
.build { flex-direction: column; align-items: stretch; gap: 6px; padding: 8px 12px; }
.panel-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.45);
  margin-left: 2px;
}

/* ===== Actions panel ===== */
.actions { gap: 6px; padding: 8px; }
.actions button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 64px;
  height: 56px;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.85);
  font-family: inherit;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s, transform 0.08s;
}
.actions button svg { color: rgba(147, 197, 253, 0.9); }
.actions button:hover:not(:disabled) {
  background: rgba(91, 141, 217, 0.12);
  border-color: rgba(91, 141, 217, 0.4);
  color: white;
}
.actions button:active:not(:disabled) { transform: scale(0.96); }
.actions button:disabled { opacity: 0.4; cursor: not-allowed; }
.actions button.ghost { background: transparent; }
.actions button.ghost svg { color: rgba(196, 181, 253, 0.9); }

@media (max-width: 1100px) {
  .actions button span { display: none; }
  .actions button { width: 44px; }
  .panel { padding: 8px 10px; }
}
</style>
