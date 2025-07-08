<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { serverTimestamp } from 'firebase/firestore'
import Layout from '@/components/Layout.vue'
import { useCreateUser, useUser } from '@/query/useUsers'
import { UserType } from '@/types/User'
import { Timestamp } from 'firebase/firestore'
import { useOrganizationsForUser } from '@/query/useOrganizations'
import { toast } from 'vue3-toastify'
import { LINKS } from '@/constants/links'

const authStore = useAuthStore()
const router = useRouter()
const isLoading = ref(false)
const { mutateAsync: createUser, isPending, error } = useCreateUser(authStore.user?.uid ?? '')

const userId = useAuthStore().user?.uid
const { data: user, isLoading: userLoading, error: userError } = useUser(userId ?? '')

watch(
  user,
  () => {
    console.log('in onboarding page')
    if (user.value && user.value !== 'not-found') {
      router.push({ name: 'home' })
    }
  },
  { immediate: true }
)

const confirmDetails = async () => {
  const userId = authStore.user.uid

  const userObj: UserType = {
    id: userId,
    name: authStore.user.displayName,
    email: authStore.user.email,
    organizationIds: [userId], // TODO: only do this when they create organization
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
    onboarded: true,
  }

  await createUser({ data: userObj })
  router.push(LINKS.home + '?new=true')
}
</script>

<template>
  <Layout>
    <div class="onboarding-container">
      <div class="onboarding-header">
        <h1>Welcome to TrackPlan</h1>
        <p class="subtitle">We've got your details from Google</p>
      </div>

      <div class="confirmation-card">
        <div class="user-avatar">
          <img
            v-if="authStore.user?.photoURL"
            :src="authStore.user.photoURL"
            :alt="authStore.user.displayName"
            class="avatar"
          />
          <div v-else class="avatar-placeholder">
            {{ authStore.user?.displayName?.charAt(0) || 'U' }}
          </div>
        </div>

        <div class="user-details">
          <h2>{{ authStore.user?.displayName || 'User' }}</h2>
          <p class="email">{{ authStore.user?.email }}</p>
        </div>

        <p class="confirmation-text">
          Click the button below to confirm your details. This will create a TrackPlan account.
        </p>

        <div v-if="error" class="error-message">{{ error }}</div>

        <div class="form-actions">
          <button @click="confirmDetails" class="btn btn-primary" :disabled="isLoading">
            <span v-if="isLoading">Confirming...</span>
            <span v-else>Yes, Continue to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  </Layout>
</template>

<style lang="scss" scoped>
.onboarding-container {
  max-width: 480px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
}

.onboarding-header {
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: #1a1a1a;
  }

  .subtitle {
    color: #64748b;
    font-size: 1.125rem;
  }
}

.confirmation-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.user-avatar {
  margin-bottom: 1.5rem;

  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #e2e8f0;
  }

  .avatar-placeholder {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #3b82f6;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 600;
    margin: 0 auto;
  }
}

.user-details {
  margin-bottom: 2rem;

  h2 {
    font-size: 1.5rem;
    color: #1e293b;
    margin: 0 0 0.25rem;
  }

  .email {
    color: #64748b;
    margin: 0;
  }
}

.confirmation-text {
  color: #475569;
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;

  .btn {
    padding: 0.75rem 2rem;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 1rem;
    border: none;
    background: #3b82f6;
    color: white;
    min-width: 200px;

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      background: #2563eb;
    }
  }
}

.error-message {
  color: #dc2626;
  background: #fef2f2;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  border-left: 3px solid #dc2626;
  text-align: left;
}

@media (max-width: 640px) {
  .onboarding-container {
    padding: 1rem 0.5rem 2rem;
  }

  .confirmation-card {
    padding: 1.5rem 1rem;
  }

  .form-actions {
    .btn {
      width: 100%;
    }
  }
}
</style>