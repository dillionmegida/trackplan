<script setup lang="ts">
import Layout from './Layout.vue'
import { useProgram } from '@/query/usePrograms'
import { useRoute } from 'vue-router'
import { computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import InfoBlock from '@/components/InfoBlock.vue'
import { useUser } from '@/query/useUsers'
import { provide } from 'vue'

const route = useRoute()
const programId = route.params.id as string

const { data: program, isLoading: programLoading, error: programError } = useProgram(programId)

const authStore = useAuthStore()

const { data: user, isLoading: userLoading, error: userError } = useUser(authStore.user?.uid || '')

const userHasAccess = computed(() => {
  if (programLoading.value || userLoading.value) return 'loading'

  if (programError.value || userError.value || !program.value) return 'noAccess'

  const userOrganizationIds = user.value?.organizationIds
  if (!userOrganizationIds || !userOrganizationIds.length || user.value === 'not-found')
    return 'noAccess'

  return userOrganizationIds.includes(program.value.organizationId) ? 'hasAccess' : 'noAccess'
})

provide('program', program)
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