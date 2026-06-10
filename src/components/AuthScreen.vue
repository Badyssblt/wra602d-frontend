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
    <!-- Top-down city grid background -->
    <div class="city-map" aria-hidden="true">
      <div v-for="i in 120" :key="i" class="block" :data-i="i"></div>
    </div>

    <div class="panel">
      <!-- Left: branding + tagline -->
      <div class="brand-col">
        <div class="brand-logo">🏙️</div>
        <h1 class="brand-title">WRA<em>602</em></h1>
        <p class="brand-tagline">Construisez, planifiez,<br>dominez le classement.</p>

        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-num">∞</span>
            <span class="stat-label">Villes</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">8</span>
            <span class="stat-label">Bâtiments</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">★</span>
            <span class="stat-label">Prestige</span>
          </div>
        </div>
      </div>

      <!-- Right: form -->
      <div class="form-col">
        <div class="mode-toggle">
          <button :class="{ on: mode === 'login' }" @click.prevent="mode = 'login'; formError = null">
            Connexion
          </button>
          <button :class="{ on: mode === 'register' }" @click.prevent="mode = 'register'; formError = null">
            Inscription
          </button>
        </div>

        <form class="form" @submit.prevent="submit">
          <div v-if="formError" class="error-row">
            {{ formError }}
          </div>

          <div class="field">
            <label>Email</label>
            <input v-model="email" type="email" required autocomplete="email" placeholder="vous@exemple.com" />
          </div>

          <div v-if="mode === 'register'" class="field">
            <label>Pseudonyme</label>
            <input v-model="pseudonym" type="text" required minlength="3" maxlength="30" pattern="[A-Za-z0-9_-]{3,30}" placeholder="MonPseudo" />
          </div>

          <div class="field">
            <label>Mot de passe</label>
            <input v-model="password" type="password" required autocomplete="current-password" placeholder="••••••••" />
          </div>

          <button type="submit" class="submit" :disabled="auth.loading">
            <span v-if="auth.loading" class="spinner"></span>
            <span v-else>{{ mode === 'login' ? 'Jouer →' : 'Créer le compte →' }}</span>
          </button>
        </form>

        <p class="switch-note">
          {{ mode === 'login' ? 'Pas de compte ?' : 'Déjà inscrit ?' }}
          <a href="#" @click.prevent="mode = mode === 'login' ? 'register' : 'login'; formError = null">
            {{ mode === 'login' ? 'Inscription' : 'Connexion' }}
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Screen ── */
.screen {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: #0c2d22;
  overflow: hidden;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}

/* ── City map grid background ── */
.city-map {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(10, 1fr);
  gap: 4px;
  padding: 4px;
  pointer-events: none;
}
.block {
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.025);
  animation: flicker 8s ease-in-out infinite;
}
/* Vary animation delay per block for organic feel */
.block:nth-child(3n)   { animation-delay: 0s;   background: rgba(255,255,255,0.04); }
.block:nth-child(5n)   { animation-delay: 1.3s; background: rgba(251,191,36,0.06); }
.block:nth-child(7n)   { animation-delay: 2.7s; background: rgba(255,255,255,0.015); }
.block:nth-child(11n)  { animation-delay: 0.6s; background: rgba(251,191,36,0.04); }
.block:nth-child(13n)  { animation-delay: 3.4s; }
.block:nth-child(2n+1) { animation-delay: 1.8s; }

@keyframes flicker {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

/* Overlay gradient so panel is readable */
.screen::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 70% 70% at 50% 50%, rgba(12,45,34,0.55) 0%, rgba(12,45,34,0.85) 100%);
  pointer-events: none;
}

/* ── Panel ── */
.panel {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: min(760px, 94vw);
  background: rgba(10, 25, 18, 0.70);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
}

/* ── Brand col ── */
.brand-col {
  padding: 40px 36px;
  background: rgba(0,0,0,0.2);
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  color: white;
}
.brand-logo { font-size: 40px; line-height: 1; }
.brand-title {
  font-size: 46px;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: #faf8f3;
  line-height: 1;
}
.brand-title em { font-style: normal; color: #fbbf24; }
.brand-tagline {
  font-size: 14px;
  color: rgba(255,255,255,0.45);
  line-height: 1.6;
  font-weight: 400;
}
.stats-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
}
.stat-item { display: flex; flex-direction: column; gap: 2px; }
.stat-num {
  font-size: 20px;
  font-weight: 800;
  color: #fbbf24;
  line-height: 1;
}
.stat-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.3);
  font-weight: 600;
}
.stat-divider { width: 1px; height: 30px; background: rgba(255,255,255,0.1); }

/* ── Form col ── */
.form-col {
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0;
}

.mode-toggle {
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.mode-toggle button {
  flex: 1;
  padding: 8px 0;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: rgba(255,255,255,0.35);
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  letter-spacing: 0.02em;
  margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;
}
.mode-toggle button.on {
  color: #fbbf24;
  border-bottom-color: #fbbf24;
}

.form { display: flex; flex-direction: column; gap: 14px; }

.error-row {
  background: rgba(185,28,28,0.12);
  border: 1px solid rgba(239,68,68,0.3);
  border-left: 3px solid #ef4444;
  color: #fca5a5;
  border-radius: 5px;
  padding: 9px 12px;
  font-size: 12px;
}

.field { display: flex; flex-direction: column; gap: 5px; }
.field label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
}
.field input {
  padding: 10px 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 5px;
  color: #faf8f3;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.12s, box-shadow 0.12s;
}
.field input::placeholder { color: rgba(255,255,255,0.18); }
.field input:focus {
  border-color: rgba(251,191,36,0.5);
  box-shadow: 0 0 0 3px rgba(251,191,36,0.08);
}

.submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 11px;
  margin-top: 4px;
  background: #d97706;
  border: none;
  border-radius: 5px;
  color: #1c1917;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: background 0.12s;
}
.submit:hover:not(:disabled) { background: #fbbf24; }
.submit:active:not(:disabled) { transform: scale(0.99); }
.submit:disabled { opacity: 0.4; cursor: not-allowed; }

.spinner {
  width: 15px; height: 15px;
  border: 2px solid rgba(28,25,23,0.3);
  border-top-color: #1c1917;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.switch-note {
  margin-top: 16px;
  font-size: 12px;
  color: rgba(255,255,255,0.3);
  text-align: center;
}
.switch-note a { color: #fbbf24; text-decoration: none; margin-left: 4px; font-weight: 600; }
.switch-note a:hover { text-decoration: underline; }

@media (max-width: 580px) {
  .panel { grid-template-columns: 1fr; }
  .brand-col { display: none; }
}
</style>
