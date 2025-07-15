<script lang="ts" setup>
import { computed, inject, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { format } from 'date-fns'
import { useAddProgramToTrash, useDemoProgram } from '@/query/usePrograms'
import EditIcon from '@/components/icons/EditIcon.vue'
import { LINKS } from '@/constants/links'
import BackIcon from '@/components/icons/BackIcon.vue'
import { useDemoProgramChecklists, useProgramChecklists } from '@/query/useProgramChecklists'
import ChecklistsForm from '@/components/DashboardProgram/ChecklistsForm.vue'
import ChecklistsSection from '@/components/DashboardProgram/ChecklistsSection.vue'
import TrashIcon from '@/components/icons/TrashIcon.vue'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue3-toastify'
import { useRouter } from 'vue-router'
import { getIntensity, getWhiteMixAmount } from '@/utils/color'
import type { ProgramType } from '@/types/Program'
import InfoBlock from '@/components/InfoBlock.vue'
import DemoLayout from '@/components/DemoLayout.vue'
import { demoUser } from '@/constants/demoUser'
import DemoChecklistsSection from '@/components/DashboardProgram/DemoChecklistsSection.vue'
import DemoChecklistsForm from '@/components/DashboardProgram/DemoChecklistsForm.vue'
import type { ProgramChecklistItemType } from '@/types/ProgramChecklist'
import ClockIcon from '@/components/icons/ClockIcon.vue'

const router = useRouter()
const route = useRoute()
const programId = route.params.id as string

const { data: program, isLoading: programLoading, error: programError } = useDemoProgram(programId)

const {
  data: checklists,
  isLoading: checklistsLoading,
  error: checklistsError,
} = useDemoProgramChecklists(programId)

const checklistsCopy = ref<ProgramChecklistItemType[]>([])

watch(checklists, () => {
  if (!checklists.value) return

  checklistsCopy.value = checklists.value
}, { immediate: true })

const formatDate = (timestamp: any) => {
  return format(timestamp.toDate(), 'MMMM d, yyyy')
}

const howManyChecked = computed(() => {
  if (!checklistsCopy.value) {
    return 0
  }

  return checklistsCopy.value.filter((checklist) => checklist.isCompleted).length
})

const updateChecklist = (checklistId: string, isCompleted: boolean) => {
  const itemInArrayIndex = checklistsCopy.value.findIndex(
    (checklist) => checklist.id === checklistId
  )
  checklistsCopy.value[itemInArrayIndex].isCompleted = isCompleted
}

const deleteChecklist = (checklistId: string) => {
  const itemInArrayIndex = checklistsCopy.value.findIndex(
    (checklist) => checklist.id === checklistId
  )

  const checklistsFiltered = checklistsCopy.value.filter(
    (checklist) => checklist.id !== checklistId
  )

  checklistsCopy.value = [...checklistsFiltered]
}

const addChecklist = (c: ProgramChecklistItemType) => {
  if (!checklistsCopy.value) {
    checklistsCopy.value = []
  }

  checklistsCopy.value = [...checklistsCopy.value, c]
}
</script>

<template>
  <DemoLayout>
    <div class="program-details">
      <div class="container" v-if="programLoading || checklistsLoading">Loading...</div>
      <div v-else-if="program && checklistsCopy.length">
        <div
          :style="{
            '--color': program.color,
            '--white-level': program.color ? getWhiteMixAmount(program.color) + '%' : '0%',
            '--dark-color': program.color
              ? getIntensity(program.color) > 20
                ? program.color
                : '#333'
              : '#333',
          }"
          class="program-content"
        >
          <div class="container">
            
            <RouterLink class="back-link" :to="LINKS.demo">
              <BackIcon /> Back to Programs
            </RouterLink>
            <div class="program-info">
              <div>
                <div class="title-block">
                  <h1>{{ program.title }}</h1>
                </div>
                <p class="program-date"><ClockIcon :size="18" /> {{ formatDate(program.date) }}</p>
                <p class="creaed-by">created by {{ demoUser.name }}</p>
              </div>
              <div class="progress">
                <ve-progress
                  :size="80"
                  :progress="(howManyChecked / (checklistsCopy.length || 1)) * 100"
                  :color="
                    program.color
                      ? getIntensity(program.color) > 230
                        ? '#333'
                        : program.color
                      : '#333'
                  "
                  :empty-color="
                    program.color ? (getIntensity(program.color) < 20 ? '#000' : '#fff') : '#fff'
                  "
                >
                  {{ howManyChecked }} / {{ checklistsCopy.length }}
                </ve-progress>
              </div>
            </div>

            <p v-if="program.description" class="program-description">{{ program.description }}</p>
          </div>
        </div>

        <div class="container">
          <InfoBlock
            variant="info"
            title="Info"
            message="Every change you make to this demo program will be lost when you refresh the page."
          />
          <div class="checklist-form">
            <DemoChecklistsForm @new-checklist="addChecklist" />
          </div>

          <DemoChecklistsSection
            :themeColor="program.color ? getIntensity(program.color) > 20 ? program.color : '#000' : '#000'"
            :checklists="checklistsCopy"
            @update="updateChecklist"
            @delete="deleteChecklist"
          />
          <div v-if="checklistsCopy.length === 0" class="no-checklists">
            You have no checklist items yet. Create one above.
          </div>
        </div>
      </div>
    </div>
  </DemoLayout>
</template>

<style lang="scss" scoped>
.program-details {
}

.checklist-form {
  margin-bottom: 2rem;
}

.no-checklists {
  padding: 2rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #f8fafc;
  text-align: center;
  color: #9ca3af;
  font-size: 0.9rem;
}

.back-link {
  align-items: center;
  border-radius: 6px;
  font-size: 0.9rem;
  border: 1px solid var(--dark-color);
  color: var(--dark-color);
  display: inline-flex;
  padding: 0.2rem 0.4rem 0.2rem 0.2rem;
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

.program-content {
  background-color: color-mix(in srgb, var(--color), white var(--white-level));
  border-bottom: 1px solid var(--dark-color);

  .info-container.container {
    padding-block: 1rem;
  }

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
      position: relative;
      top: 2px;
    }

    .delete-program {
      color: #ef4444;
    }
  }

  .program-date {
    font-size: 1rem;
    font-weight: 300;
    display: flex;
    align-items: center;
    gap: 0.2rem;
    color: #64748b;
    margin-bottom: 1rem;
  }

  .creaed-by {
    font-size: 0.8rem;
    display: inline-block;
    font-weight: 300;
    color: #64748b;
    padding: 0.2rem 0.4rem;
    border: 1px solid var(--color);
    margin-bottom: 1rem;
    color: var(--color);
    border-radius: 6px;
  }

  .program-description {
    /* margin-bottom: 2.5rem; */
  }
}

.program-info {
  display: flex;
  justify-content: space-between;
  column-gap: 1.5rem;
  row-gap: 0.5rem;
  flex-wrap: wrap;

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