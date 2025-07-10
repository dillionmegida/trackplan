<script lang="ts" setup>
import CloseIcon from '@/components/icons/CloseIcon.vue'
import CheckIcon from '@/components/icons/CheckIcon.vue'
import { ref, defineEmits, nextTick } from 'vue'
import type { ProgramChecklistItemType } from '@/types/ProgramChecklist'
import EditIcon from '../icons/EditIcon.vue';
import { useUpdateProgramChecklistItem } from '@/query/useProgramChecklists';
import LoaderIcon from '../icons/LoaderIcon.vue';

const props = defineProps<{ checklist: ProgramChecklistItemType, programId: string }>()


const emit = defineEmits(['delete', 'update'])

const { mutateAsync: updateProgramChecklistItemMutation, isPending: updateProgramChecklistItemPending } =
  useUpdateProgramChecklistItem()

const checklist = ref({ ...props.checklist })

const isEditing = ref(false)

const deleteChecklistPending = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

async function updateChecklistTitle() {
  if (checklist.value.title === props.checklist.title) {
    return isEditing.value = false
  }

  await updateProgramChecklistItemMutation({
    programId: props.programId,
    checklistId: props.checklist.id,
    checklistItemObj: {
      ...props.checklist,
      title: checklist.value.title,
    },
  })
  isEditing.value = false
}

const startEditing = () => {
  isEditing.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const onEnterPress = () => { isEditing.value = false }

const onBlur = async () => {
  // enter will also trigger blur
  await updateChecklistTitle()
  isEditing.value = false
}
</script>

<template>
  <div class="checklist-item-wrapper">
    <label v-if="!isEditing" :for="checklist.id" class="checklist-item">
      <div class="checklist-checkbox">
        <input :id="checklist.id" @change="$emit('update', $event.target.checked)" type="checkbox"
          :checked="checklist.isCompleted" class="checklist-checkbox-input" />
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

    <div v-if="!isEditing" class="checklist-title block" :class="{ checked: checklist.isCompleted }"
      @click="startEditing">
      {{ checklist.title }}
    </div>
    <input :disabled="updateProgramChecklistItemPending" v-else ref="inputRef" class="checklist-title input" type="text"
      v-model="checklist.title" @blur="onBlur" @keydown.enter.prevent="onEnterPress">
    <button @click="$emit('delete')" type="button"
      :disabled="deleteChecklistPending || updateProgramChecklistItemPending || isEditing" class="delete-button">
      <CloseIcon :size="10" />
    </button>
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

.checklist-title.input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.checklist-title.input:focus {
  border: 1px solid #23934e;
  outline: none;
}


.checklist-title {
  flex: 1;
  width: 100%;
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



.edit-icon {}

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
  position: relative;
  top: 5px;

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