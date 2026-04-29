<script setup lang="ts">
defineProps<{ url: string }>()
defineEmits<{ copy: []; dismiss: [] }>()
</script>

<template>
  <div class="banner">
    <span>Score partageable :</span>
    <code>{{ url }}</code>
    <button @click="$emit('copy')">Copier</button>
    <button class="dismiss" @click="$emit('dismiss')">✕</button>
  </div>
</template>

<style scoped>
.banner {
  position: absolute; bottom: 100px; left: 50%; transform: translateX(-50%);
  background: rgba(5, 150, 105, 0.95); padding: 12px 16px; border-radius: 8px; color: white;
  display: flex; align-items: center; gap: 10px; max-width: 90vw; flex-wrap: wrap;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
code {
  background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px; font-family: monospace;
  font-size: 12px; max-width: 360px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
button { padding: 4px 10px; background: white; color: #059669; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
.dismiss { background: transparent; color: white; }
</style>
