<script setup lang="ts">
import { NOT_FOUND, useUser } from '@/query/useUsers'
import { useAuthStore } from '@/stores/auth'
import { computed, ref, watch, onMounted } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRouter } from 'vue-router'
import { RouterLink } from 'vue-router'
import { useDemoPrograms } from '@/query/usePrograms'
import { LINKS } from '@/constants/links'
import { format } from 'date-fns'
import { getIntensity, getWhiteMixAmount } from '@/utils/color'
import ClockIcon from '@/components/icons/ClockIcon.vue'
import DemoLayout from '@/components/DemoLayout.vue'

import { DEMO_PROGRAMS } from '@/constants/demoData'
</script>


<template>
  <DemoLayout>
    <main class="main-content container">
      <div>
        <div class="top-header">
          <h1>Programs</h1>
        </div>
        <section class="programs-section">
          <div class="programs-list">
            <RouterLink
              v-for="program in DEMO_PROGRAMS"
              :key="program.id"
              :to="LINKS.demo_program_details(program.id)"
              :style="{
                '--color': program.color,
                '--dark-color': program.color ? getWhiteMixAmount(program.color) < 20 ? '#333' : program.color : '#333',
                '--white-level': program.color ? getWhiteMixAmount(program.color) + '%': '0%',
              }"
              class="program-item"
            >
              <div>
                <span class="program-title">{{ program.title }}</span>
                <span class="program-date">
                  <ClockIcon :size="16" /> {{ format(new Date(program.date._seconds * 1000), 'PP') }}</span
                >
              </div>
              <div v-if="program.meta" class="progress">
                <ve-progress
                  :size="40"
                  :progress="
                    (program.meta.totalCompletedItems / (program.meta?.totalItems || 1)) * 100
                  "
                  :color="program.color ? getIntensity(program.color) > 230 ? '#333' : program.color : '#333'"
                  :empty-color="program.color ? getIntensity(program.color) < 20 ? '#000' : '#fff' : '#fff'"
                  :thickness="2"
                >
                  {{
                    Math.round(
                      (program.meta.totalCompletedItems / (program.meta.totalItems || 1)) * 100
                    )
                  }}%
                </ve-progress>
              </div>
            </RouterLink>
          </div>
        </section>
      </div>
    </main>
  </DemoLayout>
</template>

<style lang="scss" scoped>
.top-header {
  display: flex;
  align-items: center;
  gap: 1rem;

  h1 {
    font-weight: 300;
    font-size: 1.2rem;
  }

  .create-link {
    padding: 0.5rem 0.9rem;
    font-size: 0.9rem;
    color: white;
    background-color: #3b82f6;
    border: none;
    border-radius: 6px;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
  }

  .create-link:hover {
    background-color: #2563eb;
  }

  .create-link:active {
    background-color: #1d4ed8;
  }
}

.organizations {
  padding: 1rem 2rem;

  h1 {
    text-transform: uppercase;
    font-weight: 300;
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .organizations-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;

    .organization-item {
      padding: 1rem;
      font-size: 1rem;
      font-weight: 500;
      color: #1e293b;
      background-color: #f8fafc;
      border: 1px solid #d3d9e2;
      border-radius: 6px;
      transition: background-color 0.2s;
      position: relative;

      &:hover {
        background-color: #e5e7eb;
      }

      &:active {
        background-color: #d1d5db;
      }

      &:disabled .organization-name {
        opacity: 0.1;
      }

      &:disabled .loading-icon {
        display: block;
      }

      .loading-icon {
        display: none;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
      }
    }
  }
}

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