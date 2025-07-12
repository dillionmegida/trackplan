<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { serverTimestamp, Timestamp } from 'firebase/firestore'
import { useAuthStore } from '@/stores/auth'
import { useCreateProgram } from '@/query/usePrograms'
import Layout from '@/components/Layout.vue'
import { toast } from 'vue3-toastify'
import { LINKS } from '@/constants/links'
import BackIcon from '@/components/icons/BackIcon.vue'
import { RouterLink } from 'vue-router'
import { useUser } from '@/query/useUsers'
import { NOT_FOUND } from '@/query/useUsers'
import InfoBlock from '@/components/InfoBlock.vue'

const router = useRouter()
const authStore = useAuthStore()
const { mutateAsync: createProgram, isPending, error: createProgramError } = useCreateProgram()
const { data: user } = useUser(authStore.user?.uid ?? '')

const program = ref({
  title: '',
  date: '',
  description: '',
  color: '#000',
})

const isAbleToCreateProgramInThisOrganization = computed(() => {
  if (!user.value) return false

  return user.value.activeOrganizationId === user.value.id
})

const submit = async () => {
  if (!authStore.user || !user.value || user.value?.name === NOT_FOUND) {
    toast('You must be logged in to create a program.')
    return
  }

  if (!isAbleToCreateProgramInThisOrganization.value) {
    toast('You do not have permission to create a program in this organization.')
    return
  }

  if (!user.value.activeOrganizationId) {
    toast('You must select an organization to create a program.')
    return
  }

  const programData = {
    title: program.value.title.trim(),
    date: Timestamp.fromDate(new Date(program.value.date)),
    description: program.value.description.trim(),
    organizationId: user.value.activeOrganizationId,
    createdAt: serverTimestamp() as Timestamp,
    createdBy: user.value.id,
    updatedAt: serverTimestamp() as Timestamp,
    updatedBy: user.value.id,
    trashDate: null,
    color: program.value.color,
    meta: {
      totalItems: 0,
      totalCompletedItems: 0,
    },
  }

  try {
    const { id } = await createProgram({ data: programData })
    router.push(LINKS.program(id))
  } catch {
    toast.error('Failed to create program. Please try again.')
    return
  }
}

const allFieldsFilled = computed(() => {
  return program.value.title !== '' && program.value.date !== ''
})
</script>

<template>
  <Layout>
    <div v-if="!isAbleToCreateProgramInThisOrganization" class="container">
      <InfoBlock
        variant="error"
        :message="'You do not have permission to create a program in this organization.'"
      />
    </div>
    <form v-else @submit.prevent="submit" class="form-container">
      <div class="container">
        <div class="form-wrapper">
          <RouterLink class="back-link" :to="LINKS.home"><BackIcon /> Back to Programs</RouterLink>
          <h1>Create Program</h1>
          <p class="subtitle">You are creating a new program under your personal organization.</p>
          <div class="forms">
            <div class="form-card container">
              <div class="input-group">
                <label for="title">Program Title *</label>
                <input type="text" v-model="program.title" placeholder="Program Title" required />
              </div>
              <div class="input-group">
                <label for="description">Description</label>
                <span class="description">Optionally, add a little description</span>
                <input type="text" v-model="program.description" placeholder="Description" />
              </div>
              <div class="input-group">
                <label for="date">Program Date *</label>
                <input type="date" v-model="program.date" required />
              </div>
              <div class="input-group">
                <label for="color">Color</label>
                <span class="description"
                  >Optionally, you can select a nice color theme for your program</span
                >
                <input type="color" id="color" v-model="program.color" required />
              </div>
              <!-- TODO: Select checklist template -->
              <button class="btn" type="submit" :disabled="isPending || !allFieldsFilled">
                <span v-if="isPending">Creating...</span>
                <span v-else>Create Program</span>
              </button>
            </div>

            <div class="form-card container">
              <p class="subtitle">
                When you create a program, you can add categories to group related checklists.
              </p>
            </div>
          </div>
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
  padding-bottom: 10rem;
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
  font-weight: 400;
  line-height: 1.5;
}

.forms {
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
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
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;

  label {
    font-size: 0.9375rem;
    font-weight: 500;
    color: #374151;
  }

  .description {
    color: #64748b;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
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

    &[type='color'] {
      width: 100%;
      padding: 0;
      border: none;
      border-radius: 0;
      cursor: pointer;
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