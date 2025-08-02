<script setup lang="ts">
import { useSelectActiveOrganization } from '@/query/useOrganizations'
import LoaderIcon from '@/components/icons/LoaderIcon.vue'
import { ref } from 'vue'
import { toast } from 'vue3-toastify'
import { useAuthStore } from '@/stores/auth'
import type { OrganizationType } from '@/types/Organization'

defineProps<{ organizations: OrganizationType[] }>()

const authStore = useAuthStore()

const {
  mutateAsync: selectActiveOrganization,
  isPending: selectActiveOrganizationPending,
  error: selectActiveOrganizationError,
} = useSelectActiveOrganization(authStore.user?.uid ?? '')

const organizationBeenSelected = ref('')

const selectOrganization = async (organizationId: string) => {
  if (!authStore.user?.uid) {
    toast('You must be logged in to select an organization.')
    return
  }

  organizationBeenSelected.value = organizationId

  await selectActiveOrganization({ organizationId })

  const toastMsg =
    organizationBeenSelected.value === authStore.user?.uid
      ? 'Your personal organization is selected.'
      : 'Organization selected successfully'
  toast.success(toastMsg)
  organizationBeenSelected.value = ''
}
</script>

<template>
  <div class="organizations">
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
</template>

<style scoped lang="scss">
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
</style>
