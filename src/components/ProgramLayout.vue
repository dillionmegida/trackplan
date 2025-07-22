<script setup lang="ts">
import Layout from './Layout.vue'
import { useProgram } from '@/query/usePrograms'
import { useRoute } from 'vue-router'
import { computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import InfoBlock from '@/components/InfoBlock.vue'
import { NOT_FOUND, useUser } from '@/query/useUsers'
import { provide } from 'vue'
import { useOrganization } from '@/query/useOrganizations'

const route = useRoute()
const programId = route.params.id as string

const { data: program, isLoading: programLoading, error: programError } = useProgram(programId)

const organizationId = computed(() => {
  if (!program.value) return ''

  return program.value.organizationId
})

const {
  data: organization,
  isLoading: organizationLoading,
  error: organizationError,
} = useOrganization(organizationId)

const authStore = useAuthStore()

const userHasAccess = computed(() => {
  if (programLoading.value || organizationLoading.value) return 'loading'
  if (programError.value || !program.value) return 'noAccess'
  if (!organization.value) return 'noAccess'

  return organization.value.memberIds.includes(authStore.user?.uid || '') ? 'hasAccess' : 'noAccess'
})

provide('program', program)
provide('organization', organization)
</script>

<template>
  <Layout>
    <template v-if="userHasAccess === 'hasAccess'">
      <slot />
    </template>
    <div v-else-if="userHasAccess === 'noAccess'" class="container">
      <InfoBlock variant="error" message="You do not have access to this program." />
    </div>
    <div v-else-if="userHasAccess === 'loading'" class="container">Loading program...</div>
  </Layout>
</template>