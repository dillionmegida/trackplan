<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useInviteUser } from '@/query/useInvites'
import { toast } from 'vue3-toastify'
import { LINKS } from '@/constants/links'
import Layout from '@/components/Layout.vue'
import { useOrganization } from '@/query/useOrganizations'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { NOT_FOUND, useUser } from '@/query/useUsers'
import InfoBlock from '@/components/InfoBlock.vue'

const route = useRoute()
const organizationId = route.params.organizationId as string
const email = ref('')

const authUser = useAuthStore().user

const {data: user, isLoading: userLoading, error: userError} = useUser(authUser?.uid ?? '')
const { mutateAsync: inviteUser, isPending, error } = useInviteUser(organizationId)
const {
  data: organization,
  isLoading: organizationLoading,
  error: organizationError,
} = useOrganization(organizationId)

const handleSubmit = async () => {
  if (!email.value.trim()) {
    toast.error('Please enter an email address')
    return
  }

  await inviteUser({ email: email.value })
  email.value = ''
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
      <div v-if="organizationLoading || userLoading" class="loading">Loading organization...</div>
      <div v-else-if="organizationError" class="error">
        Error loading organization: {{ organizationError }}
      </div>
      <div v-else-if="userError" class="error">
        Error loading user: {{ userError }}
      </div>
      <div v-else-if="!shouldBeAbleToInvite">
        <InfoBlock variant="error" message="You are not authorized to invite team members to this organization." />
      </div>
      <div v-else class="invite-container">
        <div class="invite-header">
          <h1>Invite Team Member</h1>
          <span class="organization-name">'{{ organization?.name }}' Organization</span>
          <p class="subtitle">
            Add a team member to your organization by entering their email address.
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="invite-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="Enter email address"
              :disabled="isPending"
              required
            />
          </div>

          <button type="submit" class="invite-button" :disabled="isPending || !email">
            <span v-if="isPending">Sending...</span>
            <span v-else>Send Invitation</span>
          </button>

          <RouterLink :to="LINKS.organization(organizationId)" class="back-link">
            Cancel
          </RouterLink>
        </form>
      </div>
    </main>
  </Layout>
</template>

<style lang="scss" scoped>
.invite-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}

.invite-header {
  margin-bottom: 2rem;

  h1 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #1e293b;
  }

  .organization-name {
    display: inline-block;
    font-size: 0.9rem;
    color: black;
    margin-bottom: 1rem;
    background-color: #ecee73;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
  }

  .subtitle {
    color: #64748b;
    font-size: 0.9rem;
  }
}

.invite-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 0.9rem;
    color: #334155;
  }

  input {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 0.9rem;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #3b82f6;
    }

    &:disabled {
      background-color: #f8fafc;
      cursor: not-allowed;
    }
  }
}

.invite-button {
  padding: 0.75rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #2563eb;
  }

  &:disabled {
    background-color: #cbd5e1;
  }
}

.back-link {
  text-align: center;
  padding: 0.75rem;
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.9rem;
  border-radius: 6px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f1f5f9;
  }
}
</style>