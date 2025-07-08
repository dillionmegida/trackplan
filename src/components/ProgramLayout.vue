<script setup lang="ts">
import Layout from './Layout.vue'
import { useProgram } from '@/query/usePrograms'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import InfoBlock from '@/components/InfoBlock.vue'
import { useUser } from '@/query/useUsers'

const route = useRoute()
const programId = route.params.id as string

const { data: program, isLoading, error } = useProgram(programId)

const authStore = useAuthStore()

const { data: user } = useUser(authStore.user?.uid || '')

const userHasAccess = computed(() => {
  if (isLoading.value || !program.value) return 'loading'

  const userOrganizationIds = user.value?.organizationIds
  if (!userOrganizationIds || !userOrganizationIds.length || user.value === 'not-found') return 'noAccess'

  return userOrganizationIds.includes(program.value.organizationId) ? 'hasAccess' : 'noAccess'
})
</script>

<template>
  <Layout>
    <slot v-if="userHasAccess === 'hasAccess'" />
    <div v-else-if="userHasAccess === 'noAccess'" class="container">
      <InfoBlock variant="error" message="You do not have access to this program." />
    </div>
    <div v-else-if="userHasAccess === 'loading'" class="container">Loading...</div>
  </Layout>
</template>