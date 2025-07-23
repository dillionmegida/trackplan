<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
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
import { LINKS } from '@/constants/links'
import BackIcon from '@/components/icons/BackIcon.vue'
import ProgramItem from '@/components/TrashedPrograms/ProgramItem.vue'

const authStore = useAuthStore()

const { mutateAsync: restoreProgramMutation, isPending: restoreProgramPending } =
  useRestoreProgramFromTrash()
const { mutateAsync: deleteProgramMutation, isPending: deleteProgramPending } = useDeleteProgram()

const { data: user, isLoading: userLoading, error: userError } = useUser(authStore.user?.uid ?? '')

const organizationId = computed(() => {
  if (!user.value) return null

  return user.value.activeOrganizationId
})

const {
  data: trashedProgramsData,
  isLoading: trashedProgramsLoading,
  error: trashedProgramsError,
} = useTrashedProgramsForOrganization(organizationId, authStore.user?.uid ?? '')
</script>

<template>
  <Layout>
    <div class="trash-view container">
      <RouterLink class="back-link" :to="LINKS.my_account"
        ><BackIcon /> Back to My Account</RouterLink
      >
      <div class="header">
        <h1>Trash</h1>
        <p>
          Here, you can find all the programs that you have deleted under the active organization.
          Deleted programs will be permanently removed after 30 days.
        </p>
      </div>

      <div v-if="userLoading || trashedProgramsLoading" class="loading">
        Loading trashed programs...
      </div>
      <div v-else-if="trashedProgramsError || userError" class="error">
        Error loading trashed programs. Please check back later.
      </div>
      <div v-else-if="!trashedProgramsData?.length" class="empty-state">
        <p>No programs in trash</p>
      </div>
      <div v-else class="trash-list">
        <ProgramItem v-for="program in trashedProgramsData" :key="program.id" :program="program" />
      </div>
    </div>
  </Layout>
</template>



<style lang="scss" scoped>
.trash-view {
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
  padding: 0 0 10rem;
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