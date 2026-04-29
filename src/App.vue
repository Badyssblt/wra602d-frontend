<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import AuthScreen from './components/AuthScreen.vue'
import GameView from './components/game/GameView.vue'
import Toast from './components/Toast.vue'

const auth = useAuthStore()

onMounted(() => auth.bootstrap())
</script>

<template>
  <AuthScreen v-if="!auth.isAuthenticated && !auth.loading" />
  <GameView v-else-if="auth.isAuthenticated" />
  <Toast />
</template>
