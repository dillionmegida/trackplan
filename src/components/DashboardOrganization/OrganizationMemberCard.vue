<script lang="ts" setup>
import { useRemoveMemberFromOrganization } from '@/query/useOrganizations'
import type { UserType } from '@/types/User'
import { useAuthStore } from '@/stores/auth'
import { RouterLink } from 'vue-router';
import { LINKS } from '@/constants/links';
import { collection, query, where } from 'firebase/firestore';

const authStore = useAuthStore()

const props = defineProps<{ member: UserType; organizationId: string }>()

const {
  mutateAsync: removeMemberFromOrganization,
  isPending: removeMemberFromOrganizationPending,
} = useRemoveMemberFromOrganization(props.organizationId)

const removeMember = async (id: string) => {
  if (!authStore.user?.uid) return

  const decision = window.confirm('Are you sure you want to remove this member? This will also remove them from all programs they are a member of.')
  if (!decision) return

  await removeMemberFromOrganization({
    authId: authStore.user.uid,
    userId: id,
  })
}

const isAdmin = props.organizationId === authStore.user?.uid
</script>

<template>
  <div class="member-card">
    <div class="member-avatar">
      {{ member.name?.charAt(0)?.toUpperCase() || 'U' }}
    </div>
    <div class="member-info">
      <div class="member-name">{{ member.name }}</div>
      <div class="member-email">{{ member.email }}</div>
    </div>
    <div v-if="isAdmin" class="member-actions">
      <RouterLink class="manage-access" :to="LINKS.organizationMemberAccess(props.organizationId, props.member.id)">Manage Access</RouterLink>
      <button :disabled="removeMemberFromOrganizationPending"  class="remove-btn"
        @click="removeMember(props.member.id)">
        Remove
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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

.member-actions {
  display: flex;
  gap: 0.5rem;

  button, a {
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
    font-size: 0.9rem;
    transition: background-color 0.2s;

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