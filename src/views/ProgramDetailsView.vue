<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { format } from 'date-fns'
import { useProgram } from '@/query/usePrograms'
import Layout from '@/components/Layout.vue'
import EditIcon from '@/components/icons/EditIcon.vue'
import { LINKS } from '@/constants/links'

const route = useRoute()
const programId = route.params.id as string

const { data: program, isLoading, error } = useProgram(programId)

const formatDate = (timestamp: any) => {
  return format(timestamp.toDate(), 'MMMM d, yyyy')
}
</script>

<template>
  <Layout>
    <div class="program-details">
      <div v-if="isLoading" class="loading">Loading program details...</div>

      <div v-else-if="error" class="error">Error loading program: {{ error }}</div>

      <div v-else-if="program" class="program-content">
        <div class="title-block">
          <h1>{{ program.title }}</h1>
          <RouterLink :to="LINKS.program_edit(program.id)" class="edit-program">
            <EditIcon />
          </RouterLink>
        </div>
        <p class="program-date">{{ formatDate(program.date) }}</p>

        <p class="program-description">{{ program.description }}</p>
      </div>
    </div>
  </Layout>
</template>

<style lang="scss" scoped>
.program-details {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.error {
  text-align: center;
  padding: 2rem;
  color: #ef4444;
}

.program-content {
  .title-block {
    display: flex;
    align-items: center;
    gap: 1rem;

    h1 {
      font-size: 2rem;
      color: #1e293b;
    }

    .edit-program {
      color: #64748b;
    }
  }

  .program-date {
    font-size: 1rem;
    font-weight: 300;
    color: #64748b;
    margin-bottom: 1rem;
  }
}

.program-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  background: #f8fafc;
  border-radius: 0.75rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.value {
  font-size: 1rem;
  color: #1e293b;
}
</style>