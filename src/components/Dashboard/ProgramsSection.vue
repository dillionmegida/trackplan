<script setup lang="ts">
import type { ProgramType } from '@/types/Program'
import type { UserType } from '@/types/User'
import { groupPrograms } from '@/helpers/program'
import ProgramCard from './ProgramCard.vue'

const props = defineProps<{
  programs: ProgramType[]
  loading: boolean
  error: string | null
  user: UserType | null
}>()

const { recent, remaining } = groupPrograms(props.programs)
</script>

<template>
  <section class="programs-section">
    <p v-if="loading">Loading programs...</p>
    <p v-else-if="error">{{ error }}</p>
    <div v-else-if="programs?.length === 0" class="no-programs">
      <span v-if="user?.activeOrganizationId === user?.id">Create a program to get started</span>
      <span v-else
        >You do not have access to any programs in this organization you were added to. Ask the
        organization owner to add you to programs.</span
      >
    </div>
    <div v-else>
      <div class="programs-category recent">
        <h2>Recent Programs</h2>
        <div class="programs-list">
          <ProgramCard v-for="program in recent" :key="program.id" :program="program" />
        </div>
      </div>
      <div class="programs-category">
        <div class="programs-list">
          <ProgramCard v-for="program in remaining" :key="program.id" :program="program" />
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.no-programs {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background-color: #f8fafc;
  border: 1px solid #d3d9e2;
  margin: 2rem 0;
}

.programs-category {
  padding: 2rem 0;

  &.recent {
    border-bottom: 1px solid #d3d9e2;
  }

  h2 {
    text-transform: uppercase;
    font-weight: 300;
    font-size: 1rem;
  }
}

.programs-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
  align-items: start;
}
</style>
