<script setup lang="ts">
import { LINKS } from '@/constants/links'
import { getThemeColor } from '@/helpers/themeColor'
import type { ProgramType } from '@/types/Program'
import { format } from 'date-fns'
import ClockIcon from '@/components/icons/ClockIcon.vue'
import { RouterLink } from 'vue-router'

const props = defineProps<{
  program: ProgramType
}>()
</script>

<template>
  <RouterLink
    :key="program.id"
    :to="LINKS.program(program.id)"
    :style="{
      '--color': program.color,
      '--dark-color': getThemeColor(program.color).darkColor,
      '--white-level': getThemeColor(program.color).whiteMixAmount + '%',
    }"
    class="program-item"
  >
    <div>
      <span class="program-title">{{ program.title }}</span>
      <span class="program-date">
        <ClockIcon :size="16" /> {{ format(program.date.toDate(), 'PP') }}</span
      >
    </div>
    <div v-if="program.meta" class="progress">
      <ve-progress
        :size="40"
        :progress="(program.meta.totalCompletedItems / (program.meta?.totalItems || 1)) * 100"
        :color="getThemeColor(program.color).darkColor"
        :empty-color="getThemeColor(program.color).emptyColor"
        :thickness="2"
      >
        {{ Math.round((program.meta.totalCompletedItems / (program.meta.totalItems || 1)) * 100) }}%
      </ve-progress>
    </div>
  </RouterLink>
</template>

<style scoped lang="scss">
.program-item {
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  background-color: #f8fafc;
  border: 1px solid color-mix(in srgb, var(--dark-color), white 60%);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: color-mix(in srgb, var(--color), white var(--white-level));
  display: flex;
  justify-content: space-between;

  .progress {
    position: relative;
    font-size: 0.6rem;

    .ep-legend--value {
      height: unset;
    }

    .ve-progress__circle {
      stroke-width: 6px !important;
    }
  }
}

.program-item:hover {
  background-color: #e5e7eb;
}

.program-item:active {
  background-color: #d1d5db;
}

.program-title {
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
}

.program-date {
  margin-top: 5px;
  font-size: 0.8rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-weight: 300;
}
</style>