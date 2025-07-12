<script lang="ts" setup>
import type { OrganizationType } from '@/types/Organization'
import type { UserType } from '@/types/User'
import OrganizationMemberCard from './OrganizationMemberCard.vue'

const props = defineProps<{
  members: UserType[]
  shouldBeAbleToInvite: boolean
  organization: OrganizationType
}>()

const membersObj: {
  admins: UserType[]
  members: UserType[]
} = {
  admins: [],
  members: [],
}

props.members.forEach((member) => {
  if (member.id === props.organization.createdBy) {
    membersObj.admins.push(member)
  } else {
    membersObj.members.push(member)
  }
})
</script>


<template>
  <div class="members-section" v-if="members?.length">
    <div class="members-category">
      <h3>Admins</h3>
      <div v-for="admin in membersObj.admins" :key="admin.id" class="member-card">
        <div class="member-avatar">
          {{ admin.displayName?.charAt(0)?.toUpperCase() || 'U' }}
        </div>
        <div class="member-info">
          <div class="member-name">{{ admin.name }}</div>
          <div class="member-email">{{ admin.email }}</div>
        </div>
      </div>
    </div>
    <div class="members-category">
      <h3>Members</h3>
      <div class="members-list">
        <OrganizationMemberCard
          v-for="member in membersObj.members"
          :key="member.id"
          :member="member"
          :organizationId="organization.id"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.members-section {
  margin-top: 2rem;

  .members-category {
    margin-bottom: 1.5rem;
  }

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
</style>