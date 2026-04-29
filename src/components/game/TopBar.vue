<script setup lang="ts">
defineProps<{ username: string | null }>()
defineEmits<{ logout: [] }>()
</script>

<template>
  <header class="topbar">
    <div class="user-chip">
      <div class="avatar" aria-hidden="true">{{ username?.charAt(0).toUpperCase() ?? '?' }}</div>
      <div class="user-text">
        <div class="user-label">Joueur</div>
        <div class="user-name">{{ username ?? 'Anonyme' }}</div>
      </div>
      <button class="logout" title="Déconnexion" aria-label="Déconnexion" @click="$emit('logout')">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="m16 17 5-5-5-5" />
          <path d="M21 12H9" />
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
.user-chip {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 6px 6px 8px;
  background: linear-gradient(180deg, rgba(11, 18, 32, 0.78), rgba(7, 11, 22, 0.88));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top-color: rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  color: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
}
.avatar {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5b8dd9, #2b6cb0);
  font-weight: 700;
  font-size: 14px;
}
.user-text { display: flex; flex-direction: column; line-height: 1.1; }
.user-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.5);
}
.user-name { font-size: 13px; font-weight: 600; }
.logout {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid transparent;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}
.logout:hover {
  background: rgba(220, 38, 38, 0.18);
  border-color: rgba(220, 38, 38, 0.4);
  color: #fca5a5;
}
</style>
