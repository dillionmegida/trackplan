<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{
  size?: number
  color?: string
}>()
</script>

<style scoped>
svg {
  width: v-bind(size);
  height: v-bind(size);
}

svg path {
  stroke: v-bind(color);
}
</style>
