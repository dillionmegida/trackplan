<script setup lang="ts">
import Layout from '@/components/Layout.vue'
import { useUser } from '@/query/useUsers'
import { useAuthStore } from '@/stores/auth'
import { watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userId = useAuthStore().user?.uid
const { data: user, isLoading, error } = useUser(userId)

watch(user, () => {
  if (user.value && user.value === 'not-found') {
    console.log("User not found")
    router.push({ name: 'onboarding' })
  }
})
</script>


<template>
  <Layout>
    <main class="main-content container">
      <p v-if="isLoading">Loading...</p>
      <p v-else-if="error">{{ error }}</p>
      <p v-else-if="user !== 'not-found'">Hello {{ user.displayName }}</p>
      <p v-else>Redirecting to onboarding...</p>
    </main>
  </Layout>
</template>

<style lang="scss" scoped>
.main-content {
}
</style>