<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { format } from 'date-fns'
import { Timestamp } from 'firebase/firestore'
import { useAuthStore } from '@/stores/auth'
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/configs/firebase'
import Layout from '@/components/Layout.vue'
import { toast } from 'vue3-toastify'
import {
  useDeleteProgram,
  useRestoreProgramFromTrash,
  useTrashedProgramsForOrganization,
} from '@/query/usePrograms'
import { useUser } from '@/query/useUsers'

const authStore = useAuthStore()

const { mutateAsync: restoreProgramMutation, isPending: restoreProgramPending } =
  useRestoreProgramFromTrash()
const { mutateAsync: deleteProgramMutation, isPending: deleteProgramPending } = useDeleteProgram()

const { data: user, isLoading: userLoading } = useUser(authStore.user?.uid ?? '')

const organizationId = computed(() => {
  return user.value?.organizationIds?.[0]
})
const {
  data: trashedProgramsData,
  isLoading: trashedProgramsLoading,
  error: trashedProgramsError,
} = useTrashedProgramsForOrganization(organizationId)

const restoreProgram = async (programId: string) => {}

const permanentlyDeleteProgram = async (programId: string) => {
  if (
    !confirm(
      'Are you sure you want to permanently delete this program? This action cannot be undone.'
    )
  ) {
    return
  }
}

const formatDate = (date: Timestamp) => {
  return format(date.toDate(), 'MMM d, yyyy')
}
</script>

<template>
  <Layout>
    <div class="trash-view container">
      <div class="header">
        <h1>Trash</h1>
        <p>Deleted programs will be permanently removed after 30 days.</p>
      </div>

      <div v-if="userLoading ||trashedProgramsLoading" class="loading">Loading trashed programs...</div>
      <div v-else-if="trashedProgramsError" class="error">
        Error loading trashed programs. Please check back later.
      </div>
      <div v-else-if="!trashedProgramsData?.length" class="empty-state">
        <p>No programs in trash</p>
      </div>
      <div v-else class="trash-list">
        <div v-for="program in trashedProgramsData" :key="program.id" class="trash-item">
          <div class="program-info">
            <h3>{{ program.title }}</h3>
            <p class="date">Deleted on {{ formatDate(program.trashDate) }}</p>
          </div>
          <div class="actions">
            <button class="btn-restore" :disabled="restoreProgramPending">Restore</button>
            <button class="btn-delete" :disabled="deleteProgramPending">Delete Permanently</button>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>



<style scoped>
.trash-view {
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.header p {
  color: #64748b;
}

.trash-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

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

.program-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.date {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
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

.empty-state,
.loading,
.error {
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: #64748b;
}
</style>