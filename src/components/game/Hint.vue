<script setup lang="ts">
defineProps<{ message: string }>()
</script>

<template>
  <div class="hint">{{ message }}</div>
</template>

<style scoped>
.hint {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 5px 12px;
  background: #0f0f0f;
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.4);
  font-size: 11px;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  font-weight: 500;
  letter-spacing: 0.02em;
  pointer-events: none;
  white-space: nowrap;
  z-index: 30;
}
</style>
