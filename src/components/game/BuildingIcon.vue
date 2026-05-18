<script setup lang="ts">
import type { BuildingType } from '../../types'

defineProps<{ type: BuildingType }>()
</script>

<template>
  <svg
    v-if="type === 'house'"
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linejoin="round"
    stroke-linecap="round"
  >
    <path d="M3 11 12 4l9 7" />
    <path d="M5 10v9h14v-9" />
    <path d="M10 19v-5h4v5" />
  </svg>

  <svg
    v-else-if="type === 'office'"
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linejoin="round"
    stroke-linecap="round"
  >
    <rect x="5" y="3" width="14" height="18" rx="1" />
    <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
    <path d="M10 21v-3h4v3" />
  </svg>

  <svg
    v-else-if="type === 'industry'"
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linejoin="round"
    stroke-linecap="round"
  >
    <path d="M3 21V11l5 3V11l5 3V8l8 13Z" />
    <path d="M7 14v4M11 14v4M16 18v-2" />
    <path d="M5 6c0-1 0-3 2-3" />
  </svg>

  <svg
    v-else-if="type === 'park'"
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linejoin="round"
    stroke-linecap="round"
  >
    <path d="M12 3c-3 2-4.5 4.5-4.5 7 0 2 1.2 3.5 2.8 4" />
    <path d="M12 3c3 2 4.5 4.5 4.5 7 0 2-1.2 3.5-2.8 4" />
    <path d="M9 10c0 2 1.2 3.5 3 4 1.8-.5 3-2 3-4" />
    <path d="M12 14v7" />
  </svg>

  <svg
    v-else-if="type === 'university'"
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linejoin="round"
    stroke-linecap="round"
  >
    <path d="M2 9 12 4l10 5-10 5Z" />
    <path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
    <path d="M22 9v6" />
  </svg>

  <svg
    v-else-if="type === 'powerplant'"
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linejoin="round"
    stroke-linecap="round"
  >
    <path d="M6 21V10c0-1 .8-2 2-2 1.2 0 2 1 2 2v11" />
    <path d="M14 21V10c0-1 .8-2 2-2 1.2 0 2 1 2 2v11" />
    <path d="M3 21h18" />
    <path d="M8 8c-.5-2 .5-4 2-4M16 8c-.5-2 .5-4 2-4" />
  </svg>

  <svg
    v-else-if="type === 'port'"
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linejoin="round"
    stroke-linecap="round"
  >
    <path d="M3 17c1.5 1.5 3 2 4.5 2s3-.5 4.5-2 3-2 4.5-2 3 .5 4.5 2" />
    <path d="M5 14h14l-2 3H7Z" />
    <path d="M12 14V5" />
    <circle cx="12" cy="4" r="1.2" />
  </svg>

  <svg
    v-else
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linejoin="round"
    stroke-linecap="round"
  >
    <path d="M5 4 3 20" />
    <path d="M19 4l2 16" />
    <path d="M12 5v2M12 11v2M12 17v2" stroke-dasharray="0" />
  </svg>
</template>
