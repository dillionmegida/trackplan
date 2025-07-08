<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    :class="{ 'animate-spin': animate }"
  >
    <path
      d="M12 2V6"
      :stroke="color"
      stroke-width="2"
      stroke-linecap="round"
    />
    <path
      d="M12 18V22"
      :stroke="color"
      stroke-width="2"
      stroke-linecap="round"
    />
    <path
      d="M4.93 4.93L7.76 7.76"
      :stroke="color"
      stroke-width="2"
      stroke-linecap="round"
    />
    <path
      d="M16.24 16.24L19.07 19.07"
      :stroke="color"
      stroke-width="2"
      stroke-linecap="round"
    />
    <path
      d="M2 12H6"
      :stroke="color"
      stroke-width="2"
      stroke-linecap="round"
    />
    <path
      d="M18 12H22"
      :stroke="color"
      stroke-width="2"
      stroke-linecap="round"
    />
    <path
      d="M4.93 19.07L7.76 16.24"
      :stroke="color"
      stroke-width="2"
      stroke-linecap="round"
    />
    <path
      d="M16.24 7.76L19.07 4.93"
      :stroke="color"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  size?: number | string
  color?: string
  animate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  color: 'currentColor',
  animate: true
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
