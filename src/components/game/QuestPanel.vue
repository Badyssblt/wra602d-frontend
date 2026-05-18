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
    notify(`+${result.xpAwarded} XP — quête réclamée`, 'success')
    void auth.refresh()
    await load()
  } catch (e) {
    notify(e instanceof Error ? e.message : 'Erreur lors de la réclamation', 'error')
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
  <aside v-if="open" class="panel" role="complementary" aria-label="Quêtes">
    <header>
      <h2>Quêtes</h2>
      <button class="close" aria-label="Fermer" @click="emit('close')">✕</button>
    </header>

    <button class="refresh" :disabled="loading" @click="load">
      {{ loading ? 'Chargement…' : 'Rafraîchir' }}
    </button>

    <p v-if="error" class="err">{{ error }}</p>

    <ul v-else class="list">
      <li v-for="q in quests" :key="q.code" class="quest" :class="{ claimed: q.claimed }">
        <div class="head">
          <span class="kind" :class="q.kind">{{ q.kind === 'weekly' ? 'Hebdo' : 'Quotidien' }}</span>
          <span class="reward">+{{ q.xpReward }} XP</span>
        </div>
        <div class="label">{{ q.label }}</div>
        <div class="bar" :aria-valuenow="progressPct(q)" aria-valuemin="0" aria-valuemax="100" role="progressbar">
          <div class="fill" :style="{ width: `${progressPct(q)}%` }"></div>
        </div>
        <div class="row">
          <span class="metric">{{ formatMetric(q) }}</span>
          <button
            class="claim"
            :disabled="!q.completed || q.claimed || claiming === q.code"
            @click="handleClaim(q)"
          >
            <template v-if="q.claimed">Réclamée</template>
            <template v-else-if="claiming === q.code">…</template>
            <template v-else-if="q.completed">Réclamer</template>
            <template v-else>En cours</template>
          </button>
        </div>
      </li>
      <li v-if="!quests.length && !loading" class="empty">Aucune quête disponible.</li>
    </ul>
  </aside>
</template>

<style scoped>
.panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(380px, 90vw);
  background: rgba(15, 23, 42, 0.94);
  backdrop-filter: blur(16px);
  color: white;
  padding: 20px;
  overflow-y: auto;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 100;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
h2 { margin: 0; font-size: 18px; }
.close { background: transparent; border: none; color: white; font-size: 18px; cursor: pointer; }
.refresh {
  margin-bottom: 14px; padding: 6px 12px; background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18); color: white; border-radius: 4px; cursor: pointer; font-size: 13px;
}
.refresh:disabled { opacity: 0.5; cursor: wait; }
.err { background: #7f1d1d; padding: 8px; border-radius: 4px; }

.list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.quest {
  padding: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
}
.quest.claimed { opacity: 0.55; }
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.kind {
  font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  padding: 2px 6px; border-radius: 3px;
}
.kind.daily  { background: rgba(91, 141, 217, 0.18); color: #93c5fd; }
.kind.weekly { background: rgba(196, 181, 253, 0.18); color: #c4b5fd; }
.reward { font-size: 11px; font-weight: 700; color: #fbbf24; }
.label { font-size: 13px; line-height: 1.35; margin-bottom: 8px; color: white; }

.bar {
  height: 5px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; margin-bottom: 6px;
}
.fill {
  height: 100%;
  background: linear-gradient(90deg, #93c5fd, #5b8dd9);
  border-radius: 3px;
  transition: width 0.4s ease;
}
.row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.metric { font-size: 11px; color: rgba(255,255,255,0.6); font-variant-numeric: tabular-nums; }
.claim {
  padding: 5px 12px; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
  background: linear-gradient(135deg, #5b8dd9, #4a6fb8); border: 1px solid rgba(147,197,253,0.5); color: white;
  border-radius: 4px; cursor: pointer; transition: background 0.12s, transform 0.08s;
}
.claim:hover:not(:disabled) { background: linear-gradient(135deg, #6b9de9, #5a7fc8); }
.claim:active:not(:disabled) { transform: scale(0.97); }
.claim:disabled { opacity: 0.4; cursor: not-allowed; background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); }

.empty { font-size: 13px; color: rgba(255,255,255,0.5); font-style: italic; padding: 12px; }
</style>
