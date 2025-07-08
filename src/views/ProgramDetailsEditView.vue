<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Timestamp } from 'firebase/firestore'
import { useAuthStore } from '@/stores/auth'
import { useProgram, useUpdateProgram } from '@/query/usePrograms'
import { toast } from 'vue3-toastify'
import { LINKS } from '@/constants/links'
import BackIcon from '@/components/icons/BackIcon.vue'
import CategoriesSection from '@/components/DashboardProgram/CategoriesSection.vue'
import ProgramLayout from '@/components/ProgramLayout.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const programId = route.params.id as string

const { data: program, isLoading, error } = useProgram(programId)
const { mutateAsync: updateProgram, isPending } = useUpdateProgram()

const form = ref({
  title: '',
  date: '',
  description: '',
})

watch(
  program,
  (newProgram) => {
    if (newProgram) {
      form.value.title = newProgram.title
      form.value.date = newProgram.date.toDate().toISOString().split('T')[0]
      form.value.description = newProgram.description
    }
  },
  { immediate: true }
)

const submit = async () => {
  if (!authStore.user) {
    toast('You must be logged in to edit a program.')
    return
  }

  const programData = {
    id: programId,
    title: form.value.title.trim(),
    date: Timestamp.fromDate(new Date(form.value.date)),
    description: form.value.description.trim(),
    organizationId: authStore.user?.uid,
    updatedAt: Timestamp.now(),
    updatedBy: authStore.user?.uid,
  }

  await updateProgram({ data: programData })
  toast.success('Program updated successfully')
  router.push(LINKS.program(programId))
}

const hasChanges = computed(() => {
  if (!program.value) return false

  return (
    form.value.title.trim() !== program.value.title ||
    form.value.date !== program.value.date.toDate().toISOString().split('T')[0] ||
    (form.value.description !== '' && form.value.description?.trim() !== program.value.description)
  )
})

const allRequiredFieldsFilled = computed(() => {
  return program.value && form.value.title.trim() !== '' && form.value.date !== ''
})
</script>

<template>
  <ProgramLayout>
    <div class="form-container">
      <div class="form-wrapper">
        <RouterLink class="back-link" :to="LINKS.program(programId)"
          ><BackIcon /> Back to Program</RouterLink
        >
        <h1>Edit Program</h1>
        <p class="subtitle">Update program details</p>

        <div v-if="isLoading" class="loading">Loading program details...</div>

        <div v-else-if="error" class="error">Error loading program: {{ error }}</div>

        <div v-if="program" class="forms">
          <form v-if="program" @submit.prevent="submit" class="form-card">
            <div class="input-group">
              <label for="title">Program Title</label>
              <input
                type="text"
                id="title"
                v-model="form.title"
                placeholder="Program Title"
                required
              />
            </div>

            <div class="input-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                v-model="form.description"
                placeholder="Description"
              ></textarea>
            </div>

            <div class="input-group">
              <label for="date">Program Date</label>
              <input type="date" id="date" v-model="form.date" required />
            </div>

            <button
              type="submit"
              :disabled="!allRequiredFieldsFilled || !hasChanges || isPending"
              class="submit-btn"
            >
              {{ isPending ? 'Saving...' : 'Save Changes' }}
            </button>
          </form>

          <div class="form-card">
            <CategoriesSection />
          </div>
        </div>
      </div>
    </div>
  </ProgramLayout>
</template>

<style lang="scss" scoped>
.form-container {
  align-items: flex-start;
  display: flex;
  justify-content: center;
  gap: 1rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
  padding: 6rem 1.5rem 10rem;
}

.form-wrapper {
  width: 100%;
  margin: 0 auto;
  max-width: 500px;
}

.back-link {
  align-items: center;
  border-radius: 6px;
  font-size: 0.9rem;
  border: 1px solid #d1d5db;
  display: inline-flex;
  padding: 0.2rem 0.4rem 0.2rem 0.2rem;
  color: #64748b;
  gap: 0.2rem;
  margin-bottom: 1rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background-color: #d5dee7;
    color: #1e293b;
  }
}

h1 {
  font-weight: 300;
  font-size: clamp(1.25rem, 5vw, 1.5rem);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #64748b;
  font-size: 1rem;
  margin-bottom: 1rem;
  font-weight: 400;
  line-height: 1.5;
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

.form-container {
  display: flex;
  justify-content: center;
}

.forms {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.input-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #1e293b;
  font-weight: 500;
}

input,
textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background-color: #2563eb;
}

.submit-btn:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}
</style>
