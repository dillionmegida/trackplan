<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDeleteUser, useUser } from '@/query/useUsers'
import { useOrganizationsForUser } from '@/query/useOrganizations'
import { useSelectActiveOrganization } from '@/query/useOrganizations'
import Layout from '@/components/Layout.vue'
import { LINKS } from '@/constants/links'
import { format } from 'date-fns'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import NoOrganizationsYet from '@/components/NoOrganizationsYet.vue'
import { usersLogger } from '@/services/logger/usersLogger'
import { authLogger } from '@/services/logger/authLogger'
import { CustomError } from '@/utils/error'
import { signOut } from 'firebase/auth'
import { auth } from '@/configs/firebase'
import Modal from '@/components/Modal.vue'
import { Teleport } from 'vue'

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
  location.reload()
}

const { mutateAsync: deleteUserMutation, isPending: isDeletingUser } = useDeleteUser()

const showDeleteModal = ref(false)

const deleteUser = async () => {
  showDeleteModal.value = true
}

const confirmDeleteUser = async (userId: string) => {
  if (!userId) return

  await deleteUserMutation(userId)

  try {
    await signOut(auth)
    usersLogger.userDeleteSuccess()
    authLogger.userSignedOutSuccess()
    router.push(LINKS.landing)
  } catch (error: any) {
    console.error('Error signing out:', error)
    const customError = new CustomError(error.message, error.statusCode ?? 500)
    toast.error('Failed to delete account. Please try again.')
    usersLogger.userDeleteFailed(customError)
    authLogger.userSignedOutFailed(customError)
  }
}
</script>

<template>
  <Layout>
    <div class="user-view container">
      <div v-if="userLoading || organizationsLoading" class="loading">Loading user...</div>
      <div v-else-if="userError" class="error">Error loading user: {{ userError?.message }}</div>
      <div v-else-if="organizationsError" class="error">
        Error loading organizations: {{ organizationsError?.message }}
      </div>
      <div v-else-if="!user" class="empty-state">
        <p>User not found</p>
      </div>
      <div v-else>
        <div class="user-section container">
          <div class="user-header">
            <div class="user-avatar">
              <img
                v-if="authStore.user?.photoURL && authStore.user?.displayName"
                :src="authStore.user.photoURL"
                :alt="authStore.user.displayName"
                class="avatar"
              />
            </div>
            <div class="user-info">
              <h1>{{ user?.name }}</h1>
              <p class="email">{{ user?.email }}</p>
              <p class="member-since">Member since {{ formatDate(user?.createdAt) }}</p>
            </div>
          </div>
        </div>

        <NoOrganizationsYet v-if="!organizations?.length" :user="user" />
        <div v-else class="organizations-section">
          <h2>Organizations I Belong To</h2>
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
                <div class="org-labels">
                  <span class="created-by-badge" v-if="org.createdBy === user?.id"> Yours </span>
                  <span v-if="org.id === user?.activeOrganizationId" class="active-badge">
                    Active
                  </span>
                </div>
              </RouterLink>
              <button
                v-if="org.id !== user?.activeOrganizationId"
                class="make-active-btn"
                @click.stop="selectOrganization(org.id)"
                :disabled="isSelectingOrg"
              >
                Activate
              </button>
            </div>
          </div>
          <!-- TODO: -->
          <!-- <button class="organization-card create-org">Create Organization</button> -->
        </div>
        <div class="action-links">
          <RouterLink class="trashed-link" :to="LINKS.trash">View Trashed Programs</RouterLink>
          <RouterLink class="archived-link" :to="LINKS.archived">View Archived Programs</RouterLink>
        </div>

        <div class="line"></div>

        <div class="delete-account-card">
          <h3>Danger Zone</h3>
          <p class="warning-text">
            <strong>Warning:</strong> Deleting your account is a permanent action that cannot be
            undone. Note that this will also delete all of your data, including:
          </p>
          <ul class="warning-list">
            <li>All organizations you own</li>
            <li>All programs within those organizations</li>
            <li>All associated checklist items</li>
          </ul>
          <p class="warning-note">
            If you're sure you want to proceed, please click the button below to delete your
            account.
          </p>
          <button @click="deleteUser" :disabled="isDeletingUser" class="delete-account-btn">
            {{ isDeletingUser ? 'Deleting your account...' : 'Delete My Account' }}
          </button>
        </div>
      </div>
    </div>
    <Teleport v-if="showDeleteModal && userId" to="body">
      <Modal
        v-model="showDeleteModal"
        title="Delete Account"
        @confirm="confirmDeleteUser(userId)"
        :deleting="isDeletingUser"
      >
        Are you sure you want to delete your account? This action cannot be undone.
      </Modal>
    </Teleport>
  </Layout>
