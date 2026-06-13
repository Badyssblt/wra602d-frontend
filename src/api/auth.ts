import { api } from './client'
import type { AuthUser, LoginResponse } from './types'

export const authApi = {
  register(payload: { email: string; pseudonym: string; password: string; cityName: string }): Promise<AuthUser> {
    return api.post('/api/users/register', payload, { auth: false, contentType: 'application/json' })
  },

  login(payload: { email: string; password: string }): Promise<LoginResponse> {
    return api.post('/api/login_check', payload, { auth: false, contentType: 'application/json' })
  },

  me(): Promise<AuthUser> {
    return api.get('/api/users/me')
  },

  prestige(): Promise<{ prestigeLevel: number; xp: number; level: number; multiplier: number }> {
    return api.post('/api/users/me/prestige', {}, { contentType: 'application/json' })
  },
}
