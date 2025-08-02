<script setup lang="ts">
import Layout from '@/components/Layout.vue'
import { NOT_FOUND, useUser } from '@/query/useUsers'
import { useAuthStore } from '@/stores/auth'
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useProgramsUserHasAccessTo } from '@/query/usePrograms'
import { LINKS } from '@/constants/links'
import { format } from 'date-fns'
import { useOrganizationsForUser, useSelectActiveOrganization } from '@/query/useOrganizations'
import { toast } from 'vue3-toastify'
import LoaderIcon from '@/components/icons/LoaderIcon.vue'
import NoOrganizationsYet from '@/components/NoOrganizationsYet.vue'
import { getIntensity, getWhiteMixAmount } from '@/utils/color'
import InfoBlock from '@/components/InfoBlock.vue'
import ClockIcon from '@/components/icons/ClockIcon.vue'
import { QEURY_KEY } from '@/query/QueryKey'
import { getThemeColor } from '@/helpers/themeColor'
import ProgramsSection from '@/components/Dashboard/ProgramsSection.vue'
import NoActiveOrganization from '@/components/Dashboard/NoActiveOrganization.vue'

const router = useRouter()
const userId = useAuthStore().user?.uid
const newAccount = router.currentRoute.value.query.new === 'true'

if (newAccount) {
  toast('Your trackplan account has been created successfully')
}

const { data: user, isLoading, error } = useUser(userId ?? '')

const {
  data: organizations,
  isLoading: organizationsLoading,
  error: organizationsError,
} = useOrganizationsForUser(userId ?? '')

const organizationId = computed(() => {
  if (!user.value) return
  if (user.value.name === NOT_FOUND) return ''
  if (!organizations.value) return

  const activeOrganization = organizations.value.find(
    (org) => org.id === user.value.activeOrganizationId
  )

  if (!activeOrganization) return ''

  return activeOrganization.id
})

const isUserPartOfActiveOrganization = computed(() => {
  if (!user.value) return false
  if (!organizations.value) return false

  const activeOrganization = organizations.value.find(
    (org) => org.id === user.value.activeOrganizationId
  )

  return !!activeOrganization
})

const {
  data: programs,
  isLoading: programsLoading,
  error: programsError,
} = useProgramsUserHasAccessTo({ organizationId, authUserId: userId ?? '' })

watch(
  user,
  () => {
    if (user.value && user.value?.name === NOT_FOUND) {
      console.log('User not found')
      router.push({ name: 'onboarding' })
    }
  },
  { immediate: true }
)
</script>


<template>
  <Layout>
    <main class="main-content container">
      <p v-if="isLoading || organizationsLoading || programsLoading">Loading...</p>
      <p v-else-if="error">{{ error }}</p>
      <InfoBlock
        v-else-if="user?.activeOrganizationId && !isUserPartOfActiveOrganization"
        variant="error"
        :message="'You have been removed from your active organization. Please activate another organization by clicking your user icon in the top right corner.'"
      />
      <p v-else-if="user?.name === NOT_FOUND">Redirecting to onboarding...</p>
      <p v-else-if="!user">Unable to load user</p>
      <NoOrganizationsYet v-else-if="organizations?.length === 0" :user="user" />
      <div v-else-if="!user?.activeOrganizationId">
        <NoActiveOrganization
          v-if="organizations"
          :organizations="organizations"
        />

      </div>
      <div v-else>
        <div class="top-header">
          <h1>Programs</h1>
          <RouterLink
            class="create-link"
            :to="LINKS.createProgram"
            v-if="user?.activeOrganizationId === user?.id"
          >
            Create
          </RouterLink>
        </div>
        <ProgramsSection
          :programs="programs"
          :loading="programsLoading"
          :error="programsError"
          :user="user"
        />
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
</style>