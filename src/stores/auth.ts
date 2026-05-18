import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/auth'
import { tokenStorage } from '../api/client'
import type { AuthUser } from '../api/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => user.value !== null)

  async function bootstrap(): Promise<void> {
    if (!tokenStorage.get()) return
    loading.value = true
    try {
      user.value = await authApi.me()
    } catch {
      tokenStorage.clear()
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const { token } = await authApi.login({ email, password })
      tokenStorage.set(token)
      user.value = await authApi.me()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Échec de connexion'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function register(email: string, pseudonym: string, password: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await authApi.register({ email, pseudonym, password })
      await login(email, password)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Échec d’inscription'
      throw e
    } finally {
      loading.value = false
    }
  }

  function logout(): void {
    tokenStorage.clear()
    user.value = null
  }

  /**
   * Re-fetches the current user profile (xp, level, unlocks).
   * Called after score submission so the HUD reflects new progression
   * without forcing a full page reload.
   */
  async function refresh(): Promise<void> {
    if (!tokenStorage.get()) return
    try {
      user.value = await authApi.me()
    } catch {
      // Stale token / network blip — silent. Existing user state stays.
    }
  }

  return { user, loading, error, isAuthenticated, bootstrap, login, register, logout, refresh }
})
