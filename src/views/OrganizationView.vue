<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMembersInOrganization, useOrganization } from '@/query/useOrganizations'
import { LINKS } from '@/constants/links'
import Layout from '@/components/Layout.vue'
import { format } from 'date-fns'
import { NOT_FOUND, useUser } from '@/query/useUsers'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const organizationId = route.params.organizationId as string

const { data: user, isLoading: userLoading } = useUser(authStore.user?.uid ?? '')
const {
  data: organization,
  isLoading: organizationLoading,
  error,
} = useOrganization(organizationId)
const {
  data: members,
  isLoading: membersLoading,
  error: membersError,
} = useMembersInOrganization(organizationId)

const handleInvite = () => {
  router.push(LINKS.inviteToOrganization(organizationId))
}

const shouldBeAbleToInvite = computed(() => {
  if (!organization.value || !user.value || user.value?.name === NOT_FOUND) {
    return false
  }

  return organization.value?.createdBy === user.value.id
})
</script>

<template>
  <Layout>
    <main class="main-content container">
      <div v-if="userLoading || organizationLoading || membersLoading">Loading organization...</div>
      <div v-else-if="organizationError">Error loading organization: {{ organizationError }}</div>
      <div v-else>
        <div class="organization-header">
          <h1>
            {{ organization?.name }}
            <span v-if="user?.activeOrganizationId === organizationId" class="active-badge"></span>
          </h1>
          <div class="organization-actions">
            <button v-if="shouldBeAbleToInvite" @click="handleInvite" class="invite-button">
              Invite Someone
            </button>
          </div>
        </div>

        <!-- TODO: Add organization content -->
        <div class="organization-content">
          <p>Created since {{ format(organization?.createdAt?.toDate(), 'MMMM dd, yyyy') }}</p>

          <div class="members-section" v-if="members?.length">
            <h3>Members</h3>
            <div class="members-list">
              <div v-for="member in members" :key="member.id" class="member-card">
                <div class="member-avatar">
                  {{ member.displayName?.charAt(0)?.toUpperCase() || 'U' }}
                </div>
                <div class="member-info">
                  <div class="member-name">{{ member.name }}</div>
                  <div class="member-email">{{ member.email }}</div>
                </div>
                <div
                  class="member-status"
                  :class="{ active: member.id === organization.createdBy }"
                >
                  {{ member.id === organization.createdBy ? 'Admin' : 'Member' }}
                </div>
              </div>
            </div>
          </div>

          <div v-else class="no-members">
            <p>No members found in this organization.</p>
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
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  position: relative;

  h1 {
    font-size: clamp(1rem, 2vw, 1.3rem);
    color: #1e293b;
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
  gap: 1rem;
}

.invite-button {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }
}

.organization-content {
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 1.5rem 0;
}

.organization-info {
  p {
    margin: 0.5rem 0;
    color: #334155;
  }
}

.members-section {
  margin-top: 2rem;

  h3 {
    font-size: 1.1rem;
    color: #1e293b;
    margin-bottom: 1rem;
    font-weight: 600;
  }
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.member-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #475569;
  margin-right: 1rem;
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  min-width: 0;

  .member-name {
    font-weight: 500;
    color: #1e293b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .member-email {
    font-size: 0.85rem;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.member-status {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background-color: #e2e8f0;
  color: #475569;

  &.active {
    background-color: #dbeafe;
    color: #1e40af;
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
