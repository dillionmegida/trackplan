<script lang="ts" setup>
import CloseIcon from '@/components/icons/CloseIcon.vue'
import CheckIcon from '@/components/icons/CheckIcon.vue'
import { ref, defineEmits } from 'vue'
import type { ProgramChecklistItemType } from '@/types/ProgramChecklist'

const props = defineProps<{ checklist: ProgramChecklistItemType }>()

// const checklistRef = ref<ProgramChecklistItemType>(props.checklist)

const emit = defineEmits(['delete', 'update'])

const deleteChecklistPending = ref(false)
</script>

<template>
  <div class="checklist-item-wrapper">
    <label :for="checklist.id" class="checklist-item">
      <div class="checklist-checkbox">
        <input
          :id="checklist.id"
          @change="$emit('update', $event.target.checked)"
          type="checkbox"
          :checked="checklist.isCompleted"
          class="checklist-checkbox-input"
        />
        <span class="checklist-checkbox-custom">
          <CheckIcon :size="16" />
        </span>
      </div>

      <div class="checklist-title" :class="{ checked: checklist.isCompleted }">
        {{ checklist.title }}
      </div>
    </label>
    <button
      @click="$emit('delete')"
      type="button"
      :disabled="deleteChecklistPending"
      class="delete-button"
    >
      <CloseIcon :size="10" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.checklist-item-wrapper {
  display: flex;
  gap: 0.5rem;
}

.checklist-item {
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding: 0.5rem;
  overflow: hidden;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

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