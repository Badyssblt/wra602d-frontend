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
  netPerHour: number
  grossPerHour: number
  maintenancePerHour: number
  selectedType: BuildingType
  prices: Record<BuildingType, number>
  playerLevel: number
  playerXp: number
  xpForNextLevel: number | null
  prestigeLevel: number
  busy: boolean
}>()

defineEmits<{
  'update:cityName': [string]
  select: [BuildingType]
  new: []
  save: []
  toggleLeaderboard: []
  toggleQuests: []
  prestige: []
}>()

const fmt = (n: number) => n.toLocaleString('fr-FR')
const fmtSigned = (n: number) => `${n >= 0 ? '+' : '-'}${fmt(Math.abs(Math.round(n)))}`

const previousLevelTarget = computed(() => 150 * props.playerLevel * props.playerLevel)
const xpProgress = computed(() => {
  if (props.xpForNextLevel === null) return 100
  const span = Math.max(1, props.xpForNextLevel - previousLevelTarget.value)
  const into = Math.max(0, props.playerXp - previousLevelTarget.value)
  return Math.min(100, Math.round((into / span) * 100))
})
</script>

<template>
  <div class="hud">
    <!-- City + level -->
    <section class="panel city-panel">
      <div class="city-block">
        <input
          :value="cityName"
          class="city-name"
          :disabled="busy"
          spellcheck="false"
          maxlength="80"
          aria-label="Nom de la ville"
          @input="$emit('update:cityName', ($event.target as HTMLInputElement).value)"
        />
        <div v-if="username" class="city-sub">par <strong>{{ username }}</strong></div>
      </div>
      <div class="level-block">
        <div class="level-num">
          <span class="level-label">Lvl</span>
          <span class="level-val">{{ playerLevel }}</span>
          <span v-if="prestigeLevel > 0" class="prestige-star">*{{ prestigeLevel }}</span>
        </div>
        <div v-if="xpForNextLevel !== null" class="xp-bar" :title="`${fmt(playerXp)} / ${fmt(xpForNextLevel)} XP`">
          <div class="xp-fill" :style="{ width: `${xpProgress}%` }"></div>
        </div>
        <button
          v-else
          class="prestige-btn"
          @click="$emit('prestige')"
        >Prestige</button>
      </div>
    </section>

    <!-- Stats -->
    <section class="panel stats-panel">
      <div class="stat">
        <div class="stat-label">Tresor</div>
        <div class="stat-value money">{{ fmt(money) }} <span class="unit">€</span></div>
        <div class="stat-rate" :class="{ neg: netPerHour < 0, pos: netPerHour > 0 }">
          {{ fmtSigned(netPerHour) }} €/h
        </div>
      </div>
      <div class="stat-sep"></div>
      <div class="stat">
        <div class="stat-label">Population</div>
        <div class="stat-value">{{ population }} <span class="unit">hab.</span></div>
      </div>
      <div class="stat-sep"></div>
      <div class="stat">
        <div class="stat-label">Score</div>
        <div class="stat-value score">{{ fmt(Math.round(score)) }} <span class="unit">pts</span></div>
      </div>
    </section>

    <!-- Building toolbar -->
    <section class="panel build-panel">
      <div class="build-label">Construction</div>
      <BuildingToolbar
        :selected="selectedType"
        :prices="prices"
        :player-level="playerLevel"
        @select="$emit('select', $event)"
      />
    </section>

    <!-- Actions -->
    <section class="panel actions-panel">
      <button :disabled="busy" title="Reinitialiser la ville" @click="$emit('new')">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
        </svg>
        <span>Recommencer</span>
      </button>
      <button :disabled="busy" title="Sauvegarder manuellement" @click="$emit('save')">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/>
          <path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>
        </svg>
        <span>Sauvegarder</span>
      </button>
      <button class="ghost" title="Quetes du jour" @click="$emit('toggleQuests')">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 11l3 3 7-7"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        <span>Quetes</span>
      </button>
      <button class="ghost" title="Classement" @click="$emit('toggleLeaderboard')">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 21h8"/><path d="M12 17v4"/>
          <path d="M7 4h10v6a5 5 0 0 1-10 0Z"/>
          <path d="M17 4h3v3a3 3 0 0 1-3 3"/><path d="M7 4H4v3a3 3 0 0 0 3 3"/>
        </svg>
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
  gap: 1px;
  background: rgba(255,255,255,0.06);
  pointer-events: none;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}

