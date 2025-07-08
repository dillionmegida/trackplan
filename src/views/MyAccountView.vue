<script lang="ts" setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUser } from '@/query/useUsers'
import { useOrganizationsForUser } from '@/query/useOrganizations'
import { useSelectActiveOrganization } from '@/query/useOrganizations'
import Layout from '@/components/Layout.vue'
import { LINKS } from '@/constants/links'
import { format } from 'date-fns'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import NoOrganizationsYet from '@/components/NoOrganizationsYet.vue'

const authStore = useAuthStore()
const router = useRouter()
const userId = authStore.user?.uid

const { data: user, isLoading: userLoading, error: userError } = useUser(userId || '')
const {
  data: organizations,
  isLoading: organizationsLoading,
  error: organizationsError,
} = useOrganizationsForUser(userId || '')

const sortedOrganizations = computed(() => {
  if (!organizations.value) return []

  return [...organizations.value].sort((a, b) => {
    // If one of them is the active organization, it should come first
    if (a.id === user.value?.activeOrganizationId) return -1
    if (b.id === user.value?.activeOrganizationId) return 1

    // Otherwise sort alphabetically
    return a.name.localeCompare(b.name)
  })
})

const userInitials = computed(() => {
  if (!user.value?.displayName) return 'U'
  return user.value.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
})

const formatDate = (date: any) => {
  if (!date) return ''
  const timestamp = date.toDate ? date.toDate() : new Date(date)
  return format(timestamp, 'MMM d, yyyy')
}

const { mutateAsync: selectActiveOrg, isPending: isSelectingOrg } = useSelectActiveOrganization(
  userId || ''
)

const selectOrganization = async (orgId: string) => {
  if (!userId) return

  await selectActiveOrg({ organizationId: orgId })
  toast.success('Organization switched successfully')
}
</script>

<template>
  <Layout>
    <div class="user-view container">
      <div v-if="userLoading || organizationsLoading" class="loading">Loading user...</div>
      <div v-else-if="userError || organizationsError" class="error">
        Error loading user: {{ userError?.message || organizationsError?.message }}
      </div>
      <div v-else-if="!user" class="empty-state">
        <p>User not found</p>
      </div>
      <div v-else class="user-section">
        <div class="user-header">
          <div class="user-avatar">
            <img
              v-if="authStore.user?.photoURL"
              :src="authStore.user.photoURL"
              :alt="authStore.user.displayName"
              class="avatar"
            />
            <div v-else class="avatar-placeholder">
              {{ userInitials }}
            </div>
          </div>
          <div class="user-info">
            <h1>{{ user?.name }}</h1>
            <p class="email">{{ user?.email }}</p>
            <p class="member-since">Member since {{ formatDate(user?.createdAt) }}</p>
          </div>
        </div>
      </div>

      <div v-if="organizationsLoading" class="loading"></div>
      <NoOrganizationsYet v-else-if="!organizations?.length" :user="user" />
      <div v-else class="organizations-section">
        <div class="organizations-grid">
          <div v-for="org in sortedOrganizations" :key="org.id" class="organization-item">
            <RouterLink
              :to="LINKS.organization(org.id)"
              class="organization-card"
              :class="{ active: org.id === user?.activeOrganizationId }"
            >
              <div class="org-icon">
                <span>{{ org.name.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="org-details">
                <h3>{{ org.name }}</h3>
                <p class="org-meta">
                  {{ formatDate(org.createdAt) }}
                </p>
              </div>
              <span v-if="org.id === user?.activeOrganizationId" class="active-badge">
                Active
              </span>
            </RouterLink>
            <button
              v-if="org.id !== user?.activeOrganizationId"
              class="make-active-btn"
              @click="selectOrganization(org.id)"
              :disabled="isSelectingOrg"
            >
              Make Active
            </button>
          </div>
          <!-- TODO: -->
          <!-- <button class="organization-card create-org">Create Organization</button> -->
        </div>
      </div>
    </div>
  </Layout>
</template>



<style lang="scss" scoped>
.user-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-avatar .avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
}

.user-info h1 {
  margin: 0 0 0.25rem;
  font-size: 1.75rem;
  font-weight: 600;
}

.email {
  margin: 0 0 0.5rem;
  color: #64748b;
}

.member-since {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

.organizations-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.view-all {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.view-all:hover {
  text-decoration: underline;
}

.organizations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

.make-active-btn {
  background-color: #61676f;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.625rem 1.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.make-active-btn:hover {
  background-color: #4a4c50;
}

.organization-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}

.organization-card {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;
  background-color: white;
  position: relative;
  text-align: left;

  &.create-org {
    height: 100%;
    background-color: #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.organization-card.active {
  border-color: #3b82f6;
  background-color: #f0f7ff;
}

.organization-card:hover {
  border-color: #cbd5e1;
  background-color: #c4d5e6;
}

.org-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #e0f2fe;
  color: #0369a1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  flex-shrink: 0;
}

.org-details {
  flex: 1;
  min-width: 0;
}

.org-details h3 {
  font-size: 1.1rem;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.org-meta {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}

.active-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background-color: #10b981;
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
}

.create-btn {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.625rem 1.25rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.create-btn:hover {
  background-color: #2563eb;
}

.loading,
.error {
  color: #64748b;
}

.error {
  color: #ef4444;
}
</style>