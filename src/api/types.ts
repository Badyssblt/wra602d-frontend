import type { BuildingType } from '../types'

export interface AuthUser {
  uid: string
  email: string
  pseudonym: string
  roles: string[]
  createdAt: string
  /** Cumulative XP earned across all scores submitted. */
  xp?: number
  /** Current level derived from xp via the server-side policy. */
  level?: number
  /** XP threshold for the next level; null when MAX_LEVEL is reached. */
  xpForNextLevel?: number | null
  /** Number of times the player has prestiged (resets level, keeps multiplier). */
  prestigeLevel?: number
  /** Building types the player can place (gated on level). */
  unlockedBuildings?: BuildingType[]
}

export interface LoginResponse {
  token: string
}

export interface ApiBuilding {
  type: BuildingType
  posX: number
  posZ: number
}

export interface ApiTileCoords {
  tx: number
  tz: number
}

export interface ApiCity {
  uid: string
  name: string
  money: number
  gridSize: number
  buildings: ApiBuilding[]
  unlockedTiles?: ApiTileCoords[]
  /** Snapshot of the player-side score at the latest save. */
  score?: number
  population?: number
  ticksPlayed?: number
  createdAt?: string
  updatedAt?: string
}

export interface ApiScore {
  uid: string
  user: { uid: string; pseudonym: string }
  score: number
  population: number
  moneyFinal?: number
  ticksPlayed?: number
  createdAt: string
  shareToken?: string | null
}

export interface ShareScoreResponse {
  shareToken: string
  shareUrl: string
}

export interface HydraCollection<T> {
  'hydra:member'?: T[]
  member?: T[]
  'hydra:totalItems'?: number
  totalItems?: number
}
