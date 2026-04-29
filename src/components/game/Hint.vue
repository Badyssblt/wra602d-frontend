<script setup lang="ts">
defineProps<{ message: string }>()
</script>

<template>
  <div class="hint">{{ message }}</div>
</template>

<style scoped>
.hint {
  position: absolute; top: 60px; left: 50%; transform: translateX(-50%);
  padding: 6px 14px; background: rgba(0, 0, 0, 0.35); backdrop-filter: blur(6px);
  border-radius: 20px; color: rgba(255, 255, 255, 0.6); font-size: 12px; pointer-events: none; white-space: nowrap;
}
</style>
