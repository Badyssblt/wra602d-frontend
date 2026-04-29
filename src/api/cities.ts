import { api } from './client'
import type { ApiCity, HydraCollection } from './types'

function unwrap<T>(res: HydraCollection<T> | T[]): T[] {
  if (Array.isArray(res)) return res
  return res['hydra:member'] ?? res.member ?? []
}

export const citiesApi = {
  async list(): Promise<ApiCity[]> {
    const res = await api.get<HydraCollection<ApiCity> | ApiCity[]>('/api/cities')
    return unwrap(res)
  },

  get(uid: string): Promise<ApiCity> {
    return api.get(`/api/cities/${uid}`)
  },

  save(payload: ApiCity): Promise<ApiCity> {
    return api.post('/api/cities/save', payload)
  },
}
