<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { questsApi, type Quest } from '../../api/quests'
import { useAuthStore } from '../../stores/auth'
import { useToast } from '../../composables/useToast'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const auth = useAuthStore()
const { notify } = useToast()

const quests = ref<Quest[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const claiming = ref<string | null>(null)

async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    quests.value = await questsApi.list()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erreur'
  } finally {
    loading.value = false
  }
}

async function handleClaim(quest: Quest): Promise<void> {
  if (quest.claimed || !quest.completed || claiming.value) return
  claiming.value = quest.code
  try {
    const result = await questsApi.claim(quest.code)
    notify(`+${result.xpAwarded} XP — quete reclamee`, 'success')
    void auth.refresh()
    await load()
  } catch (e) {
    notify(e instanceof Error ? e.message : 'Erreur lors de la reclamation', 'error')
  } finally {
    claiming.value = null
  }
}

function progressPct(q: Quest): number {
  if (q.target <= 0) return 100
  return Math.min(100, Math.round((q.progress / q.target) * 100))
}

function formatMetric(q: Quest): string {
  const v = q.progress.toLocaleString('fr-FR')
  const t = q.target.toLocaleString('fr-FR')
  switch (q.metric) {
    case 'score':      return `${v} / ${t} pts`
    case 'population': return `${v} / ${t} hab.`
    case 'ticks':      return `${v} / ${t} s`
  }
}

onMounted(() => { if (props.open) void load() })
watch(() => props.open, (v) => { if (v) void load() })
</script>

<template>
  <aside v-if="open" class="panel" role="complementary" aria-label="Quetes">
    <header class="panel-head">
      <div class="panel-title">Quetes</div>
      <button class="close-btn" aria-label="Fermer" @click="emit('close')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </header>

    <button class="refresh-btn" :disabled="loading" @click="load">
      {{ loading ? 'Chargement...' : 'Rafraichir' }}
    </button>

    <p v-if="error" class="err">{{ error }}</p>

    <ul class="list">
      <li v-for="q in quests" :key="q.code" class="quest" :class="{ claimed: q.claimed }">
        <div class="head">
          <span class="kind" :class="q.kind">{{ q.kind === 'weekly' ? 'Hebdo' : 'Quotidien' }}</span>
          <span class="reward">+{{ q.xpReward }} XP</span>
        </div>
        <div class="label">{{ q.label }}</div>
        <div class="bar" role="progressbar" :aria-valuenow="progressPct(q)" aria-valuemin="0" aria-valuemax="100">
          <div class="fill" :style="{ width: `${progressPct(q)}%` }"></div>
        </div>
        <div class="row">
          <span class="metric">{{ formatMetric(q) }}</span>
          <button
            class="claim-btn"
            :disabled="!q.completed || q.claimed || claiming === q.code"
            @click="handleClaim(q)"
          >
            <template v-if="q.claimed">Reclamee</template>
            <template v-else-if="claiming === q.code">...</template>
            <template v-else-if="q.completed">Reclamer</template>
            <template v-else>En cours</template>
          </button>
        </div>
      </li>
      <li v-if="!quests.length && !loading" class="empty">Aucune quete disponible.</li>
    </ul>
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
  border-left: 2px solid #c0392b;
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
  padding: 8px 16px;
  margin: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.quest {
  padding: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
}
.quest.claimed { opacity: 0.45; }
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.kind {
  font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  padding: 2px 6px;
}
.kind.daily  { background: rgba(91,141,217,0.15); color: #93c5fd; }
.kind.weekly { background: rgba(192,57,43,0.15); color: #f87171; }
.reward { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.6); font-family: ui-monospace, monospace; }
.label { font-size: 13px; line-height: 1.4; margin-bottom: 8px; }

.bar { height: 3px; background: rgba(255,255,255,0.06); margin-bottom: 6px; overflow: hidden; }
.fill { height: 100%; background: #c0392b; transition: width 0.4s ease; }

.row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.metric { font-size: 11px; color: rgba(255,255,255,0.4); font-family: ui-monospace, monospace; font-variant-numeric: tabular-nums; }
.claim-btn {
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: #c0392b;
  border: 1px solid #c0392b;
  color: white;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.1s;
}
.claim-btn:hover:not(:disabled) { background: #a93226; }
.claim-btn:disabled { opacity: 0.35; cursor: not-allowed; background: transparent; border-color: rgba(255,255,255,0.12); color: rgba(255,255,255,0.35); }

.empty { font-size: 13px; color: rgba(255,255,255,0.3); font-style: italic; padding: 8px; }
.err { margin: 0 0 8px; padding: 8px; background: rgba(192,57,43,0.15); border: 1px solid rgba(192,57,43,0.3); color: #f87171; font-size: 13px; }
</style>
