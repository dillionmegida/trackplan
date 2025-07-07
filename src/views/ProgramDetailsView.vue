<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { format } from 'date-fns'
import { useProgram } from '@/query/usePrograms'
import Layout from '@/components/Layout.vue'
import EditIcon from '@/components/icons/EditIcon.vue'
import { LINKS } from '@/constants/links'
import BackIcon from '@/components/icons/BackIcon.vue'
import { useProgramChecklists } from '@/query/useProgramChecklists'

import CategoriesSection from '@/components/DashboardProgram/CategoriesSection.vue'
import ChecklistsForm from '@/components/DashboardProgram/ChecklistsForm.vue'
import ChecklistsSection from '@/components/DashboardProgram/ChecklistsSection.vue'

const route = useRoute()
const programId = route.params.id as string

const { data: program, isLoading, error } = useProgram(programId)
const {
  data: checklists,
  isLoading: checklistsLoading,
  error: checklistsError,
} = useProgramChecklists(programId)

const formatDate = (timestamp: any) => {
  return format(timestamp.toDate(), 'MMMM d, yyyy')
}

const howManyChecked = computed(() => {
  if (!checklists.value) {
    return 0
  }

  return checklists.value.filter((checklist) => checklist.isCompleted).length
})
</script>

<template>
  <Layout>
    <div class="program-details container">
      <div v-if="isLoading" class="loading">Loading program details...</div>

      <div v-else-if="error" class="error">Error loading program: {{ error }}</div>

      <div v-else-if="program" class="program-content">
        <RouterLink class="back-link" :to="LINKS.home"><BackIcon /> Back to Programs</RouterLink>
        <div class="program-info">
          <div>
            <div class="title-block">
              <h1>{{ program.title }}</h1>
              <RouterLink :to="LINKS.program_edit(program.id)" class="edit-program">
                <EditIcon />
              </RouterLink>
            </div>
            <p class="program-date">{{ formatDate(program.date) }}</p>

            <p class="program-description">{{ program.description }}</p>
          </div>
          <div class="progress">
            <ve-progress :size="80" :progress="(howManyChecked / (checklists?.length || 1)) * 100">
              {{ howManyChecked }} / {{ checklists?.length }}
            </ve-progress>
          </div>
        </div>

        <CategoriesSection />
        <ChecklistsForm />
        <ChecklistsSection />
      </div>
    </div>
  </Layout>
</template>

<style lang="scss" scoped>
.program-details {
  
}

.back-link {
  align-items: center;
  border-radius: 6px;
  font-size: 0.9rem;
  border: 1px solid #d1d5db;
  display: inline-flex;
  padding: 0.2rem 0.4rem 0.2rem 0.2rem;
  color: #64748b;
  gap: 0.2rem;
  margin-bottom: 1rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background-color: #d5dee7;
    color: #1e293b;
  }
}

.loading {
  color: #64748b;
}

.error {
  text-align: center;
  padding: 2rem;
  color: #ef4444;
}

.program-content {
  .title-block {
    display: flex;
    align-items: center;
    gap: 1rem;

    h1 {
      font-size: 2rem;
      color: #1e293b;
    }

    .edit-program {
      color: #64748b;
    }
  }

  .program-date {
    font-size: 1rem;
    font-weight: 300;
    color: #64748b;
    margin-bottom: 1rem;
  }

  .program-description {
    margin-bottom: 2.5rem;
  }
}

.program-info {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  background: #f8fafc;
  border-radius: 0.75rem;

  .progress {
  }
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.value {
  font-size: 1rem;
  color: #1e293b;
}
</style>