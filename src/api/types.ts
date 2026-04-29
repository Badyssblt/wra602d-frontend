import type { BuildingType } from '../types'

export interface AuthUser {
  uid: string
  email: string
  pseudonym: string
  roles: string[]
  createdAt: string
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