</template>



<style lang="scss" scoped>
.user-view {
  padding-bottom: 10rem;
}

.user-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.user-header {
  display: flex;
  gap: 1.5rem;
}

.user-avatar .avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }

  @media (max-width: 425px) {
    width: 50px;
    height: 50px;
  }
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
  font-size: clamp(1rem, 2.5vw, 1.4rem);
}

.email {
  margin: 0 0 0.5rem;
  color: #64748b;
  font-size: clamp(0.8rem, 1.2vw, 1rem);
}

.member-since {
  margin: 0;
  color: #94a3b8;
  font-size: clamp(0.8rem, 1.2vw, 0.9rem);
}

.action-links {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;

  a {
    display: block;
    width: max-content;
    padding: 0.5rem 0.9rem;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s;
    border-radius: 6px;
  }
}

.trashed-link {
  color: #aa4c4c;
  background-color: #fce9e9;

  &:hover {
    background-color: #6f5757;
    color: white;
  }
}

.archived-link {
  color: #6f5757;
  background-color: #e5e7eb;

  &:hover {
    background-color: #6f5757;
    color: white;
  }
}

.organizations-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 3rem;

  h2 {
    text-transform: uppercase;
    font-weight: 300;
    font-size: clamp(1rem, 2.5vw, 1.2rem);
    color: #64748b;
    margin-bottom: 1rem;
  }

  @media (max-width: 768px) {
    padding: 0;
    background: none;
    box-shadow: none;
  }
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
  --size: 300px;
  grid-template-columns: repeat(auto-fill, minmax(var(--size), 1fr));
  column-gap: 1.25rem;
  row-gap: 1.5rem;

  @media (max-width: 768px) {
    --size: 200px;
  }
}

.make-active-btn {
  position: absolute;
  bottom: -15px;
  right: 10px;
  background-color: #61676f;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
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
  position: relative;
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

  @media (max-width: 768px) {
    .org-icon {
      display: none;
    }

    .active-badge {
      top: -0.8rem;
    }

    padding: 1rem;
    gap: 0.5rem;
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

.org-labels {
  position: absolute;
  top: -1rem;
  right: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;

  span {
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
  }
}

.created-by-badge {
  background-color: #b98610;
  color: white;
}

.active-badge {
  background-color: #10b981;
  color: white;
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

.line {
  width: 1px;
  height: 400px;
  background-color: #d48888;
  margin: 30px;
}

.delete-account-card {
  background-color: #fff5f5;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.delete-account-card h3 {
  color: #dc2626;
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.warning-text {
  color: #7f1d1d;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.warning-list {
  color: #7f1d1d;
  padding-left: 1.5rem;
  margin: 0 0 1.5rem;
  line-height: 1.2;
}

.warning-list li {
  margin-bottom: 0.5rem;
}

.warning-note {
  color: #7f1d1d;
  margin-bottom: 1.5rem;
}

.delete-account-btn {
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 1rem;
}

.delete-account-btn:hover {
  background-color: #b91c1c;
}

.delete-account-btn:disabled {
  background-color: #fca5a5;
  cursor: not-allowed;
}
</style>