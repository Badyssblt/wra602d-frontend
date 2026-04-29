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
    <header>
      <h2>Classement public</h2>
      <button class="close" @click="emit('close')">✕</button>
    </header>

    <button class="refresh" @click="load">Rafraîchir</button>

    <p v-if="loading">Chargement…</p>
    <p v-else-if="error" class="err">{{ error }}</p>

    <ol v-else class="list">
      <li v-for="(s, i) in scores" :key="s.uid">
        <span class="rank">#{{ i + 1 }}</span>
        <span class="player">{{ s.user.pseudonym }}</span>
        <span class="score">{{ s.score.toLocaleString('fr-FR') }} pts</span>
        <span class="pop">{{ s.population }} hab.</span>
      </li>
      <li v-if="!scores.length"><em>Aucun score pour le moment.</em></li>
    </ol>
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
}
header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
h2 { margin: 0; font-size: 18px; }
.close {
  background: transparent; border: none; color: white; font-size: 18px; cursor: pointer;
}
.refresh {
  margin-bottom: 12px; padding: 6px 12px; background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18); color: white; border-radius: 4px; cursor: pointer; font-size: 13px;
}
.list { display: flex; flex-direction: column; gap: 6px; padding: 0; margin: 0; list-style: none; }
.list li {
  display: grid; grid-template-columns: 40px 1fr auto auto; gap: 8px;
  padding: 8px 10px; background: rgba(255, 255, 255, 0.04); border-radius: 6px; align-items: baseline;
}
.rank { color: #93c5fd; font-weight: 600; }
.player { font-weight: 500; }
.score { color: #fbbf24; font-weight: 600; }
.pop { color: rgba(255, 255, 255, 0.5); font-size: 12px; }
.err { background: #7f1d1d; padding: 8px; border-radius: 4px; }
</style>
