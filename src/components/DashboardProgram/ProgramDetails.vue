<script lang="ts" setup>
import { computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import { format } from 'date-fns'
import { useAddProgramToTrash } from '@/query/usePrograms'
import EditIcon from '@/components/icons/EditIcon.vue'
import { LINKS } from '@/constants/links'
import BackIcon from '@/components/icons/BackIcon.vue'
import { useProgramChecklists } from '@/query/useProgramChecklists'
import ChecklistsForm from '@/components/DashboardProgram/ChecklistsForm.vue'
import ChecklistsSection from '@/components/DashboardProgram/ChecklistsSection.vue'
import TrashIcon from '@/components/icons/TrashIcon.vue'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue3-toastify'
import { useRouter } from 'vue-router'
import { getIntensity, getWhiteMixAmount } from '@/utils/color'
import type { ProgramType } from '@/types/Program'
import type { Ref } from 'vue'
import type { OrganizationType } from '@/types/Organization'
import { useUser } from '@/query/useUsers'
import InfoBlock from '@/components/InfoBlock.vue'
import { useProgramCategories } from '@/query/useProgramCategories'
import CategoriesSection from './CategoriesSection.vue'

const router = useRouter()
const route = useRoute()
const programId = route.params.id as string

const program = inject('program') as Ref<ProgramType>
const organization = inject('organization') as Ref<OrganizationType>

const {
  data: checklists,
  isLoading: checklistsLoading,
  error: checklistsError,
} = useProgramChecklists(programId)
const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useProgramCategories(programId)

const { data: user, isLoading: userLoading, error: userError } = useUser(program.value?.createdBy)

const formatDate = (timestamp: any) => {
  return format(timestamp.toDate(), 'MMMM d, yyyy')
}

const howManyChecked = computed(() => {
  if (!checklists.value) {
    return 0
  }

  return checklists.value.filter((checklist) => checklist.isCompleted).length
})

const { mutateAsync: addProgramToTrashMutation, isPending: addProgramToTrashPending } =
  useAddProgramToTrash()
const authStore = useAuthStore()

const deleteProgram = async (id: string) => {
  if (!authStore.user) {
    return toast.error('You must be logged in to delete a program')
  }
  await addProgramToTrashMutation({ programId: id, userId: authStore.user.uid })
  router.push(LINKS.home)
}

const shouldBeAbleToEditProgram = computed(() => {
  if (!authStore.user || !program.value) {
    return false
  }

  return authStore.user.uid === program.value.createdBy
})

const shouldBeAbleToDeleteProgram = computed(() => {
  if (!authStore.user || !program.value || !organization.value) {
    return false
  }

  return authStore.user.uid === organization.value.createdBy
})

const userHasAccess = computed(() => {
  if (!authStore.user || !program.value) {
    return false
  }

  return (
    program.value.memberIds?.includes(authStore.user.uid) ||
    authStore.user.uid === program.value.createdBy
  )
})
</script>

<template>
  <div class="program-details">
    <div class="container" v-if="!userHasAccess">
      <InfoBlock variant="error" message="You do not have access to this program." />
    </div>
    <div class="container" v-if="userError">
      <InfoBlock variant="error" message="Something went wrong." />
    </div>
    <div v-else-if="program" class="program-content">
      <div :style="{
        '--color': program.color,
        '--white-level': getWhiteMixAmount(program.color) + '%',
        '--dark-color': getIntensity(program.color) > 20 ? program.color : '#333',
      }" class="program-content">
        <div class="container">
          <RouterLink class="back-link" :to="LINKS.home">
            <BackIcon /> Back to Programs
          </RouterLink>
          <div class="program-info">
            <div>
              <div class="title-block">
                <h1>{{ program.title }}</h1>

                <RouterLink v-if="shouldBeAbleToEditProgram" :to="LINKS.program_edit(program.id)" class="edit-program">
                  <EditIcon :size="24" />
                </RouterLink>
                <button class="delete-program" @click="deleteProgram(program.id)" :disabled="addProgramToTrashPending"
                  v-if="shouldBeAbleToDeleteProgram">
                  <TrashIcon :size="24" />
                </button>
              </div>
              <p class="program-date">{{ formatDate(program.date) }}</p>
              <p class="creaed-by">created by {{ user?.name }}</p>
            </div>
            <div class="progress">
              <ve-progress :size="80" :progress="(howManyChecked / (checklists?.length || 1)) * 100"
                :color="getIntensity(program.color) > 230 ? '#333' : program.color"
                :empty-color="getIntensity(program.color) < 20 ? '#000' : '#fff'">
                {{ howManyChecked }} / {{ checklists?.length }}
              </ve-progress>
            </div>
          </div>

          <p v-if="program.description" class="program-description">{{ program.description }}</p>
        </div>
      </div>
      
      <div class="container">
        <div class="categories-section">
          <CategoriesSection />
        </div>
        <div class="checklist-form">
          <ChecklistsForm />
        </div>

        <div v-if="checklistsError || categoriesError">
          <InfoBlock variant="error" message="Something went wrong while loading the checklists." />
        </div>

        <div v-else-if="checklistsLoading || categoriesLoading">
          Loading checklists...
        </div>

        <div v-else-if="!checklists || !categories">
          <InfoBlock variant="error" message="Something went wrong while loading the checklists." />
        </div>

        <div v-else-if="checklists">
          <div v-if="checklists?.length === 0" class="no-checklists">
            You have no checklist items yet. Create one above.
          </div>
          <ChecklistsSection v-else :themeColor="getIntensity(program.color) > 20 ? program.color : '#000'"
            :organizationId="organization.id" :checklists="checklists" :categories="categories" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.program-details {}

.categories-section {
  margin-bottom: 2rem;
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

  .progress {}
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