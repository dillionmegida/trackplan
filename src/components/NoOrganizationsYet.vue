<script lang="ts" setup>
import { toast } from 'vue3-toastify'
import { Timestamp } from 'firebase/firestore'
import { UserType } from '@/types/User';
import { useCreateOrganization } from '@/query/useOrganizations';
import { getFirstName } from '@/utils/string';

const props = defineProps<{user: UserType}>()

const {
  mutateAsync: createOrganization,
  isPending: createOrganizationPending,
  error: createOrganizationError,
} = useCreateOrganization()

const createOrg = async () => {
  const {user} = props

  if (!user) {
    toast('You must be logged in to create an organization.')
    return
  }

  const orgObj = {
    id: user.id,
    name: `${getFirstName(user.name)}'s Personal Org`,
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
    createdBy: user.id,
    updatedBy: user.id,
  }

  await createOrganization({
    data: orgObj,
  })
  toast.success('Your personal organization created successfully')
}
</script>

<template>
  <div class="no-organizations">
    <p>You don't belong to any organizations yet.</p>
    <button @click="createOrg" class="create-btn" :disabled="createOrganizationPending">
      <PlusIcon :size="12" />
      {{ createOrganizationPending ? 'Creating...' : 'Create Personal Organization' }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.no-organizations {
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background-color: #f8fafc;
  /* border: 1px solid #d3d9e2; */
  margin: 2rem 0;

  .create-btn {
    padding: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    color: white;
    background-color: #3b82f6;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    width: 240px;

    &:hover {
      background-color: #2563eb;
    }

    &:active {
      background-color: #1d4ed8;
    }
  }
}
</style>