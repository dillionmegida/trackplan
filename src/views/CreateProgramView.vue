<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { serverTimestamp, Timestamp } from 'firebase/firestore'
import { useAuthStore } from '@/stores/auth'
import { useCreateProgram } from '@/query/usePrograms'
import Layout from '@/components/Layout.vue'
import { toast } from 'vue3-toastify'
import { LINKS } from '@/constants/links'

const router = useRouter()
const authStore = useAuthStore()
const { mutateAsync: createProgram, isPending, error: createProgramError } = useCreateProgram()

const program = ref({
  title: '',
  date: '',
  description: '',
})

const submit = async () => {
  if (!authStore.user) {
    toast('You must be logged in to create a program.')
    return
  }

  const programData = {
    title: program.value.title.trim(),
    date: Timestamp.fromDate(new Date(program.value.date)),
    description: program.value.description.trim(),
    organizationId: authStore.user.uid,
    createdAt: serverTimestamp() as Timestamp,
    createdBy: authStore.user.uid,
    updatedAt: serverTimestamp() as Timestamp,
    updatedBy: authStore.user.uid,
  }

  try {
    await createProgram({ data: programData })
  } catch {
    toast.error('Failed to create program. Please try again.')
    return
  }

  router.push(LINKS.home)
}

const allFieldsFilled = computed(() => {
  return program.value.title !== '' && program.value.date !== ''
})
</script>

<template>
  <Layout>
    <form @submit.prevent="submit" class="form-container">
      <div class="form-wrapper">
        <h1>Create Program</h1>
        <p class="subtitle">You are creating a new program under your personal organization.</p>
        <div class="form-card">
          <div class="input-group">
            <label for="title">Program Title</label>
            <input type="text" v-model="program.title" placeholder="Program Title" />
          </div>
          <div class="input-group">
            <label for="description">Description</label>
            <input type="text" v-model="program.description" placeholder="Description" />
          </div>
          <div class="input-group">
            <label for="date">Program Date</label>
            <input type="date" v-model="program.date" />
          </div>
          <!-- TODO: Select checklist template -->
          <button class="btn" type="submit" :disabled="isPending || !allFieldsFilled">
            <span v-if="isPending">Creating...</span>
            <span v-else>Create Program</span>
          </button>
        </div>
      </div>
    </form>
  </Layout>
</template>

<style lang="scss" scoped>
.form-container {
  align-items: flex-start;
  display: flex;
  justify-content: center;
  gap: 1rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
  padding: 6rem 1.5rem 1.5rem;
}

.form-wrapper {
  width: 100%;
  margin: 0 auto;
  max-width: 500px;
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

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  }
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;

  label {
    font-size: 0.9375rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.25rem;
  }

  input {
    padding: 0.75rem 1rem;
    font-size: 1rem;
    line-height: 1.5;
    color: #111827;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

    &::placeholder {
      color: #9ca3af;
      opacity: 1;
    }

    &:focus {
      border-color: #3b82f6;
      outline: 0;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    &[type='date'] {
      /* appearance: none; */
      /* background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E"); */
      /* background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 1.25rem;
      padding-right: 2.5rem; */
    }
  }

  /* Add some spacing between input groups */
  & + .input-group {
    /* margin-top: 0.5rem; */
  }
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: white;
  background-color: #3b82f6;
  border: none;
  border-radius: 6px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }
}
</style>