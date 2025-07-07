<script setup lang="ts">
import Layout from '@/components/Layout.vue'
import { useUser } from '@/query/useUsers'
import { useAuthStore } from '@/stores/auth'
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { getFirstName } from '@/utils/string'
import { RouterLink } from 'vue-router'
import { useProgramsForUser } from '@/query/usePrograms'
import { LINKS } from '@/constants/links'


const router = useRouter()
const userId = useAuthStore().user?.uid

const { data: user, isLoading, error } = useUser(userId)
const { data: programs, isLoading: programsLoading, error: programsError } = useProgramsForUser(userId)

watch(user, () => {
  if (user.value && user.value === 'not-found') {
    console.log('User not found')
    router.push({ name: 'onboarding' })
  }
})
</script>


<template>
  <Layout>
    <main class="main-content container">
      <p v-if="isLoading">Loading...</p>
      <p v-else-if="error">{{ error }}</p>
      <p v-else-if="user === 'not-found'">Redirecting to onboarding...</p>
      <div v-else>
        <div class="top-header">
          <h1>Programs</h1>
          <RouterLink class="create-link" :to="LINKS.createProgram">Create a Program</RouterLink>
        </div>
        <section class="programs-section">
          <p v-if="programsLoading">Loading programs...</p>
          <p v-else-if="programsError">{{ programsError }}</p>
          <div v-else-if="programs?.length === 0" class="no-programs">
            No programs found
          </div>
          <div v-else class="programs-list">
            <RouterLink v-for="program in programs" :key="program.id" :to="LINKS.program(program.id)" class="program-item">
              {{ program.title }}
            </RouterLink>
          </div>
        </section>
      </div>
    </main>
  </Layout>
</template>

<style lang="scss" scoped>
.main-content {
}

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h1 {
    font-weight: 300;
    font-size: 1.2rem;
  }

  .create-link {
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 500;
    color: white;
    background-color: #3b82f6;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .create-link:hover {
    background-color: #2563eb;
  }

  .create-link:active {
    background-color: #1d4ed8;
  }
}

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

.programs-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.program-item {
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  background-color: #f8fafc;
  border: 1px solid #d3d9e2;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.program-item:hover {
  background-color: #e5e7eb;
}

.program-item:active {
  background-color: #d1d5db;
}
</style>