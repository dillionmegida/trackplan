<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { useDeleteProgramChecklistItem } from '@/query/useProgramChecklists'
import { computed } from 'vue'
import type { ProgramChecklistItemType } from '@/types/ProgramChecklist'
import { addPlural, snakeToWordCase } from '@/utils/string'
import { useUpdateProgramChecklistItem } from '@/query/useProgramChecklists'
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
import ChecklistItem from './ChecklistItem.vue'
import { onBeforeRouteLeave } from 'vue-router'
import { queryClient } from '@/configs/react-query'
import { QEURY_KEY } from '@/query/QueryKey'
import type { ProgramChecklistCategoryType } from '@/types/ProgramChecklist'

const props = defineProps<{
  themeColor: string
  organizationId: string
  checklists: ProgramChecklistItemType[]
  categories: ProgramChecklistCategoryType[]
}>()

// Make checklists and categories reactive to prop changes
const checklists = computed(() => [...props.checklists])
const categories = computed(() => [...props.categories])

const themeColor = props.themeColor || '#fff'

const route = useRoute()
const programId = route.params.id as string

const somethingChanged = ref(false)

onBeforeRouteLeave(() => {
  if (!props.organizationId || !somethingChanged.value) return
  queryClient.invalidateQueries({ queryKey: QEURY_KEY.programsForUser(props.organizationId) })
})

const groupedChecklists = computed(() => {
  const group: Record<
    string,
    {
      unchecked: ProgramChecklistItemType[]
      checked: ProgramChecklistItemType[]
      id: string
    }
  > = {}

  const categoryMap = new Map(categories.value.map((category) => [category.id, category.name]))

  // Initialize with uncategorized
  group['uncategorized'] = { unchecked: [], checked: [], id: 'uncategorized' }

  // Initialize all categories from the categories list to maintain order
  categories.value
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((category) => {
      group[category.name] = { unchecked: [], checked: [], id: category.id }
    })

  // Group checklists into their categories
  checklists.value?.forEach((checklist) => {
    const categoryId = checklist.categoryId as string
    const categoryName = categoryId
      ? (categoryMap.get(categoryId) as string) || 'uncategorized'
      : 'uncategorized'

    if (!group[categoryName]) {
      group[categoryName] = { unchecked: [], checked: [], id: categoryName }
    }

    if (checklist.isCompleted) {
      group[categoryName].checked.push(checklist)
    } else {
      group[categoryName].unchecked.push(checklist)
    }
  })

  return group
})

const showCompletedCategories = ref<string[]>([])

const toggleCompletedCategories = (category: string) => {
  if (showCompletedCategories.value.includes(category)) {
    showCompletedCategories.value = showCompletedCategories.value.filter((cat) => cat !== category)
  } else {
    showCompletedCategories.value.push(category)
  }
}

const auth = useAuthStore()

const { mutateAsync: deleteChecklistMutation, isPending: deleteChecklistPending } =
  useDeleteProgramChecklistItem()

async function deleteChecklist(checklistId: string) {
  await deleteChecklistMutation({ programId, checklistId })
}

const { mutateAsync: updateChecklistMutation, isPending: updateChecklistPending } =
  useUpdateProgramChecklistItem()

