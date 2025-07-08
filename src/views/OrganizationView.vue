<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOrganization } from '@/query/useOrganizations'
import { LINKS } from '@/constants/links'
import Layout from '@/components/Layout.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const organizationId = route.params.id as string

const { data: organization, isLoading, error } = useOrganization(organizationId)

const handleInvite = () => {
  router.push(LINKS.inviteToOrganization(organizationId))
}
</script>

<template>
  <Layout>
    <main class="main-content container">
      <div class="organization-container">
        <div class="organization-header">
          <h1>{{ organization?.name || 'Loading...' }}</h1>
          <div class="organization-actions">
            <button @click="handleInvite" class="invite-button">
              Invite Team Member
            </button>
          </div>
        </div>

        <div class="organization-content">
          <p v-if="isLoading">Loading organization details...</p>
          <p v-else-if="error">{{ error }}</p>
          <div v-else-if="organization">
            <div class="organization-info">
              <p>Created by: {{ organization.createdBy }}</p>
              <p>Created at: {{ new Date(organization.createdAt?.toDate()).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </Layout>
</template>

<style lang="scss" scoped>
.organization-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.organization-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 1.5rem;
    color: #1e293b;
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
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.organization-info {
  p {
    margin: 0.5rem 0;
    color: #334155;
  }
}
</style>
