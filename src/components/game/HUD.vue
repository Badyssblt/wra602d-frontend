<script setup lang="ts">
import { computed } from 'vue'
import type { BuildingType } from '../../types'
import BuildingToolbar from './BuildingToolbar.vue'

const props = defineProps<{
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
  /** Next-placement price per building type (dynamic, depends on current city). */
  prices: Record<BuildingType, number>
  /** Current account level (gates advanced buildings). */
  playerLevel: number
  /** Accumulated XP across all submitted scores. */
  playerXp: number
  /** XP threshold for next level, or null if max level reached. */
  xpForNextLevel: number | null
  /** Prestige tier (shown next to the level when > 0). */
  prestigeLevel: number
  busy: boolean
}>()

defineEmits<{
  'update:cityName': [string]
  select: [BuildingType]
  new: []
  save: []
  load: []
  toggleLeaderboard: []
  toggleQuests: []
  prestige: []
}>()

const fmt = (n: number) => n.toLocaleString('fr-FR')
const fmtSigned = (n: number) => `${n >= 0 ? '+' : '−'}${fmt(Math.abs(Math.round(n)))}`

/** XP at the start of the current level — mirrors ProgressionPolicy.xpForLevel. */
const previousLevelTarget = computed(() => 150 * props.playerLevel * props.playerLevel)

/** 0–100 % progress toward the next level (or 100 % at max level). */
const xpProgress = computed(() => {
  if (props.xpForNextLevel === null) return 100
  const span = Math.max(1, props.xpForNextLevel - previousLevelTarget.value)
  const into = Math.max(0, props.playerXp - previousLevelTarget.value)
  return Math.min(100, Math.round((into / span) * 100))
})
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
        <div v-if="username" class="xp-row" :title="`${fmt(playerXp)} XP / ${xpForNextLevel === null ? '∞' : fmt(xpForNextLevel)} XP`">
          <span class="level-badge">
            Lvl {{ playerLevel }}<span v-if="prestigeLevel > 0" class="prestige">★{{ prestigeLevel }}</span>
          </span>
          <button
            v-if="xpForNextLevel === null"
            type="button"
            class="prestige-btn"
            title="Prestige : reset le niveau contre un bonus permanent de +10 %"
            @click="$emit('prestige')"
          >
            ✦ Prestige
          </button>
          <div v-else class="xp-bar" :aria-label="`Progression : ${xpProgress}%`">
            <div class="xp-fill" :style="{ width: `${xpProgress}%` }"></div>
          </div>
        </div>
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
      <BuildingToolbar
        :selected="selectedType"
        :prices="prices"
        :player-level="playerLevel"
        @select="$emit('select', $event)"
      />
    </section>

    <!-- Actions -->
    <section class="panel actions">
      <button :disabled="busy" title="Supprimer la partie en cours et recommencer" @click="$emit('new')">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
        <span>Recommencer</span>
      </button>
      <button :disabled="busy" title="Sauvegarder (envoie aussi le score)" @click="$emit('save')">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8" /><path d="M7 3v5h8" /></svg>
        <span>Sauvegarder</span>
      </button>
      <button :disabled="busy" title="Charger une ville" @click="$emit('load')">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h6l2 2h10v10a2 2 0 0 1-2 2H3Z" /></svg>
        <span>Charger</span>
      </button>
      <button class="ghost" title="Quêtes du jour" @click="$emit('toggleQuests')">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 7-7" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
        <span>Quêtes</span>
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
.city { min-width: 240px; }
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
  gap: 4px;
  min-width: 0;
  flex: 1;
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

/* ===== XP / level row ===== */
.xp-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}
.level-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #c4b5fd;
  padding: 2px 6px;
  background: rgba(196, 181, 253, 0.12);
  border: 1px solid rgba(196, 181, 253, 0.3);
  border-radius: 4px;
  white-space: nowrap;
}
.prestige {
  font-size: 9px;
  color: #fbbf24;
  margin-left: 2px;
}
.xp-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
  min-width: 60px;
}
.xp-fill {
  height: 100%;
  background: linear-gradient(90deg, #c4b5fd, #a78bfa);
  border-radius: 2px;
  transition: width 0.4s ease;
}
.prestige-btn {
  flex: 1;
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.4);
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.12s, transform 0.08s;
}
.prestige-btn:hover {
  background: rgba(251, 191, 36, 0.2);
}
.prestige-btn:active {
  transform: scale(0.97);
}

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
