import { ref } from 'vue'
import { citiesApi } from '../api/cities'
import type { ApiCity } from '../api/types'
import type { CitySnapshot } from './useGame'
import { useToast } from './useToast'

/**
 * Wraps the cities API for the UI: my cities list, save/load with toasts and busy state.
 */
export function useCityPersistence(opts: {
  takeSnapshot: () => CitySnapshot
  applySnapshot: (city: CitySnapshot) => void
}) {
  const { notify } = useToast()
  const myCities = ref<ApiCity[]>([])
  const busy = ref(false)

  async function save(): Promise<void> {
    if (busy.value) return
    busy.value = true
    try {
      const saved = await citiesApi.save(opts.takeSnapshot())
      notify(`Ville "${saved.name}" sauvegardée`, 'success')
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
      })
      notify(`Ville "${c.name}" chargée`, 'success')
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Erreur chargement', 'error')
    } finally {
      busy.value = false
    }
  }

  return { myCities, busy, save, fetchList, load }
}
