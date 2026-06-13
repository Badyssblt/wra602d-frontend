<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const mode = ref<'login' | 'register'>('login')
const email = ref('')
const pseudonym = ref('')
const password = ref('')
const cityName = ref('')
const formError = ref<string | null>(null)

async function submit(): Promise<void> {
  formError.value = null
  try {
    if (mode.value === 'login') {
      await auth.login(email.value, password.value)
    } else {
      await auth.register(email.value, pseudonym.value, password.value, cityName.value)
    }
  } catch (e) {
    formError.value = e instanceof Error ? e.message : 'Erreur'
  }
}
</script>

<template>
  <div class="screen">
    <div class="left-col">
      <div class="brand-block">
        <div class="brand-label">Jeu de construction</div>
        <h1 class="brand-title">WRA<em>602</em></h1>
        <p class="brand-desc">Placez des batiments, gerez votre budget, grimpez au classement.</p>
      </div>
      <div class="left-foot">
        <div class="foot-stat">
          <span class="foot-num">8</span>
          <span class="foot-unit">types de batiments</span>
        </div>
        <div class="foot-stat">
          <span class="foot-num">&infin;</span>
          <span class="foot-unit">configurations</span>
        </div>
        <div class="foot-stat">
          <span class="foot-num">1</span>
          <span class="foot-unit">objectif : le sommet</span>
        </div>
      </div>
    </div>

    <div class="right-col">
      <div class="form-box">
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

          <div v-if="mode === 'register'" class="field">
            <label>Nom de la ville</label>
            <input v-model="cityName" type="text" required minlength="1" maxlength="80" placeholder="Ma ville" />
          </div>

          <div class="field">
            <label>Mot de passe</label>
            <input v-model="password" type="password" required autocomplete="current-password" placeholder="••••••••" />
          </div>

          <button type="submit" class="submit" :disabled="auth.loading">
            <span v-if="auth.loading" class="spinner"></span>
            <span v-else>{{ mode === 'login' ? 'Jouer' : 'Creer le compte' }} →</span>
          </button>
        </form>

        <p class="switch-note">
          {{ mode === 'login' ? 'Pas de compte ?' : 'Deja inscrit ?' }}
          <a href="#" @click.prevent="mode = mode === 'login' ? 'register' : 'login'; formError = null">
            {{ mode === 'login' ? 'Inscription' : 'Connexion' }}
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.screen {
  position: fixed;
  inset: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}

/* Left column */
.left-col {
  background: #0f0f0f;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px 40px;
}

.brand-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  margin-bottom: 12px;
}

.brand-title {
  font-size: 56px;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: #fff;
  line-height: 1;
}
.brand-title em {
  font-style: normal;
  color: #c0392b;
}

.brand-desc {
  margin-top: 16px;
  font-size: 14px;
  color: rgba(255,255,255,0.35);
  line-height: 1.65;
  max-width: 260px;
}

.left-foot {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.foot-stat {
  display: flex;
  align-items: baseline;
  gap: 10px;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 14px 0;
}

.foot-num {
  font-size: 26px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, monospace;
}

.foot-unit {
  font-size: 12px;
  color: rgba(255,255,255,0.3);
  font-weight: 500;
}

/* Right column */
.right-col {
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.form-box {
  width: min(340px, 100%);
}

/* Toggle */
.mode-toggle {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 24px;
}
.mode-toggle button {
  flex: 1;
  padding: 10px 0;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #aaa;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  margin-bottom: -1px;
  transition: color 0.12s, border-color 0.12s;
}
.mode-toggle button.on {
  color: #111;
  border-bottom-color: #c0392b;
}

/* Form */
.form { display: flex; flex-direction: column; gap: 14px; }

.error-row {
  background: #fff0ee;
  border: 1px solid #c0392b;
  border-left: 3px solid #c0392b;
  color: #c0392b;
  padding: 9px 12px;
  font-size: 12px;
}

.field { display: flex; flex-direction: column; gap: 5px; }
.field label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #888;
}
.field input {
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #e0e0e0;
  color: #111;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.1s;
}
.field input::placeholder { color: #ccc; }
.field input:focus { border-color: #111; }

.submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  margin-top: 4px;
  background: #c0392b;
  border: none;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.1s;
}
.submit:hover:not(:disabled) { background: #a93226; }
.submit:active:not(:disabled) { opacity: 0.85; }
.submit:disabled { opacity: 0.4; cursor: not-allowed; }

.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.switch-note {
  margin-top: 18px;
  font-size: 12px;
  color: #aaa;
  text-align: center;
}
.switch-note a {
  color: #c0392b;
  text-decoration: none;
  margin-left: 4px;
  font-weight: 600;
}
.switch-note a:hover { text-decoration: underline; }

@media (max-width: 600px) {
  .screen { grid-template-columns: 1fr; }
  .left-col { display: none; }
}
</style>
