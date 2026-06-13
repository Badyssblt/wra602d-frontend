<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { current } = useToast()
</script>

<template>
  <Transition name="fade">
    <div v-if="current" class="toast" :class="`toast-${current.kind}`">{{ current.message }}</div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 14px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  letter-spacing: 0.02em;
  z-index: 200;
  white-space: nowrap;
  border: 1px solid rgba(255,255,255,0.15);
}
.toast-info    { background: #1d4ed8; }
.toast-success { background: #166534; }
.toast-error   { background: #c0392b; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
