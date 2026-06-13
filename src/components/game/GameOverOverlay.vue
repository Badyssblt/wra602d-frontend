<script setup lang="ts">
defineProps<{
  score: number
  population: number
  money: number
  busy: boolean
}>()

defineEmits<{
  save: []
  restart: []
}>()

const fmt = (n: number) => n.toLocaleString('fr-FR')
</script>

<template>
  <div class="overlay" role="dialog" aria-modal="true" aria-label="Partie terminee">
    <div class="card">
      <div class="banner">FAILLITE</div>
      <h1>La ville est en banqueroute</h1>
      <p class="lede">
        Vos finances sont restees dans le rouge trop longtemps.
        Sauvegardez pour figer votre score, puis recommencez.
      </p>

      <div class="stats">
        <div class="stat">
          <div class="label">Score final</div>
          <div class="value red">{{ fmt(Math.round(score)) }}</div>
        </div>
        <div class="stat">
          <div class="label">Population</div>
          <div class="value">{{ fmt(population) }}</div>
        </div>
        <div class="stat">
          <div class="label">Tresor</div>
          <div class="value">{{ fmt(money) }} €</div>
        </div>
      </div>

      <div class="actions">
        <button class="primary" :disabled="busy" @click="$emit('save')">Sauvegarder le score</button>
        <button class="secondary" :disabled="busy" @click="$emit('restart')">Recommencer</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0,0,0,0.8);
  z-index: 50;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
.card {
  width: min(420px, 92vw);
  padding: 28px 30px;
  background: #0f0f0f;
  border: 1px solid rgba(255,255,255,0.12);
  border-top: 3px solid #c0392b;
  color: white;
}
.banner {
  display: inline-block;
  padding: 3px 10px;
  margin-bottom: 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  background: #c0392b;
  color: white;
}
h1 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.lede {
  margin: 0 0 20px;
  font-size: 13px;
  color: rgba(255,255,255,0.5);
  line-height: 1.55;
}
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: rgba(255,255,255,0.08);
  margin-bottom: 20px;
}
.stat {
  padding: 10px 12px;
  background: #0f0f0f;
}
.label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.35);
  font-weight: 700;
  margin-bottom: 4px;
}
.value {
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, monospace;
}
.value.red { color: #c0392b; }
.actions { display: flex; gap: 8px; }
.actions button {
  flex: 1;
  padding: 10px 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  border: 1px solid;
  transition: background 0.1s, opacity 0.1s;
}
.actions button:active:not(:disabled) { opacity: 0.8; }
.actions button:disabled { opacity: 0.4; cursor: not-allowed; }
.primary { background: #c0392b; border-color: #c0392b; color: white; }
.primary:hover:not(:disabled) { background: #a93226; }
.secondary { background: transparent; border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.8); }
.secondary:hover:not(:disabled) { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.35); }
</style>