.panel {
  pointer-events: auto;
  background: #0f0f0f;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 16px;
  color: white;
  border-top: 2px solid transparent;
}

/* ── City panel ── */
.city-panel { min-width: 220px; flex-direction: column; align-items: flex-start; gap: 8px; border-top-color: #c0392b; }
.city-block { width: 100%; }
.city-name {
  background: transparent;
  border: none;
  border-bottom: 1px solid transparent;
  color: white;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.01em;
  padding: 1px 0;
  width: 100%;
  font-family: inherit;
  text-transform: uppercase;
}
.city-name:hover { border-bottom-color: rgba(255,255,255,0.2); }
.city-name:focus { outline: none; border-bottom-color: #c0392b; }
.city-sub { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 1px; }
.city-sub strong { color: rgba(255,255,255,0.7); font-weight: 500; }

.level-block { width: 100%; display: flex; align-items: center; gap: 8px; }
.level-num { display: flex; align-items: baseline; gap: 3px; flex-shrink: 0; }
.level-label { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.3); }
.level-val { font-size: 14px; font-weight: 900; color: white; font-family: ui-monospace, monospace; }
.prestige-star { font-size: 10px; color: #c0392b; margin-left: 1px; font-weight: 700; }

.xp-bar { flex: 1; height: 3px; background: rgba(255,255,255,0.08); overflow: hidden; }
.xp-fill { height: 100%; background: #c0392b; transition: width 0.4s ease; }
.prestige-btn {
  flex: 1; padding: 3px 8px; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  color: #c0392b; background: transparent; border: 1px solid #c0392b; cursor: pointer; font-family: inherit;
  transition: background 0.1s;
}
.prestige-btn:hover { background: rgba(192,57,43,0.12); }

/* ── Stats panel ── */
.stats-panel { gap: 0; }
.stat { display: flex; flex-direction: column; gap: 2px; padding: 0 16px; }
.stat:first-child { padding-left: 0; }
.stat-sep { width: 1px; height: 36px; background: rgba(255,255,255,0.08); flex-shrink: 0; }
.stat-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255,255,255,0.4); }
.stat-value { font-size: 20px; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; font-family: ui-monospace, monospace; }
.stat-value .unit { font-size: 11px; font-weight: 500; opacity: 0.5; }
.stat-value.money { color: #fbbf24; }
.stat-value.score { color: #c0392b; }
.stat-rate { font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; color: rgba(255,255,255,0.35); }
.stat-rate.pos { color: #4ade80; }
.stat-rate.neg { color: #f87171; }

/* ── Build panel ── */
.build-panel { flex-direction: column; align-items: flex-start; gap: 5px; padding: 8px 12px; }
.build-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.14em; color: rgba(255,255,255,0.3); font-weight: 700; }

/* ── Actions panel ── */
.actions-panel { gap: 4px; padding: 8px; margin-left: auto; }
.actions-panel button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  width: 60px;
  height: 54px;
  padding: 4px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  color: rgba(255,255,255,0.7);
  font-family: inherit;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
}
.actions-panel button svg { color: rgba(255,255,255,0.6); }
.actions-panel button:hover:not(:disabled) {
  background: rgba(192,57,43,0.12);
  border-color: rgba(192,57,43,0.4);
  color: white;
}
.actions-panel button:hover:not(:disabled) svg { color: #c0392b; }
.actions-panel button:active:not(:disabled) { opacity: 0.8; }
.actions-panel button:disabled { opacity: 0.3; cursor: not-allowed; }
.actions-panel button.ghost { background: transparent; border-color: rgba(255,255,255,0.05); }

@media (max-width: 1100px) {
  .actions-panel button span { display: none; }
  .actions-panel button { width: 42px; }
  .stats-panel .stat { padding: 0 10px; }
  .stat-value { font-size: 17px; }
}
</style>
