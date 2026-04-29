<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { BuildingType } from '../../types'
import { useGame } from '../../composables/useGame'
import { useCityPersistence } from '../../composables/useCityPersistence'
import { useScoreSubmission } from '../../composables/useScoreSubmission'
import { useAuthStore } from '../../stores/auth'
import LeaderboardPanel from '../LeaderboardPanel.vue'
import TopBar from './TopBar.vue'
import HUD from './HUD.vue'
import DemandPanel from './DemandPanel.vue'
import ShareBanner from './ShareBanner.vue'
import LoadCityDialog from './LoadCityDialog.vue'
import Hint from './Hint.vue'

const auth = useAuthStore()
const selectedType = ref<BuildingType>('house')
const showLeaderboard = ref(false)
const showLoadDialog = ref(false)

const { canvasRef, money, population, score, ticksPlayed, demand, rates, cityName, start, newGame, loadCity, snapshot } =
  useGame(selectedType)

const persistence = useCityPersistence({
  takeSnapshot: snapshot,
  applySnapshot: loadCity,
})

const scoring = useScoreSubmission({
  score: () => score.value,
  money: () => money.value,
  population: () => population.value,
  ticksPlayed: () => ticksPlayed.value,
})

const busy = computed(() => persistence.busy.value || scoring.busy.value)

onMounted(() => start())

function handleNew(): void {
  if (!confirm('Démarrer une nouvelle partie ? La progression non sauvegardée sera perdue.')) return
  newGame()
  scoring.dismissShareUrl()
}

async function handleLoadOpen(): Promise<void> {
  await persistence.fetchList()
  showLoadDialog.value = true
}

async function handleLoad(uid: string): Promise<void> {
  await persistence.load(uid)
  showLoadDialog.value = false
}
</script>

<template>
  <div class="game-view">
    <canvas ref="canvasRef" class="viewport" />

    <TopBar :username="auth.user?.pseudonym ?? null" @logout="auth.logout()" />

    <Hint message="Clic pour poser · Clic droit + drag pour orbiter · Scroll pour zoomer" />

    <DemandPanel :demand="demand" />

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
      :busy="busy"
      @update:city-name="cityName = $event"
      @select="selectedType = $event"
      @new="handleNew"
      @save="persistence.save()"
      @load="handleLoadOpen"
      @submit="scoring.submit()"
      @toggle-leaderboard="showLeaderboard = !showLeaderboard"
    />

    <ShareBanner
      v-if="scoring.lastShareUrl.value"
      :url="scoring.lastShareUrl.value"
      @copy="scoring.copyShareUrl()"
      @dismiss="scoring.dismissShareUrl()"
    />

    <LoadCityDialog
      v-if="showLoadDialog"
      :cities="persistence.myCities.value"
      :busy="busy"
      @load="handleLoad"
      @close="showLoadDialog = false"
    />

    <LeaderboardPanel :open="showLeaderboard" @close="showLeaderboard = false" />
  </div>
</template>

<style scoped>
.game-view { position: relative; width: 100vw; height: 100vh; overflow: hidden; }
.viewport { display: block; width: 100%; height: 100%; }
</style>
