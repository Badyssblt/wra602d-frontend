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
  <div class="overlay" role="dialog" aria-modal="true" aria-label="Partie terminée">
    <div class="card">
      <div class="banner">FAILLITE</div>
      <h1>La ville est en banqueroute</h1>
      <p class="lede">
        Vos finances sont restées dans le rouge trop longtemps. Sauvegardez une dernière fois pour figer votre score
        au classement, puis supprimez la ville pour en recommencer une.
      </p>

      <div class="stats">
        <div class="stat">
          <div class="label">Score final</div>
          <div class="value">{{ fmt(Math.round(score)) }}</div>
        </div>
        <div class="stat">
          <div class="label">Population</div>
          <div class="value">{{ fmt(population) }}</div>
        </div>
        <div class="stat">
          <div class="label">Trésor</div>
          <div class="value money">{{ fmt(money) }} €</div>
        </div>
      </div>

      <div class="actions">
        <button class="primary" :disabled="busy" @click="$emit('save')">Sauvegarder (envoyer le score)</button>
        <button class="ghost" :disabled="busy" @click="$emit('restart')">Supprimer & recommencer</button>
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
  background: rgba(7, 11, 22, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 50;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
.card {
  width: min(440px, 92vw);
  padding: 28px 32px;
  background: linear-gradient(180deg, rgba(20, 26, 40, 0.96), rgba(11, 15, 24, 0.98));
  border: 1px solid rgba(255, 100, 100, 0.25);
  border-radius: 16px;
  color: white;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}
.banner {
  display: inline-block;
  padding: 4px 12px;
  margin-bottom: 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  background: rgba(220, 38, 38, 0.18);
  color: #fca5a5;
  border: 1px solid rgba(220, 38, 38, 0.45);
  border-radius: 4px;
}
h1 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.lede {
  margin: 0 0 22px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.5;
}
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 22px;
}
.stat {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}
.label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 4px;
}
.value {
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.value.money { color: #fca5a5; }
.actions {
  display: flex;
  gap: 10px;
}
.actions button {
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, transform 0.08s;
}
.actions button:active:not(:disabled) { transform: scale(0.97); }
.actions button:disabled { opacity: 0.5; cursor: not-allowed; }
.actions .primary {
  background: linear-gradient(135deg, #5b8dd9, #4a6fb8);
  border: 1px solid rgba(147, 197, 253, 0.5);
  color: white;
}
.actions .primary:hover:not(:disabled) { background: linear-gradient(135deg, #6b9de9, #5a7fc8); }
.actions .ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.85);
}
.actions .ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.3);
}
</style>
