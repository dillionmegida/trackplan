<script lang="ts" setup>
import { useProgramChecklists } from '@/query/useProgramChecklists'
import { useRoute } from 'vue-router'
import { toast } from 'vue3-toastify'
import { useDeleteProgramChecklistItem } from '@/query/useProgramChecklists'
import CloseIcon from '@/components/icons/CloseIcon.vue'
import CheckIcon from '@/components/icons/CheckIcon.vue'
import { computed } from 'vue'
import type { ProgramChecklistItemType } from '@/types/PrgramChecklist'
import { snakeToWordCase } from '@/utils/string'
import { useProgramCategories } from '@/query/useProgramCategories'
import { useUpdateProgramChecklistItem } from '@/query/useProgramChecklists'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const programId = route.params.id as string

const { data: checklists } = useProgramChecklists(programId)
const { data: categories } = useProgramCategories(programId)

const groupedChecklists = computed(() => {
  if (!checklists.value || !categories.value) {
    return {} as Record<string, ProgramChecklistItemType[]>
  }

  const categoryMap = new Map(categories.value.map((category) => [category.id, category.name]))
  const group: Record<string, ProgramChecklistItemType[]> = {
    uncategorized: [],
  }

  checklists.value?.forEach((checklist) => {
    const categoryId = checklist.categoryId as string
    const categoryName: string = categoryId
      ? (categoryMap.get(categoryId) as string) || 'uncategorized'
      : 'uncategorized'

    if (!group[categoryName]) {
      group[categoryName] = []
    }
    group[categoryName].push(checklist)
  })

  return group
})

const auth = useAuthStore()

const { mutateAsync: deleteChecklistMutation, isPending: deleteChecklistPending } =
  useDeleteProgramChecklistItem()

async function deleteChecklist(checklistId: string) {
  await deleteChecklistMutation({ programId, checklistId })
}

const { mutateAsync: updateChecklistMutation, isPending: updateChecklistPending } =
  useUpdateProgramChecklistItem()

async function updateChecklist(checklistId: string, isCompleted: boolean) {
  const targetChecklist = checklists.value?.find((checklist) => checklist.id === checklistId)

  if (!auth.user) {
    throw new Error('You are not logged in')
  }

  if (!targetChecklist) {
    throw new Error('Checklist item not found')
  }

  const checklistItemObj = {
    ...targetChecklist,
    isCompleted,
    completedBy: auth.user.uid,
  }

  await updateChecklistMutation({ programId, checklistId, checklistItemObj })
}
</script>


<template>
  <div class="checklists-section">
    <div
      v-for="(checklists, category) in groupedChecklists"
      :key="category"
      class="checklist-category"
    >
      <h2 v-if="checklists.length > 0">{{ snakeToWordCase(category) }}</h2>
      <label v-for="checklist in checklists" :key="checklist.id" class="checklist-item">
        <!-- <label class="checklist-container"> -->
        <div class="checklist-checkbox">
          <input
            @change="updateChecklist(checklist.id, checklist.isCompleted)"
            type="checkbox"
            v-model="checklist.isCompleted"
            class="checklist-checkbox-input"
          />
          <span class="checklist-checkbox-custom">
            <CheckIcon size="16" />
          </span>
        </div>

        <div class="checklist-title" :class="{ checked: checklist.isCompleted }">
          {{ checklist.title }}
        </div>
        <button
          @click.stop="deleteChecklist(checklist.id)"
          type="button"
          :disabled="deleteChecklistPending"
          class="delete-button"
        >
          <CloseIcon size="12" />
        </button>
        <!-- </label> -->
      </label>
    </div>
    <div
      v-if="
        Object.keys(groupedChecklists).length === 1 &&
        groupedChecklists['uncategorized']?.length === 0
      "
      class="no-checklists"
    >
      You have no checklist items yet.
    </div>
  </div>
</template>

<style lang="scss" scoped>
.checklists-section {
  margin-top: 1rem;
}

.no-checklists {
  padding: 2rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #f8fafc;
  text-align: center;
  color: #9ca3af;
  font-size: 0.9rem;
}

.checklist-category {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 2rem 0;

  h2 {
    font-weight: 300;
    text-transform: uppercase;
    font-size: 0.8rem;
  }
}

.checklist-item {
  display: flex;
  justify-content: space-between;

  padding: 0.5rem;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #d5dee7;
  }

  .checklist-checkbox {
    border: 2px solid #d1d5db;
    border-radius: 4px;
    background: white;
    position: relative;
    width: 20px;
    height: 20px;
    transition: all 0.2s ease;
    position: relative;
    top: -1px;

    .checklist-checkbox-input {
      visibility: hidden;
      position: absolute;
      left: -20px;

      &:checked + .checklist-checkbox-custom {
        display: block;
      }
    }

    .checklist-checkbox-custom {
      display: none;
    }
  }

  .checklist-title {
    flex: 1;
    width: 100%;

    &.checked {
      text-decoration: line-through;
      color: #9ca3af;
    }
  }

  .delete-button {
    position: relative;
    top: 1px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      color: red;
    }
  }
}
</style>
