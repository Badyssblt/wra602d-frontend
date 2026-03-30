<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { SceneManager } from './core/SceneManager'
import { InputManager } from './core/InputManager'
import { Grid } from './game/Grid'
import { BuildingPlacer } from './game/BuildingPlacer'
import { GridMesh } from './objects/GridMesh'
import { createBuildingMesh } from './objects/BuildingMesh'
import type { BuildingType } from './types'
import { MoneyManager } from './core/MoneyManager'
import { BUILDING_CONFIG } from './game/BuildingConfig'
import { IncomeSystem } from './game/IncomeSystem'

const GRID_SIZE = 12

const canvasRef = ref<HTMLCanvasElement | null>(null)
const selectedType = ref<BuildingType>('house')

const TOOLBAR_ITEMS: { type: BuildingType; label: string; color: string }[] = [
  { type: 'house',  label: 'Maison',  color: '#e8864a' },
  { type: 'office', label: 'Bureau',  color: '#5b8dd9' },
  { type: 'park',   label: 'Parc',    color: '#4caf50' },
  { type: 'road',   label: 'Route',   color: '#888888' },
]

let scene: SceneManager
let input: InputManager
let grid: Grid
let placer: BuildingPlacer
let gridMesh: GridMesh
let moneyManager: MoneyManager
let incomeSystem: IncomeSystem

let onResize: () => void


/** GAME STATE */

const money = ref(100000)


function onCellClick(mouse: THREE.Vector2): void {
  const coords = placer.getHoveredCell(mouse, scene.camera, GRID_SIZE)
  if (!coords) return

  const config = BUILDING_CONFIG[selectedType.value]
  if (!moneyManager.canBuy(config.price)) return

  const placed = grid.place(coords, selectedType.value)
  if (!placed) return

  moneyManager.removeMoney(config.price)

  const half = GRID_SIZE / 2
  const building = createBuildingMesh(selectedType.value)
  building.position.set(coords.x - half + 0.5, 0, coords.z - half + 0.5)
  scene.scene.add(building)
}

onMounted(() => {
  const canvas = canvasRef.value!

  scene   = new SceneManager(canvas)
  grid    = new Grid(GRID_SIZE)
  placer  = new BuildingPlacer()
  gridMesh = new GridMesh(GRID_SIZE)
  input   = new InputManager(canvas, onCellClick)
  moneyManager = new MoneyManager(money)
  incomeSystem = new IncomeSystem(grid, moneyManager)

  scene.scene.add(gridMesh.object)

  scene.start((delta) => {
    gridMesh.setHighlight(placer.getHoveredCell(input.mouse, scene.camera, GRID_SIZE))
    incomeSystem.tick(delta)
  })

  onResize = () => scene.resize(window.innerWidth, window.innerHeight)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  scene?.dispose()
  input?.dispose()
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <div class="city-builder">
    <canvas ref="canvasRef" class="viewport" />

    <div class="toolbar">
      <button
        v-for="item in TOOLBAR_ITEMS"
        :key="item.type"
        class="toolbar-btn"
        :class="{ active: selectedType === item.type }"
        :style="{ '--accent': item.color }"
        @click="selectedType = item.type"
      >
        <span class="btn-dot" />
        {{ item.label }}
      </button>
    </div>

    <div class="hint">Clic pour poser · Clic droit + drag pour orbiter · Scroll pour zoomer</div>

    <div class="hud">
      <p>{{  money  }} €</p>
    </div>
  </div>
</template>

<style scoped>
.hud  {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 36px;
}

.city-builder {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.viewport {
  display: block;
  width: 100%;
  height: 100%;
}

/* --- Toolbar --- */

.toolbar {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 2px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.12s,
    border-color 0.12s,
    color 0.12s;
}

.toolbar-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.toolbar-btn.active {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent);
  color: white;
}

.btn-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
}

/* --- Hint --- */

.hint {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 14px;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  pointer-events: none;
  white-space: nowrap;
}
</style>
