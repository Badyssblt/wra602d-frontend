export type BuildingType =
  | 'house'
  | 'office'
  | 'industry'
  | 'park'
  | 'road'
  | 'university'
  | 'powerplant'
  | 'port'

export type DemandZone = 'residential' | 'commercial' | 'industrial'

export interface GridCoords {
  x: number
  z: number
}
