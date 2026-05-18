import { api } from './client'

export type QuestKind = 'daily' | 'weekly'
export type QuestMetric = 'score' | 'population' | 'ticks'

export interface Quest {
  code: string
  label: string
  kind: QuestKind
  metric: QuestMetric
  target: number
  xpReward: number
  /** Player's best progress on this metric in the relevant period. */
  progress: number
  /** True once progress ≥ target — claim is allowed. */
  completed: boolean
  /** True once the player has already claimed this quest for the current period. */
  claimed: boolean
}

export interface ClaimResult {
  code: string
  xpAwarded: number
  totalXp: number
  level: number
}

export const questsApi = {
  async list(): Promise<Quest[]> {
    const res = await api.get<{ quests: Quest[] }>('/api/quests')
    return res.quests
  },

  claim(code: string): Promise<ClaimResult> {
    return api.post(`/api/quests/${code}/claim`, {}, { contentType: 'application/json' })
  },
}
