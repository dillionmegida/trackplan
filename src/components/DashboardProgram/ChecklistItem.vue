<script lang="ts" setup>
import CheckIcon from '@/components/icons/CheckIcon.vue'
import { ref, defineEmits, nextTick, computed, defineComponent, Teleport } from 'vue'
import type { PropType } from 'vue'
import type { ProgramChecklistCategoryType, ProgramChecklistItemType } from '@/types/ProgramChecklist'
import EditIcon from '../icons/EditIcon.vue'
import { useUpdateProgramChecklistItem } from '@/query/useProgramChecklists'
import LoaderIcon from '../icons/LoaderIcon.vue'
import EllipsisVerticalIcon from '../icons/EllipsisVerticalIcon.vue'
import { snakeToWordCase } from '@/utils/string'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import Modal from '@/components/Modal.vue'
import type { VTooltip } from 'floating-vue'

const props = defineProps({
  checklist: {
    type: Object as PropType<ProgramChecklistItemType>,
    required: true
  },
  programId: {
    type: String,
    required: true
  },
  categories: {
    type: Array as PropType<ProgramChecklistCategoryType[]>,
    required: true
  }
})

const dropdownRef = ref<InstanceType<typeof VTooltip> | null>(null)

const categories = computed(() => [
  { value: null, label: 'Uncategorized' },
  ...props.categories.map((category) => ({
    value: category.id,
    label: snakeToWordCase(category.name),
  }))
])

const selectedCategory = computed({
  get: () => {
    const category = categories.value.find((category) => category.value === props.checklist.categoryId)
    return category || { value: null, label: 'Uncategorized' }
  },
  set: (category: { value: string; label: string } | null) => {
    handleCategoryChange(category?.value || null)
    return category
  }
})
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

const showDeleteModal = ref(false)

const onDelete = () => {
  dropdownRef.value?.hide()
  showDeleteModal.value = true
}

const onConfirmDelete = () => {
  emit('delete')
  showDeleteModal.value = false
}

const onEnterPress = () => {
  isEditing.value = false
}

const onBlur = async () => {
  // enter will also trigger blur
  await updateChecklistTitle()
  isEditing.value = false
}


const handleCategoryChange = async (value: string | null) => {
  const categoryId = value === null ? null : value

  await updateProgramChecklistItemMutation({
    programId: props.programId,
    checklistId: props.checklist.id,
    checklistItemObj: {
      ...props.checklist,
      categoryId
    },
  })
}

const emitChecked = (event: Event) => {
  emit('update', (event.target as HTMLInputElement).checked)
}

const isDropdownOpen = ref(false)
</script>

<template>
  <div class="checklist-item-wrapper " :class="{ 'dropdown-open': isDropdownOpen }">
    <label v-if="!isEditing" :for="checklist.id" class="checklist-item">
      <!-- TODO: while item is being checked, show loading icon and disable input -->
      <div class="checklist-checkbox">
        <input :id="checklist.id" @change="emitChecked" type="checkbox" :checked="checklist.isCompleted"
          class="checklist-checkbox-input" />
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
      <div v-if="!isEditing" class="checklist-title block" :class="{ checked: checklist.isCompleted }"
        @click="startEditing">
        {{ checklist.title }}
      </div>
      <textarea :disabled="updateProgramChecklistItemPending" v-else ref="inputRef" class="checklist-title input"
        v-model="checklist.title" @blur="onBlur" @keydown.enter.exact.prevent="onEnterPress"></textarea>
    </div>

    <div class="dropdown-container">
      <VDropdown ref="dropdownRef" @apply-show="isDropdownOpen = true" @apply-hide="isDropdownOpen = false"
        :distance="-6" placement="top-end">
        <button class="dropdown-trigger">
          <EllipsisVerticalIcon :size="20" color="#64748b" />
        </button>

        <template #popper>
          <div class="actions">
            <div class="category-select">
              <v-select v-model="selectedCategory" :options="categories"
                :disabled="updateProgramChecklistItemPending || isEditing" :clearable="false" :searchable="false"
                class="v-select-category">
              </v-select>
            </div>
            <button type="button" class="action-button delete-button"
              :disabled="deleteChecklistPending || updateProgramChecklistItemPending || isEditing" @click="onDelete">
              Delete
            </button>
          </div>
        </template>
      </VDropdown>
    </div>
  </div>

  <Teleport v-if="showDeleteModal" to="body">
    <Modal v-model="showDeleteModal" title="Delete Checklist Item" @confirm="onConfirmDelete"
      :deleting="deleteChecklistPending">
      <span class="item-title-to-delete">{{ checklist.title }}</span>
      Are you sure you want to delete this checklist item? This action cannot be
      undone.
    </Modal>
  </Teleport>
</template>

<style>
.v-select-category .vs__selected-options {
  padding: 0.1rem 1rem !important;
  font-size: 0.9rem;
}


.v-select-category .vs__dropdown-toggle {
  border: none !important;
}

.v-select-category .vs__selected {
  padding: 0;
  margin-inline: 0;
}

.v-select-category .vs__actions {
  margin-right: 0.5rem;
}

.v-select-category .vs__dropdown-menu {
  border: none;
  border-bottom-right-radius: 6px;
  border-bottom-left-radius: 6px;
  padding: 0;
}

.v-select-category .vs__dropdown-option--highlight {
  background-color: #f1f5f9;
  color: #1e293b;
}

.v-select-category .vs__dropdown-option--selected {
  background-color: #e2e8f0;
}

.v-select-category .vs__dropdown-option {
  font-size: 0.9rem;
  padding-block: 0.5rem;
}
</style>

<style lang="scss" scoped>
.checklist-item-wrapper {
  display: flex;
  gap: 0.5rem;
  position: relative;

  &.dropdown-open {

    .checklist-title {
      border: 1px solid #2c79eb;
      background-color: #cbddfa;
    }
  }
}

.item-title-to-delete {
  color: red;
  font-size: 0.9rem;
  display: block;
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

      &:checked+.checklist-checkbox-custom {
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

.v-popper__inner {
  border-radius: 0px;
}




.actions {
  display: flex;
  flex-direction: column;
  min-width: 180px;
  height: max-content;

  .category-select {

    .v-select-category {
      --vs-dropdown-option--active-bg: #f1f5f9;
      --vs-dropdown-option--selected-bg: #e2e8f0;
      --vs-border-radius: 0px;
      --vs-controls-color: #64748b;
      --vs-line-height: 1.5;
      --vs-controls-size: 0.8;
      --vs-dropdown-min-width: 160px;





      .vs__selected {

        padding: 0 1rem;
        border: none;
        background: none;
        color: #334155;
      }

      .vs__actions {
        padding: 0 4px 0 0;
      }

      .vs__dropdown-menu {
        padding: 0.25rem 0;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      }

      .vs__dropdown-option {
        padding: 0.4rem 0.75rem;
        margin: 0;
        font-size: 0.9rem;
        white-space: nowrap;

        &--highlight {
          background: #f8fafc;
          color: #1e40af;
        }
      }

      &.vs--disabled {
        opacity: 0.6;
        cursor: not-allowed;

        .vs__dropdown-toggle {
          background-color: #f8fafc;
        }
      }
    }
  }

  .action-button {
    padding: 1rem;
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
      border-top: 1px solid #e2e8f0;
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