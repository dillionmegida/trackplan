<script lang="ts" setup>
import { useRemoveMemberFromOrganization } from '@/query/useOrganizations'
import type { UserType } from '@/types/User'
import { useAuthStore } from '@/stores/auth'
import { RouterLink } from 'vue-router'
import { LINKS } from '@/constants/links'
import { ref } from 'vue'
import Modal from '@/components/Modal.vue'
import { Teleport } from 'vue'

const authStore = useAuthStore()

const props = defineProps<{ member: UserType; organizationId: string }>()

const {
  mutateAsync: removeMemberFromOrganization,
  isPending: removeMemberFromOrganizationPending,
} = useRemoveMemberFromOrganization(props.organizationId)

const showDeleteModal = ref(false)

const removeMember = async (id: string) => {
  showDeleteModal.value = true
}

const confirmRemoveMember = async (id: string) => {
  if (!authStore.user?.uid) return

  await removeMemberFromOrganization({
    authId: authStore.user.uid,
    userId: id,
  })
}

const isAdmin = props.organizationId === authStore.user?.uid
</script>

<template>
  <div class="member-card">
    <div class="member-info">
      <div class="member-name">{{ member.name }}</div>
      <div class="member-email">{{ member.email }}</div>
    </div>
    <div v-if="isAdmin" class="member-actions">
      <RouterLink
        class="manage-access"
        :to="LINKS.organizationMemberAccess(props.organizationId, props.member.id)"
        >Manage Access</RouterLink
      >
      <button
        :disabled="removeMemberFromOrganizationPending"
        class="remove-btn"
        @click="removeMember(props.member.id)"
      >
        Remove
      </button>
    </div>
  </div>

  <Teleport v-if="showDeleteModal" to="body">
    <Modal
      v-model="showDeleteModal"
      title="Remove Member"
      @confirm="confirmRemoveMember(props.member.id)"
      :deleting="removeMemberFromOrganizationPending"
    >
      Are you sure you want to remove
      <span class="item-title-to-delete">{{ member.name }}</span> from this organization? This will
      also remove them from all the programs you gave them access to.
    </Modal>
  </Teleport>
</template>

<style lang="scss" scoped>
.member-card {
  display: flex;
  /* flex-wrap: wrap; */
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 550px) {
    flex-direction: column;
    align-items: flex-start !important;
    justify-content: flex-start;
    gap: 0.5rem;
  }
}

.item-title-to-delete {
  color: red;
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

.member-actions {
  display: flex;
  gap: 0.5rem;

  button,
  a {
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
    font-size: 0.9rem;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;

    @media (max-width: 768px) {
      padding: 0.25rem 0.5rem;
    }

    &.manage-access {
      background-color: #219bc1;
      color: #fff;

      &:hover {
        background-color: #1e88c7;
      }
    }

    &.remove-btn {
      background-color: #ef4444;
      color: white;

      &:hover {
        background-color: #dc2626;
      }
    }
  }
}
</style>