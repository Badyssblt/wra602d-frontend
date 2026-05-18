<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { BuildingType } from '../../types'
import { useGame } from '../../composables/useGame'
import { useCityPersistence } from '../../composables/useCityPersistence'
import { useAuthStore } from '../../stores/auth'
import LeaderboardPanel from '../LeaderboardPanel.vue'
import TopBar from './TopBar.vue'
import HUD from './HUD.vue'
import DemandPanel from './DemandPanel.vue'
import LoadCityDialog from './LoadCityDialog.vue'
import Hint from './Hint.vue'
import WaveBanner from './WaveBanner.vue'
import GameOverOverlay from './GameOverOverlay.vue'
import QuestPanel from './QuestPanel.vue'
import { authApi } from '../../api/auth'
import { citiesApi } from '../../api/cities'
import { useToast } from '../../composables/useToast'

const auth = useAuthStore()
const selectedType = ref<BuildingType>('house')
const showLeaderboard = ref(false)
const showQuests = ref(false)
const showLoadDialog = ref(false)

const playerLevel = computed(() => auth.user?.level ?? 0)
const playerXp = computed(() => auth.user?.xp ?? 0)
const xpForNextLevel = computed(() => auth.user?.xpForNextLevel ?? null)
const prestigeLevel = computed(() => auth.user?.prestigeLevel ?? 0)

const {
  canvasRef, money, population, score, demand, rates, prices,
  pendingWave, defeated, cityUid, cityName, start, newGame, loadCity, snapshot,
} = useGame(selectedType)

const persistence = useCityPersistence({
  takeSnapshot: snapshot,
  applySnapshot: loadCity,
})

const busy = computed(() => persistence.busy.value)

const { notify } = useToast()

onMounted(() => start())

/**
 * "Nouvelle partie" in the 1-city-per-account model:
 *  - confirm,
 *  - DELETE the current city on the server (404-safe — first run has no server city yet),
 *  - reset the local state.
 */
async function handleNew(): Promise<void> {
  if (!confirm('Supprimer la partie en cours et en démarrer une nouvelle ? Cette action est définitive.')) return
  try {
    await citiesApi.remove(cityUid.value)
  } catch {
    /* No server city yet (404) — that's fine. */
  }
  newGame()
}

async function handleLoadOpen(): Promise<void> {
  await persistence.fetchList()
  showLoadDialog.value = true
}

async function handleLoad(uid: string): Promise<void> {
  await persistence.load(uid)
  showLoadDialog.value = false
}

async function handlePrestige(): Promise<void> {
  if (!confirm('Prestiger réinitialisera votre niveau à 0 en échange d’un bonus permanent de +10 % sur les scores et l’XP des quêtes. Continuer ?')) {
    return
  }
  try {
    const result = await authApi.prestige()
    notify(`Prestige ${result.prestigeLevel} — multiplicateur ×${result.multiplier.toFixed(2)}`, 'success')
    await auth.refresh()
  } catch (e) {
    notify(e instanceof Error ? e.message : 'Échec du prestige', 'error')
  }
}
</script>

<template>
  <div class="game-view">
    <canvas ref="canvasRef" class="viewport" />

    <TopBar :username="auth.user?.pseudonym ?? null" @logout="auth.logout()" />

    <Hint message="Clic pour poser · Clic sur un incident pour réparer · Sauvegarder envoie le score" />

    <DemandPanel :demand="demand" />

    <WaveBanner v-if="pendingWave && !defeated" :wave="pendingWave" />

    <HUD
      :city-name="cityName"
      :username="auth.user?.pseudonym ?? null"
      :money="money"
      :population="population"
      :score="score"
      :net-per-hour="rates.netPerHour"
      :gross-per-hour="rates.grossPerHour"
      :maintenance-per-hour="rates.maintenancePerHour"
      :selected-type="selectedType"
      :prices="prices"
      :player-level="playerLevel"
      :player-xp="playerXp"
      :xp-for-next-level="xpForNextLevel"
      :prestige-level="prestigeLevel"
      :busy="busy"
      @update:city-name="cityName = $event"
      @select="selectedType = $event"
      @new="handleNew"
      @save="persistence.save()"
      @load="handleLoadOpen"
      @toggle-leaderboard="showLeaderboard = !showLeaderboard"
      @toggle-quests="showQuests = !showQuests"
      @prestige="handlePrestige"
    />

    <LoadCityDialog
      v-if="showLoadDialog"
      :cities="persistence.myCities.value"
      :busy="busy"
      @load="handleLoad"
      @close="showLoadDialog = false"
    />

    <LeaderboardPanel :open="showLeaderboard" @close="showLeaderboard = false" />

    <QuestPanel :open="showQuests" @close="showQuests = false" />

    <GameOverOverlay
      v-if="defeated"
      :score="score"
      :population="population"
      :money="money"
      :busy="busy"
      @save="persistence.save()"
      @restart="handleNew"
    />
  </div>
</template>

<style scoped>
.game-view { position: relative; width: 100vw; height: 100vh; overflow: hidden; }
.viewport { display: block; width: 100%; height: 100%; }
</style>
