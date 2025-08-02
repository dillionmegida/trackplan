<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import type { ProgramChecklistItemType } from '@/types/ProgramChecklist'
import { ref } from 'vue'
import DemoChecklistItem from './DemoChecklistItem.vue'
import type { ProgramChecklistCategoryType } from '@/types/ProgramChecklist'
import { addPlural, snakeToWordCase } from '@/utils/string'

const emit = defineEmits(['update', 'delete'])

const props = defineProps<{
  themeColor: string
  checklists: ProgramChecklistItemType[]
  categories: ProgramChecklistCategoryType[]
}>()
const categories = [...props.categories]

const themeColor = props.themeColor || '#fff'

const route = useRoute()
const programId = route.params.id as string

const groupedChecklists = computed(() => {
  if (!props.checklists || !props.categories) {
    return {} as Record<
      string,
      {
        unchecked: ProgramChecklistItemType[]
        checked: ProgramChecklistItemType[]
      }
    >
  }

  const categoryMap = new Map(categories.map((category) => [category.id, category.name]))
  const group: Record<
    string,
    {
      unchecked: ProgramChecklistItemType[]
      checked: ProgramChecklistItemType[]
    }
  > = {}

  // Initialize with uncategorized first
  group['uncategorized'] = { unchecked: [], checked: [] }

  // Initialize all categories from the categories list to maintain order
  const sortedCategories = [...categories]
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((category) => {
      group[category.name] = { unchecked: [], checked: [] }
    })

  // Group checklists into their categories
  props.checklists.forEach((checklist) => {
    const categoryId = checklist.categoryId as string
    const categoryName = categoryId
      ? (categoryMap.get(categoryId) as string) || 'uncategorized'
      : 'uncategorized'

    if (!group[categoryName]) {
      group[categoryName] = { unchecked: [], checked: [] }
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

async function deleteChecklist(checklistId: string) {
  emit('delete', checklistId)
}

async function updateChecklist(checklistId: string, isCompleted: boolean) {
  emit('update', checklistId, isCompleted)
}
</script>


<template>
  <div class="checklists-section" :style="{ '--theme-color': themeColor }">
    <div
      v-for="(checklists, category) in groupedChecklists"
      :key="category"
      :class="
        'checklist-category' +
        (checklists.checked.length > 0 || checklists.unchecked.length > 0 ? '' : ' hidden')
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
      <DemoChecklistItem
        v-for="checklist in checklists.unchecked"
        :key="checklist.id"
        :programId="programId"
        :checklist="checklist"
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
        <DemoChecklistItem
          v-for="checklist in checklists.checked"
          :key="checklist.id"
          :programId="programId"
          :checklist="checklist"
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

  /* margin: 2rem 0; */

  .category-header {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;

    .progress-container {
      width: 100%;
      height: 6px;
      background: #edf0f5;
      border-radius: 6px;
      overflow: hidden;
    }

    .progress-bar {
      display: flex;
      width: 100%;
      border: none;
      height: 6px;
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
