<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  useMembersInOrganization,
  useOrganization,
  useUpdateOrganizationName,
} from '@/query/useOrganizations'
import { LINKS } from '@/constants/links'
import Layout from '@/components/Layout.vue'
import { format } from 'date-fns'
import { NOT_FOUND, useUser } from '@/query/useUsers'
import { computed, nextTick, ref, watch } from 'vue'
import EditIcon from '@/components/icons/EditIcon.vue'
import LoaderIcon from '@/components/icons/LoaderIcon.vue'
import CheckIcon from '@/components/icons/CheckIcon.vue'
import OrganizationMembers from '@/components/DashboardOrganization/OrganizationMembers.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const organizationId = route.params.organizationId as string

const isEditing = ref(false)

const { data: user, isLoading: userLoading } = useUser(authStore.user?.uid ?? '')
const {
  data: organization,
  isLoading: organizationLoading,
  error,
} = useOrganization(organizationId)

const organizationName = ref('')

watch(
  () => organization.value,
  (newOrganization) => {
    if (newOrganization) {
      organizationName.value = newOrganization.name
    }
  },
  { immediate: true }
)

const {
  data: members,
  isLoading: membersLoading,
  error: membersError,
} = useMembersInOrganization(organizationId)

const shouldBeAbleToInvite = computed(() => {
  if (!organization.value || !user.value || user.value?.name === NOT_FOUND) {
    return false
  }

  return organization.value?.createdBy === user.value.id
})

const { mutateAsync: updateOrganizationName, isPending: updateOrganizationNamePending } =
  useUpdateOrganizationName(organizationId)
const orgNameInputRef = ref<HTMLTextAreaElement | null>(null)

const shouldBeAbleToEditOrganizationName = computed(() => {
  if (!organization.value || !user.value || user.value?.name === NOT_FOUND) {
    return false
  }

  return organization.value.createdBy === user.value.id
})

const startEditing = () => {
  isEditing.value = true

  nextTick(() => {
    if (!orgNameInputRef.value) return

    orgNameInputRef.value.focus()

    function updateHeight() {
      if (!orgNameInputRef.value) return
      orgNameInputRef.value.style.height = 'auto'
      orgNameInputRef.value.style.height = orgNameInputRef.value.scrollHeight + 'px'
    }
    updateHeight()
    orgNameInputRef.value.addEventListener('input', updateHeight)
  })
}

const onBlur = async () => {
  if (
    organizationName.value === organization.value?.name ||
    !organization.value?.id ||
    !organizationName.value
  )
    return

  await updateOrganizationName(organizationName.value)
  isEditing.value = false
}
</script>

<template>
  <Layout>
    <main class="main-content container">
      <div v-if="userLoading || organizationLoading || membersLoading">Loading organization...</div>
      <div v-else-if="error">Error loading organization: {{ error }}</div>
      <div v-else>
        <div class="organization-header">
          <div class="edit-container">
            <div v-if="shouldBeAbleToEditOrganizationName">
              <button v-if="!isEditing" class="edit-button" @click="startEditing">
                <EditIcon :size="24" />
              </button>
              <button
                :disabled="updateOrganizationNamePending"
                v-else
                class="save-button"
                @click="isEditing = !isEditing"
              >
                <CheckIcon v-if="!updateOrganizationNamePending" :size="24" :color="'green'" />
                <LoaderIcon v-else :size="24" />
              </button>
            </div>

            <h1>
              <span class="organization-name" v-if="!isEditing">{{ organizationName }}</span>
              <input
                v-else
                ref="orgNameInputRef"
                maxlength="50"
                type="text"
                v-model="organizationName"
                class="organization-name-input"
                @blur="onBlur"
              />
              <!-- <span v-if="user?.activeOrganizationId === organizationId" class="active-badge"></span> -->
            </h1>
          </div>

          <div class="organization-actions">
            <RouterLink v-if="shouldBeAbleToInvite" :to="LINKS.inviteToOrganization(organizationId)"
              >Invite Someone</RouterLink
            >
          </div>
        </div>

        <div v-if="organization" class="organization-content">
          <p>Created since {{ format(organization.createdAt.toDate(), 'MMMM dd, yyyy') }}</p>

          <div v-if="members">
            <OrganizationMembers
              v-if="members.length"
              :members="members"
              :shouldBeAbleToInvite="shouldBeAbleToInvite"
              :organization="organization"
            />

            <div v-else class="no-members">
              <p>No members found in this organization.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </Layout>
</template>

<style lang="scss" scoped>
/* @import '@/styles/variables.scss'; */
.organization-header {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0.5rem;
  position: relative;

  .edit-container {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    flex-direction: column;
  }

  h1 {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .organization-name,
  .organization-name-input {
    font-size: clamp(1rem, 2vw, 1.3rem);
    color: #1e293b;
  }

  .organization-name-input {
    font-weight: inherit;
    padding: 0;
    background-color: transparent;
    border: none;
    border-bottom: 1px solid #d1d5db;
    outline: none;
    resize: none;
  }

  .active-badge {
    background-color: #0ef059;
    color: white;
    border-radius: 50%;
    width: 0.5rem;
    height: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: -0.25rem;
    top: -0.25rem;
    z-index: 1;
    font-size: 0.7rem;
  }
}
.organization-actions {
  display: flex;
  gap: 0.5rem;
}

.organization-actions a {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 3px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }

  @media (max-width: 768px) {
    padding: 0.25rem 0.5rem;
  }
}

.organization-content {
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 0.5rem 0 1.5rem;
}

.organization-info {
  p {
    margin: 0.5rem 0;
    color: #334155;
  }
}

.no-members {
  margin-top: 2rem;
  /* text-align: center; */
  padding: 2rem;
  background: white;
  border-radius: 8px;
  color: #64748b;

  p {
    margin: 0;
  }
}
</style>
