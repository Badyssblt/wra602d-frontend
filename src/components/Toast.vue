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
  position: fixed; top: 70px; left: 50%; transform: translateX(-50%);
  padding: 10px 16px; border-radius: 8px; color: white; font-size: 14px;
  z-index: 110; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.toast-info { background: #2b6cb0; }
.toast-success { background: #059669; }
.toast-error { background: #dc2626; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
