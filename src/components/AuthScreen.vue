<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const mode = ref<'login' | 'register'>('login')
const email = ref('')
const pseudonym = ref('')
const password = ref('')
const formError = ref<string | null>(null)

async function submit(): Promise<void> {
  formError.value = null
  try {
    if (mode.value === 'login') {
      await auth.login(email.value, password.value)
    } else {
      await auth.register(email.value, pseudonym.value, password.value)
    }
  } catch (e) {
    formError.value = e instanceof Error ? e.message : 'Erreur'
  }
}
</script>

<template>
  <div class="screen">
    <div class="bg-grid"></div>
    <div class="glow glow-1"></div>
    <div class="glow glow-2"></div>

    <div class="card">
      <div class="brand">
        <div class="brand-icon">🏙️</div>
        <div class="brand-text">
          <div class="brand-name">WRA602</div>
          <div class="brand-sub">City Builder</div>
        </div>
      </div>

      <div class="tabs">
        <button :class="{ active: mode === 'login' }" @click.prevent="mode = 'login'; formError = null">
          Connexion
        </button>
        <button :class="{ active: mode === 'register' }" @click.prevent="mode = 'register'; formError = null">
          Inscription
        </button>
        <div class="tab-indicator" :class="{ right: mode === 'register' }"></div>
      </div>

      <form class="form" @submit.prevent="submit">
        <div v-if="formError" class="error-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ formError }}
        </div>

        <div class="field">
          <label>Email</label>
          <input v-model="email" type="email" required autocomplete="email" placeholder="vous@exemple.com" />
        </div>

        <div v-if="mode === 'register'" class="field">
          <label>Pseudonyme</label>
          <input v-model="pseudonym" type="text" required minlength="3" maxlength="30" pattern="[A-Za-z0-9_-]{3,30}" placeholder="MonPseudo" />
          <span class="hint">3–30 caractères, alphanumérique / _ / -</span>
        </div>

        <div class="field">
          <label>Mot de passe</label>
          <input v-model="password" type="password" required autocomplete="current-password" placeholder="••••••••" />
        </div>

        <button type="submit" class="submit-btn" :disabled="auth.loading">
          <span v-if="auth.loading" class="spinner"></span>
          <span v-else>{{ mode === 'login' ? 'Se connecter' : "Créer le compte" }}</span>
          <svg v-if="!auth.loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 14 0"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </form>

      <div class="footer-note">
        {{ mode === 'login' ? 'Pas encore de compte ?' : 'Déjà inscrit ?' }}
        <a href="#" @click.prevent="mode = mode === 'login' ? 'register' : 'login'; formError = null">
          {{ mode === 'login' ? 'Créer un compte' : 'Se connecter' }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.screen {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: #060d1a;
  overflow: hidden;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}

/* Animated grid background */
.bg-grid {
  position: absolute;
  inset: -50%;
  background-image:
    linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  animation: grid-drift 20s linear infinite;
  pointer-events: none;
}
@keyframes grid-drift {
  from { transform: translate(0, 0); }
  to   { transform: translate(48px, 48px); }
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  animation: pulse-glow 6s ease-in-out infinite alternate;
}
.glow-1 {
  width: 500px; height: 500px;
  background: rgba(59, 130, 246, 0.12);
  top: -150px; left: -100px;
}
.glow-2 {
  width: 400px; height: 400px;
  background: rgba(99, 102, 241, 0.10);
  bottom: -100px; right: -80px;
  animation-delay: 3s;
}
@keyframes pulse-glow {
  from { opacity: 0.6; transform: scale(1); }
  to   { opacity: 1;   transform: scale(1.15); }
}

/* Card */
.card {
  position: relative;
  width: min(420px, 92vw);
  background: rgba(10, 16, 30, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 20px;
  padding: 32px 28px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.08);
  color: white;
}

/* Brand */
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}
.brand-icon {
  width: 46px; height: 46px;
  border-radius: 13px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  display: grid;
  place-items: center;
  font-size: 24px;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
}
.brand-name {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #f8fafc;
}
.brand-sub {
  font-size: 11px;
  color: #475569;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-top: 1px;
}

/* Tabs */
.tabs {
  position: relative;
  display: flex;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 24px;
}
.tabs button {
  flex: 1;
  padding: 8px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.45);
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  position: relative;
  z-index: 1;
  transition: color 0.2s;
  border-radius: 7px;
}
.tabs button.active { color: white; }
.tab-indicator {
  position: absolute;
  top: 4px; left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 7px;
  transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.tab-indicator.right { transform: translateX(calc(100% + 0px)); }

/* Form */
.form { display: flex; flex-direction: column; gap: 16px; }

.error-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
}

.field { display: flex; flex-direction: column; gap: 6px; }
.field label {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.04em;
}
.field input {
  padding: 11px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 9px;
  color: white;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
}
.field input::placeholder { color: #1e3a5f; }
.field input:focus {
  border-color: rgba(59, 130, 246, 0.6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  background: rgba(255, 255, 255, 0.07);
}
.hint {
  font-size: 11px;
  color: #475569;
}

/* Submit */
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 15px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
  margin-top: 4px;
}
.submit-btn:hover:not(:disabled) {
  opacity: 0.92;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45);
}
.submit-btn:active:not(:disabled) { transform: scale(0.98); }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Footer note */
.footer-note {
  margin-top: 20px;
  font-size: 13px;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
}
.footer-note a {
  color: #60a5fa;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
}
.footer-note a:hover { text-decoration: underline; }
</style>
