<script setup lang="ts">
import type { ApiCity } from '../../api/types'

defineProps<{
  cities: ApiCity[]
  busy: boolean
}>()

defineEmits<{
  load: [string]
  close: []
}>()
</script>

<template>
  <div class="modal" @click.self="$emit('close')">
    <div class="content">
      <h2>Charger une ville</h2>
      <ul v-if="cities.length">
        <li v-for="c in cities" :key="c.uid">
          <span>{{ c.name }}</span>
          <small>{{ c.buildings?.length ?? 0 }} bâtiments · {{ c.money?.toLocaleString('fr-FR') }} €</small>
          <button :disabled="busy" @click="$emit('load', c.uid)">Charger</button>
        </li>
      </ul>
      <p v-else><em>Aucune ville sauvegardée.</em></p>
      <button class="close" @click="$emit('close')">Fermer</button>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); display: grid; place-items: center;
  z-index: 200; backdrop-filter: blur(6px);
}
.content {
  background: #1e293b; color: white; padding: 24px; border-radius: 12px;
  width: min(420px, 90vw); max-height: 80vh; overflow-y: auto;
}
.content h2 { margin-top: 0; }
.content ul { display: flex; flex-direction: column; gap: 8px; padding: 0; list-style: none; }
.content li {
  display: flex; align-items: center; gap: 12px; padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05); border-radius: 6px;
}
.content li small { flex: 1; color: rgba(255,255,255,0.5); font-size: 11px; }
.content li button {
  padding: 6px 12px; background: #2b6cb0; color: white; border: none; border-radius: 4px; cursor: pointer;
}
.content li button:disabled { opacity: 0.5; cursor: not-allowed; }
.close {
  margin-top: 16px; width: 100%; padding: 8px; background: rgba(255,255,255,0.08); color: white;
  border: 1px solid rgba(255,255,255,0.18); border-radius: 4px; cursor: pointer;
}
</style>
