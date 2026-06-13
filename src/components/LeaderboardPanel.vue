<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { scoresApi } from '../api/scores'
import type { ApiScore } from '../api/types'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const scores = ref<ApiScore[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    scores.value = await scoresApi.leaderboard()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erreur'
  } finally {
    loading.value = false
  }
}

onMounted(() => void load())
</script>

<template>
  <aside v-if="open" class="panel">
    <header class="panel-head">
      <div class="panel-title">Classement</div>
      <button class="close-btn" aria-label="Fermer" @click="emit('close')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </header>

    <button class="refresh-btn" :disabled="loading" @click="load">
      {{ loading ? 'Chargement...' : 'Rafraichir' }}
    </button>

    <p v-if="error" class="err">{{ error }}</p>

    <ol class="list">
      <li v-for="(s, i) in scores" :key="s.uid" class="row" :class="{ top3: i < 3 }">
        <span class="rank" :class="{ red: i < 3 }">#{{ i + 1 }}</span>
        <span class="player">{{ s.user.pseudonym }}</span>
        <span class="score">{{ s.score.toLocaleString('fr-FR') }} pts</span>
        <span class="pop">{{ s.population }} hab.</span>
      </li>
      <li v-if="!scores.length && !loading" class="empty">Aucun score pour le moment.</li>
    </ol>
  </aside>
</template>

<style scoped>
.panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(360px, 90vw);
  background: #0f0f0f;
  border-left: 1px solid rgba(255,255,255,0.1);
  border-left-width: 2px;
  border-left-color: #c0392b;
  color: white;
  display: flex;
  flex-direction: column;
  z-index: 100;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.panel-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(255,255,255,0.7);
}
.close-btn {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: color 0.1s, border-color 0.1s;
}
.close-btn:hover { color: white; border-color: rgba(255,255,255,0.3); }

.refresh-btn {
  margin: 12px 16px 4px;
  padding: 6px 10px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.5);
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.1s, border-color 0.1s;
  align-self: flex-start;
}
.refresh-btn:hover:not(:disabled) { color: white; border-color: rgba(255,255,255,0.3); }
.refresh-btn:disabled { opacity: 0.4; cursor: wait; }

.list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  margin: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}
.row {
  display: grid;
  grid-template-columns: 36px 1fr auto auto;
  gap: 8px;
  padding: 9px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  align-items: baseline;
  font-size: 13px;
}
.row.top3 { background: rgba(192,57,43,0.06); }
.rank { font-weight: 700; font-family: ui-monospace, monospace; color: rgba(255,255,255,0.3); font-size: 12px; }
.rank.red { color: #c0392b; }
.player { font-weight: 500; }
.score { font-weight: 700; font-family: ui-monospace, monospace; font-variant-numeric: tabular-nums; font-size: 12px; }
.pop { color: rgba(255,255,255,0.35); font-size: 11px; font-family: ui-monospace, monospace; }
.empty { padding: 16px; font-size: 13px; color: rgba(255,255,255,0.35); font-style: italic; }
.err { margin: 12px 16px; padding: 8px; background: rgba(192,57,43,0.15); border: 1px solid rgba(192,57,43,0.3); color: #f87171; font-size: 13px; }
</style>
