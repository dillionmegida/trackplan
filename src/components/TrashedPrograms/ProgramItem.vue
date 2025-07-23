<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth'
import type { ProgramType } from '@/types/Program'
import { format } from 'date-fns'
import type { Timestamp } from 'firebase/firestore'
import { computed } from 'vue'
import { toast } from 'vue3-toastify'
import { useRestoreProgramFromTrash, useDeleteProgram } from '@/query/usePrograms'

const props = defineProps<{
  program: ProgramType
}>()

const authStore = useAuthStore()

const program = computed(() => props.program)

const { mutateAsync: restoreProgramMutation, isPending: restoreProgramPending } =
  useRestoreProgramFromTrash()
const { mutateAsync: deleteProgramMutation, isPending: deleteProgramPending } = useDeleteProgram()

const formatDate = (date: Timestamp) => {
  return format(date.toDate(), 'MMM d, yyyy')
}

const restoreProgram = async (programId: string) => {
  if (!authStore.user) {
    return toast.error('You must be logged in to restore a program')
  }

  await restoreProgramMutation({ programId, userId: authStore.user.uid })
}

const permanentlyDeleteProgram = async (programId: string) => {
  if (
    !confirm(
      'Are you sure you want to permanently delete this program? This action cannot be undone.'
    )
  ) {
    return
  }
}
</script>

<template>
  <div class="trash-item">
    <div class="program-info">
      <h3>{{ program.title }}</h3>
      <p v-if="program.trashDate" class="date">Deleted on {{ formatDate(program.trashDate) }}</p>
    </div>
    <div class="actions">
      <button
        @click="restoreProgram(program.id)"
        class="btn-restore"
        :disabled="restoreProgramPending"
      >
        {{ restoreProgramPending ? 'Restoring...' : 'Restore' }}
      </button>
      <button class="btn-delete" :disabled="deleteProgramPending">
        {{ deleteProgramPending ? 'Deleting...' : 'Delete Permanently' }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.trash-item {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.actions {
  display: flex;
  gap: 0.75rem;
}

.btn-restore,
.btn-delete {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-restore {
  background: #f0f9ff;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.btn-restore:hover {
  background: #e0f2fe;
}

.btn-delete {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.btn-delete:hover {
  background: #fee2e2;
}

.btn-restore:disabled,
.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>