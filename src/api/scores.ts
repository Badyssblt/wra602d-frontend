import { api } from './client'
import type { ApiScore, HydraCollection, ShareScoreResponse } from './types'

function unwrap<T>(res: HydraCollection<T> | T[]): T[] {
  if (Array.isArray(res)) return res
  return res['hydra:member'] ?? res.member ?? []
}

export const scoresApi = {
  submit(payload: { score: number; moneyFinal: number; population: number; ticksPlayed: number; city?: string }): Promise<ApiScore> {
    return api.post('/api/scores', payload)
  },

  async mine(): Promise<ApiScore[]> {
    const res = await api.get<HydraCollection<ApiScore> | ApiScore[]>('/api/scores')
    return unwrap(res)
  },

  async leaderboard(): Promise<ApiScore[]> {
    const res = await api.get<HydraCollection<ApiScore> | ApiScore[]>('/api/scores/leaderboard', { auth: false })
    return unwrap(res)
  },

  share(uid: string): Promise<ShareScoreResponse> {
    return api.post(`/api/scores/${uid}/share`, {}, { contentType: 'application/json' })
  },
}
