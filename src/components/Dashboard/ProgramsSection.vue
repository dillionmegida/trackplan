<script setup lang="ts">
import { LINKS } from '@/constants/links'
import { getThemeColor } from '@/helpers/themeColor'
import type { ProgramType } from '@/types/Program'
import type { UserType } from '@/types/User'
import { format } from 'date-fns'
import ClockIcon from '@/components/icons/ClockIcon.vue'
import { RouterLink } from 'vue-router'

defineProps<{
  programs: ProgramType[]
  loading: boolean
  error: string | null
  user: UserType | null
}>()
</script>

<template>
  <section class="programs-section">
    <p v-if="loading">Loading programs...</p>
    <p v-else-if="error">{{ error }}</p>
    <div v-else-if="programs?.length === 0" class="no-programs">
      <span v-if="user?.activeOrganizationId === user?.id">Create a program to get started</span>
      <span v-else
        >You do not have access to any programs in this organization you were added to. Ask the
        organization owner to add you to programs.</span
      >
    </div>
    <div v-else class="programs-list">
      <RouterLink
        v-for="program in programs"
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
            {{
              Math.round((program.meta.totalCompletedItems / (program.meta.totalItems || 1)) * 100)
            }}%
          </ve-progress>
        </div>
      </RouterLink>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.no-programs {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background-color: #f8fafc;
  border: 1px solid #d3d9e2;
  margin: 2rem 0;
}

.programs-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
  align-items: start;
}

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
