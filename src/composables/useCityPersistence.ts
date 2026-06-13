import { ref } from 'vue'
import { citiesApi } from '../api/cities'
import type { ApiCity } from '../api/types'
import type { CitySnapshot } from './useGame'
import { useAuthStore } from '../stores/auth'
import { useToast } from './useToast'

/**
 * Wraps the cities API for the UI: my cities list, save/load with toasts and busy state.
 */
export function useCityPersistence(opts: {
  takeSnapshot: () => CitySnapshot
  applySnapshot: (city: CitySnapshot) => void
}) {
  const { notify } = useToast()
  const auth = useAuthStore()
  const myCities = ref<ApiCity[]>([])
  const busy = ref(false)

  async function save(): Promise<void> {
    if (busy.value) return
    busy.value = true
    try {
      const saved = await citiesApi.save(opts.takeSnapshot())
      notify(`Ville "${saved.name}" sauvegardée`, 'success')
      // Save crédite l'XP côté serveur (delta high-water mark) — on rafraîchit
      // pour que le HUD reflète l'éventuelle montée de niveau / unlock.
      void auth.refresh()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Erreur sauvegarde', 'error')
    } finally {
      busy.value = false
    }
  }

  async function fetchList(): Promise<void> {
    busy.value = true
    try {
      myCities.value = await citiesApi.list()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Erreur chargement', 'error')
    } finally {
      busy.value = false
    }
  }

  async function load(uid: string): Promise<void> {
    busy.value = true
    try {
      const c = await citiesApi.get(uid)
      opts.applySnapshot({
        uid: c.uid,
        name: c.name,
        money: c.money,
        gridSize: c.gridSize,
        buildings: c.buildings ?? [],
        unlockedTiles: c.unlockedTiles ?? [],
        score: c.score ?? 0,
        population: c.population ?? 0,
        ticksPlayed: c.ticksPlayed ?? 0,
      })
      notify(`Ville "${c.name}" chargee`, 'success')
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Erreur chargement', 'error')
    } finally {
      busy.value = false
    }
  }

  async function autoLoad(): Promise<void> {
    busy.value = true
    try {
      const cities = await citiesApi.list()
      const c = cities[0]
      if (c) {
        opts.applySnapshot({
          uid: c.uid,
          name: c.name,
          money: c.money,
          gridSize: c.gridSize,
          buildings: c.buildings ?? [],
          unlockedTiles: c.unlockedTiles ?? [],
          score: c.score ?? 0,
          population: c.population ?? 0,
          ticksPlayed: c.ticksPlayed ?? 0,
        })
      }
    } catch {
      // Silent — if fetch fails the player just starts from a fresh local state
    } finally {
      busy.value = false
    }
  }

  return { myCities, busy, save, fetchList, load, autoLoad }
}
