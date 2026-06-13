<script setup lang="ts">
defineProps<{ username: string | null }>()
defineEmits<{ logout: [] }>()
</script>

<template>
  <header class="topbar">
    <div class="chip">
      <div class="avatar">{{ username?.charAt(0).toUpperCase() ?? '?' }}</div>
      <div class="user-text">
        <div class="user-label">Joueur</div>
        <div class="user-name">{{ username ?? 'Anonyme' }}</div>
      </div>
      <button class="logout" title="Deconnexion" aria-label="Deconnexion" @click="$emit('logout')">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <path d="m16 17 5-5-5-5"/>
          <path d="M21 12H9"/>
        </svg>
      </button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 50;
  pointer-events: none;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
.chip {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 5px 5px 8px;
  background: #0f0f0f;
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
}
.avatar {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  background: #c0392b;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
  font-family: ui-monospace, monospace;
}
.user-text { display: flex; flex-direction: column; line-height: 1.1; }
.user-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255,255,255,0.4);
  font-weight: 700;
}
.user-name { font-size: 12px; font-weight: 600; }
.logout {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid transparent;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: background 0.1s, color 0.1s, border-color 0.1s;
}
.logout:hover {
  background: rgba(192,57,43,0.15);
  border-color: rgba(192,57,43,0.4);
  color: #f87171;
}
</style>
