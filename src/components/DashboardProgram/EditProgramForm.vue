<script lang="ts" setup>
import { inject, ref, watch } from 'vue'
import type { Ref } from 'vue'
import type { ProgramType } from '@/types/Program'
import { LINKS } from '@/constants/links'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue3-toastify'
import { Timestamp } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { useUpdateProgram } from '@/query/usePrograms'
import { computed } from 'vue'
import BackIcon from '@/components/icons/BackIcon.vue'
import CategoriesSection from '@/components/DashboardProgram/CategoriesSection.vue'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const programId = route.params.id as string

const program = inject('program') as Ref<ProgramType>

const { mutateAsync: updateProgram, isPending } = useUpdateProgram()

const form = ref({
  title: program.value.title,
  date: program.value.date.toDate().toISOString().split('T')[0],
  description: program.value.description,
  color: program.value.color,
})

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
    color: form.value.color,
    trashDate: null,
  }

  await updateProgram({ data: programData })
  router.push(LINKS.program(programId))
}

const hasChanges = computed(() => {
  return (
    form.value.title.trim() !== program.value.title ||
    form.value.date !== program.value.date.toDate().toISOString().split('T')[0] ||
    form.value.description?.trim() !== program.value.description ||
    form.value.color !== program.value.color
  )
})

const allRequiredFieldsFilled = computed(() => {
  return form.value.title.trim() !== '' && form.value.date !== ''
})
</script>

<template>
  <div class="form-container">
    <div class="container">
      <div class="form-wrapper">
        <RouterLink class="back-link" :to="LINKS.program(programId)"
          ><BackIcon /> Back to Program</RouterLink
        >
        <h1>Edit Program</h1>
        <p class="subtitle">Update program details</p>

        <div class="forms">
          <form @submit.prevent="submit" class="form-card container">
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

            <div class="input-group">
              <label for="color">Color</label>
              <input type="color" id="color" v-model="form.color" required />
            </div>

            <button
              type="submit"
              :disabled="!allRequiredFieldsFilled || !hasChanges || isPending"
              class="submit-btn"
            >
              {{ isPending ? 'Saving...' : 'Save Changes' }}
            </button>
          </form>

          <div class="form-card container">
            <CategoriesSection />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form-container {
  align-items: flex-start;
  display: flex;
  justify-content: center;
  gap: 1rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
  padding-bottom: 10rem;
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

.forms {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
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

input[type='color'] {
  width: 100%;
  padding: 0;
  border: none;
  border-radius: 0;
  cursor: pointer;
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