<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOrganization } from '@/query/useOrganizations'
import { LINKS } from '@/constants/links'
import Layout from '@/components/Layout.vue'
import { format } from 'date-fns'
import { useUser } from '@/query/useUsers'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const organizationId = route.params.organizationId as string

const { data: user, isLoading: userLoading } = useUser(authStore.user?.uid ?? '')
const { data: organization, isLoading: organizationLoading, error } = useOrganization(organizationId)

const handleInvite = () => {
  router.push(LINKS.inviteToOrganization(organizationId))
}

const shouldBeAbleToInvite = computed(() => {
  if (!organization.value || !user.value || user.value === 'not-found') {
    return false
  }

  return organization.value?.createdBy === user.value.id
})

</script>

<template>
  <Layout>
    <main class="main-content container">
      <div v-if="userLoading || organizationLoading">Loading organization...</div>
      <div v-else-if="organizationError">Error loading organization: {{ organizationError }}</div>
      <div v-else>
        <div class="organization-header">
          <h1>{{ organization?.name }} <span v-if="user?.activeOrganizationId === organizationId" class="active-badge">Active</span> </h1>
          <div class="organization-actions">
            <button v-if="shouldBeAbleToInvite" @click="handleInvite" class="invite-button">Invite Someone</button>
          </div>
        </div>

        <!-- TODO: Add organization content -->
        <div class="organization-content">
          <p>Created since {{ format(organization?.createdAt?.toDate(), 'MMMM dd, yyyy') }}</p>
        </div>
        <!-- <div class="organization-content">
          <div class="organization-info">
            <p>Created by: {{ organization?.createdBy }}</p>
            <p>
              Created at: {{ new Date(organization?.createdAt?.toDate()).toLocaleDateString() }}
            </p>
          </div>
        </div> -->
      </div>
    </main>
  </Layout>
</template>

<style lang="scss" scoped>
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
    background-color: #24a34e;
    color: white;
    border-radius: 6px;
    padding: 0.25rem 0.5rem;
    position: absolute;
    left: 0;
    top: -1.2rem;
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
</style>