async function updateChecklist(checklistId: string, isCompleted: boolean) {
  somethingChanged.value = true // this is so that the query is invalidated when the user leaves the page
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

const dragging = ref(false)
const dragOverCategory = ref<string | null>(null)

function dragStart(event: DragEvent) {
  dragging.value = true
  const target = event.target as HTMLElement

  if (!target.id || !event.dataTransfer) return

  event.dataTransfer.setData('text/plain', target.id.replace('wrapper-', ''))
  event.dataTransfer.effectAllowed = 'move'
}

function dragOver(event: DragEvent) {
  event.preventDefault()
  const target = event.target as HTMLElement

  if (!target.id || !event.dataTransfer) return

  dragOverCategory.value = target.id

  event.dataTransfer.dropEffect = 'move'
}

function dragend(event: DragEvent) {
  dragging.value = false
  dragOverCategory.value = null
}

async function drop(category: string, event: DragEvent) {
  if (!event.dataTransfer) return

  const categoryId = groupedChecklists.value[category].id

  const checklistId = event.dataTransfer.getData('text/plain')

  const targetChecklist = checklists.value?.find((checklist) => checklist.id === checklistId)

  if (!auth.user) {
    throw new Error('You are not logged in')
  }

  if (!targetChecklist) {
    throw new Error('Checklist item not found')
  }

  const currentCategoryId = [null, 'uncategorized'].includes(targetChecklist.categoryId)
    ? 'uncategorized'
    : targetChecklist.categoryId

  if (currentCategoryId === categoryId) return

  const checklistItemObj = {
    ...targetChecklist,
    categoryId: !!categoryId ? categoryId : null,
  }

  await updateChecklistMutation({ programId, checklistId, checklistItemObj })
}
</script>


<template>
  <div class="checklists-section" :style="{ '--theme-color': themeColor }">
    <div
      v-for="(checklists, category) in groupedChecklists"
      :key="category"
      :id="category"
      @dragover="dragOver"
      @drop="drop(category, $event)"
      :class="
        'checklist-category' +
        (checklists.checked.length > 0 || checklists.unchecked.length > 0 ? '' : ' hidden') +
        (dragOverCategory === category ? ' drag-over' : '')
      "
    >
      <!-- v-if here is so that the category header is not displayed if there are no checklists in that category -->
      <div
        v-if="checklists.checked.length > 0 || checklists.unchecked.length > 0"
        class="category-header"
      >
        <h2>
          {{ snakeToWordCase(category) }} - {{ checklists.checked.length }}/{{
            checklists.unchecked.length + checklists.checked.length
          }}
        </h2>
        <div class="progress-container">
          <div
            class="progress-bar"
            :style="{
              width: `${
                (checklists.checked.length /
                  (checklists.unchecked.length + checklists.checked.length)) *
                100
              }%`,
            }"
          ></div>
        </div>
      </div>
      <ChecklistItem
        :categories="categories"
        v-for="checklist in checklists.unchecked"
        :id="'wrapper-' + checklist.id"
        :key="checklist.id"
        :programId="programId"
        :checklist="checklist"
        @dragstart="dragStart"
        @dragend="dragend"
        draggable="true"
        @delete="deleteChecklist(checklist.id)"
        @update="(newValue) => updateChecklist(checklist.id, newValue)"
      />
      <button
        v-if="checklists.checked.length > 0"
        @click="toggleCompletedCategories(category)"
        class="see-completed-button"
      >
        {{
          showCompletedCategories.includes(category)
            ? `Hide ${checklists.checked.length} Completed `
            : `See ${checklists.checked.length} Completed `
        }}
        {{ addPlural(checklists.checked.length, 'Item') }}
      </button>
      <div v-if="showCompletedCategories.includes(category)" class="completed-checklists">
        <ChecklistItem
          :categories="categories"
          v-for="checklist in checklists.checked"
          :id="'wrapper-' + checklist.id"
          :key="checklist.id"
          :programId="programId"
          :checklist="checklist"
          @dragstart="dragStart"
          @dragend="dragend"
          draggable="true"
          @delete="deleteChecklist(checklist.id)"
          @update="(newValue) => updateChecklist(checklist.id, newValue)"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.checklists-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.checklist-category.drag-over {
  outline: 2px solid #333;
  outline-offset: 10px;
}

.completed-checklists {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checklist-category {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &.hidden {
    display: none;
  }

  .category-header {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;

    .progress-container {
      width: 100%;
      height: 3px;
      background: #edf0f5;
      border-radius: 6px;
      overflow: hidden;
    }

    .progress-bar {
      display: flex;
      width: 100%;
      border: none;
      height: 3px;
      border-radius: 6px;
      overflow: hidden;
      transition: all 0.2s ease;
      background: var(--theme-color);
    }

    h2 {
      flex: 1;
      font-weight: 300;
      text-transform: uppercase;
      font-size: 0.8rem;
    }
  }
}

.see-completed-button {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  color: #64748b;
  gap: 0.2rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  width: max-content;
  margin-left: calc(20px + 0.5rem);

  &:hover {
    background-color: #d5dee7;
    color: #1e293b;
  }
}
</style>
