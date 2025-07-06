<script setup lang="ts">
import Layout from '@/components/Layout.vue'
import { useUser } from '@/query/useUsers'
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'

const userId = useAuthStore().user?.uid
const {
  query: { data: user, isLoading, error },
} = useUser(userId)

onMounted(() => {
  console.log({ user })
})
</script>


<template>
  <Layout>
    <main class="main-content container">
      <p v-if="isLoading">Loading...</p>
      <p v-else-if="error">{{ error }}</p>
      <p v-else-if="user">Hello {{ user.displayName }}</p>
      <p v-else>No user found</p>
    </main>
  </Layout>
</template>

<style lang="scss" scoped>
.main-content {
}
</style>