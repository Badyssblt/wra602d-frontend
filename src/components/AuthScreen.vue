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
  <div class="auth-screen">
    <form class="auth-form" @submit.prevent="submit">
      <h1>WRA602 City Builder</h1>
      <p class="subtitle">{{ mode === 'login' ? 'Connexion' : 'Créer un compte' }}</p>

      <label>
        Email
        <input v-model="email" type="email" required autocomplete="email" />
      </label>

      <label v-if="mode === 'register'">
        Pseudonyme
        <input v-model="pseudonym" type="text" required minlength="3" maxlength="30" pattern="[A-Za-z0-9_-]{3,30}" />
        <small>3 à 30 caractères, alphanumérique / _ / -</small>
      </label>

      <label>
        Mot de passe
        <input v-model="password" type="password" required minlength="8" autocomplete="current-password" />
        <small v-if="mode === 'register'">8 caractères min, 1 majuscule, 1 chiffre</small>
      </label>

      <p v-if="formError" class="err">{{ formError }}</p>

      <button type="submit" :disabled="auth.loading">
        {{ auth.loading ? '…' : mode === 'login' ? 'Se connecter' : "S'inscrire" }}
      </button>

      <p class="switch">
        {{ mode === 'login' ? 'Pas encore de compte ?' : 'Déjà inscrit ?' }}
        <a href="#" @click.prevent="mode = mode === 'login' ? 'register' : 'login'">
          {{ mode === 'login' ? 'Créer un compte' : 'Se connecter' }}
        </a>
      </p>
    </form>
  </div>
</template>

<style scoped>
.auth-screen {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #1e293b, #2b6cb0);
  color: white;
  font-family: system-ui, sans-serif;
}
.auth-form {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  padding: 36px;
  border-radius: 16px;
  width: min(380px, 90vw);
  display: flex;
  flex-direction: column;
  gap: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}
h1 { margin: 0; font-size: 22px; }
.subtitle { margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 14px; }
label { display: flex; flex-direction: column; font-size: 13px; gap: 4px; }
input {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: white;
  padding: 10px 12px;
  border-radius: 6px;
  font: inherit;
}
input:focus { outline: 2px solid #5b8dd9; outline-offset: -1px; }
small { color: rgba(255, 255, 255, 0.5); font-size: 11px; }
button {
  margin-top: 6px;
  padding: 10px;
  background: #2b6cb0;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}
button:hover:not(:disabled) { background: #3b82f6; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
.err { background: #7f1d1d; padding: 8px 10px; border-radius: 6px; font-size: 13px; margin: 0; }
.switch { font-size: 13px; text-align: center; color: rgba(255, 255, 255, 0.7); margin: 4px 0 0; }
.switch a { color: #93c5fd; text-decoration: none; }
.switch a:hover { text-decoration: underline; }
</style>
