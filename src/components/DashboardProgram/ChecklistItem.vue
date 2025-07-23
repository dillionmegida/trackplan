<script lang="ts" setup>
import CheckIcon from '@/components/icons/CheckIcon.vue'
import { ref, defineEmits, nextTick } from 'vue'
import type { ProgramChecklistItemType } from '@/types/ProgramChecklist'
import EditIcon from '../icons/EditIcon.vue'
import { useUpdateProgramChecklistItem } from '@/query/useProgramChecklists'
import LoaderIcon from '../icons/LoaderIcon.vue'
import EllipsisVerticalIcon from '../icons/EllipsisVerticalIcon.vue'

const props = defineProps<{ 
  checklist: ProgramChecklistItemType; 
  programId: string;
  categories: Array<{ id: string; name: string }>;
 }>()

const emit = defineEmits(['delete', 'update'])

const {
  mutateAsync: updateProgramChecklistItemMutation,
  isPending: updateProgramChecklistItemPending,
} = useUpdateProgramChecklistItem()

const checklist = ref({ ...props.checklist })

const isEditing = ref(false)

const deleteChecklistPending = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

async function updateChecklistTitle() {
  if (checklist.value.title === props.checklist.title) {
    return (isEditing.value = false)
  }

  await updateProgramChecklistItemMutation({
    programId: props.programId,
    checklistId: props.checklist.id,
    checklistItemObj: {
      ...props.checklist,
      title: checklist.value.title.trim(),
    },
  })
  isEditing.value = false
}

const startEditing = () => {
  isEditing.value = true
  nextTick(() => {
    if (!inputRef.value) return

    inputRef.value.focus()

    function updateHeight() {
      if (!inputRef.value) return
      inputRef.value.style.height = 'auto'
      inputRef.value.style.height = inputRef.value.scrollHeight + 'px'
    }
    updateHeight()
    inputRef.value.addEventListener('input', updateHeight)
  })
}

const onDelete = () => {
  const decision = window.confirm('Are you sure you want to delete this checklist item?')
  if (!decision) return
  emit('delete')
}

const onEnterPress = () => {
  isEditing.value = false
}

const onBlur = async () => {
  // enter will also trigger blur
  await updateChecklistTitle()
  isEditing.value = false
}

const showModal = ref(true)

const handleCategoryChange = async (event: Event) => {
  const select = event.target as HTMLSelectElement
  const categoryId = select.value === '' ? null : select.value
  
  await updateProgramChecklistItemMutation({
    programId: props.programId,
    checklistId: props.checklist.id,
    checklistItemObj: {
      ...props.checklist,
      categoryId
    },
  })
  
  // Reset to default to allow selecting the same category again
  select.value = ''
}
</script>

<template>
  <div class="checklist-item-wrapper">
    <label v-if="!isEditing" :for="checklist.id" class="checklist-item">
      <!-- TODO: while item is being checked, show loading icon and disable input -->
      <div class="checklist-checkbox">
        <input
          :id="checklist.id"
          @change="$emit('update', $event.target.checked)"
          type="checkbox"
          :checked="checklist.isCompleted"
          class="checklist-checkbox-input"
        />
        <span class="checklist-checkbox-custom">
          <CheckIcon color="#23934e" :size="16" />
        </span>
      </div>
    </label>
    <!-- TODO: show loading spinner while updating title -->
    <span v-else class="edit-icon">
      <LoaderIcon v-if="updateProgramChecklistItemPending" :size="20" />
      <EditIcon v-else :size="20" color="#23934e" />
    </span>

    <div class="checklist-title-wrapper">
      <div
        v-if="!isEditing"
        class="checklist-title block"
        :class="{ checked: checklist.isCompleted }"
        @click="startEditing"
      >
        {{ checklist.title }}
      </div>
      <textarea
        :disabled="updateProgramChecklistItemPending"
        v-else
        ref="inputRef"
        class="checklist-title input"
        v-model="checklist.title"
        @blur="onBlur"
        @keydown.enter.exact.prevent="onEnterPress"
      ></textarea>
    </div>

    <div class="dropdown-container">
      <VDropdown :distance="-6" placement="top-end">
        <button class="dropdown-trigger">
          <EllipsisVerticalIcon :size="20" color="#64748b" />
        </button>

        <template #popper>
          <div class="actions">
            <div class="category-select">
              <label class="select-label">Move to:</label>
              <select 
                class="category-select-element"
                :value="props.checklist.categoryId || ''"
                @change="handleCategoryChange"
                :disabled="updateProgramChecklistItemPending || isEditing"
              >
                <option value="" disabled>Select a category</option>
                <option :value="null">No Category</option>
                <option 
                  v-for="category in props.categories" 
                  :key="category.id" 
                  :value="category.id"
                  :selected="props.checklist.categoryId === category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>
            <button
              type="button"
              class="action-button delete-button"
              :disabled="deleteChecklistPending || updateProgramChecklistItemPending || isEditing"
              @click="onDelete"
            >
              Delete
            </button>
          </div>
        </template>
      </VDropdown>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.checklist-item-wrapper {
  display: flex;
  gap: 0.5rem;
  position: relative;
}

.checklist-item {
  .checklist-checkbox {
    cursor: pointer;
    border: 2px solid #d1d5db;
    border-radius: 4px;
    background: white;
    position: relative;
    width: 20px;
    height: 20px;
    transition: all 0.2s ease;
    position: relative;
    top: 5px;

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
}

.edit-icon {
  width: 20px;
  height: 20px;
  position: relative;
  top: 5px;
}

.checklist-title-wrapper {
  flex: 1;
  width: 100%;
}

.checklist-title {
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;

  &.block:hover {
    background-color: #d5dee7;
  }

  &.block.checked {
    text-decoration: line-through;
    color: #9ca3af;
  }
}

.checklist-title.input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.checklist-title.input:focus {
  border: 1px solid #23934e;
  outline: none;
}

.dropdown-trigger {
  position: relative;
  top: 5px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 180px;
  padding: 0.5rem 0;
  
  .category-select {
    padding: 0 0.5rem;
    margin-bottom: 0.25rem;
    
    .select-label {
      display: block;
      font-size: 0.8rem;
      color: #64748b;
      margin-bottom: 0.25rem;
    }
    
    .category-select-element {
      width: 100%;
      padding: 0.4rem 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      font-size: 0.9rem;
      background-color: white;
      cursor: pointer;
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 1px #3b82f6;
      }
    }
  }

  .action-button {
    padding: 0.5rem 1rem;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:hover {
      background-color: #f1f5f9;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    &.delete-button {
      color: #ef4444;
      margin-top: 0.25rem;
      border-top: 1px solid #e2e8f0;
      padding-top: 0.75rem;
    }
  }
}

.delete-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  width: 20px;
  border-radius: 3px;
  background-color: rgb(198, 188, 188);
  color: #333;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background-color: rgb(239, 136, 136);
  }

  svg {
    position: relative;
    top: -1px;
    left: -0.5px;
  }
}
</style>