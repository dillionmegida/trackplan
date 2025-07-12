<script setup lang="ts">
import Layout from '@/components/Layout.vue'
import { NOT_FOUND, useUser } from '@/query/useUsers'
import { useAuthStore } from '@/stores/auth'
import { computed, ref, watch, onMounted } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRouter } from 'vue-router'
import { RouterLink } from 'vue-router'
import { useProgramsForOrganization } from '@/query/usePrograms'
import { LINKS } from '@/constants/links'
import { format } from 'date-fns'
import { useOrganizationsForUser, useSelectActiveOrganization } from '@/query/useOrganizations'
import { toast } from 'vue3-toastify'
import LoaderIcon from '@/components/icons/LoaderIcon.vue'
import NoOrganizationsYet from '@/components/NoOrganizationsYet.vue'
import { getIntensity, getWhiteMixAmount } from '@/utils/color'
import InfoBlock from '@/components/InfoBlock.vue'
import ClockIcon from '@/components/icons/ClockIcon.vue'

const router = useRouter()
const queryClient = useQueryClient()
const userId = useAuthStore().user?.uid
const newAccount = router.currentRoute.value.query.new === 'true'

onBeforeRouteLeave((to, from) => {
  console.log(to.name, from.name, organizationId.value)

  if (!organizationId.value) return
  if (from.name === to.name) return

  queryClient.invalidateQueries({ queryKey: ['programs', organizationId.value] })
})

const organizationBeenSelected = ref('')

if (newAccount) {
  toast('Your trackplan account has been created successfully')
}

const { data: user, isLoading, error } = useUser(userId ?? '')

const organizationId = computed(() => {
  if (!user.value) return

  if (user.value.name === NOT_FOUND) {
    return ''
  }

  if (!user.value.organizationIds.includes(user.value.activeOrganizationId)) {
    return ''
  }

  return user.value.activeOrganizationId
})

const isUserPartOfActiveOrganization = computed(() => {
  if (!user.value) return false

  return user.value.organizationIds.includes(user.value.activeOrganizationId)
})

const {
  data: organizations,
  isLoading: organizationsLoading,
  error: organizationsError,
} = useOrganizationsForUser(userId ?? '')
const {
  data: programs,
  isLoading: programsLoading,
  error: programsError,
} = useProgramsForOrganization(organizationId)

const {
  mutateAsync: selectActiveOrganization,
  isPending: selectActiveOrganizationPending,
  error: selectActiveOrganizationError,
} = useSelectActiveOrganization(userId ?? '')

const selectOrganization = async (organizationId: string) => {
  if (!userId) {
    toast('You must be logged in to select an organization.')
    return
  }

  organizationBeenSelected.value = organizationId

  await selectActiveOrganization({ organizationId })

  const toastMsg =
    organizationBeenSelected.value === userId
      ? 'Your personal organization is selected.'
      : 'Organization selected successfully'
  toast.success(toastMsg)
  organizationBeenSelected.value = ''
}

watch(user, () => {
  if (user.value && user.value?.name === NOT_FOUND) {
    console.log('User not found')
    router.push({ name: 'onboarding' })
  }
})
</script>


<template>
  <Layout>
    <main class="main-content container">
      <p v-if="isLoading || organizationsLoading || programsLoading">Loading...</p>
      <p v-else-if="error">{{ error }}</p>
      <InfoBlock
        v-else-if="!isUserPartOfActiveOrganization"
        variant="error"
        :message="'You have been removed from your active organization. Please activate another organization by clicking your user icon in the top right corner.'"
      />
      <p v-else-if="user?.name === NOT_FOUND">Redirecting to onboarding...</p>
      <NoOrganizationsYet v-else-if="organizations?.length === 0" :user="user" />
      <div v-else-if="!user?.activeOrganizationId" class="organizations">
        <div class="organization">
          <h1>Select organization to begin</h1>
          <div class="organizations-list">
            <button
              @click="selectOrganization(organization.id)"
              v-for="organization in organizations"
              :key="organization.id"
              class="organization-item"
              :disabled="selectActiveOrganizationPending"
            >
              <span class="organization-name">{{ organization.name }}</span>
              <span v-if="organizationBeenSelected === organization.id" class="loading-icon">
                <LoaderIcon :size="20" />
              </span>
            </button>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="top-header">
          <h1>Programs</h1>
          <RouterLink class="create-link" :to="LINKS.createProgram"> Create </RouterLink>
        </div>
        <section class="programs-section">
          <p v-if="programsLoading">Loading programs...</p>
          <p v-else-if="programsError">{{ programsError }}</p>
          <div v-else-if="programs?.length === 0" class="no-programs">
            Create a program to get started
          </div>
          <div v-else class="programs-list">
            <RouterLink
              v-for="program in programs"
              :key="program.id"
              :to="LINKS.program(program.id)"
              :style="{
                '--color': program.color,
                '--dark-color': getWhiteMixAmount(program.color) < 20 ? '#333' : program.color,
                '--white-level': getWhiteMixAmount(program.color) + '%',
              }"
              class="program-item"
            >
              <div>
                <span class="program-title">{{ program.title }}</span>
                <span class="program-date"> <ClockIcon :size="16" /> {{ format(program.date.toDate(), 'PP') }}</span>
              </div>
              <div v-if="program.meta" class="progress">
                <ve-progress
                  :size="40"
                  :progress="
                    (program.meta.totalCompletedItems / (program.meta?.totalItems || 1)) * 100
                  "
                  :color="getIntensity(program.color) > 230 ? '#333' : program.color"
                  :empty-color="getIntensity(program.color) < 20 ? '#000' : '#fff'"
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
  </Layout>
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
  /* grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); */
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