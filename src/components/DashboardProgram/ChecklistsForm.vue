<script lang="ts" setup>
import { useProgramCategories } from '@/query/useProgramCategories'
import { useAddProgramChecklist } from '@/query/useProgramChecklists'
import { snakeToWordCase } from '@/utils/string'
import { Timestamp } from 'firebase/firestore'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const programId = route.params.id as string


const { mutateAsync: addChecklistItemMutation } = useAddProgramChecklist()

const title = ref('')
const selectedCategory = ref<{ value: string; label: string }>({
  value: null,
  label: 'Uncategorized',
})

const {
  data: categories,
  isLoading: categoriesLoading,
  error: categoriesError,
} = useProgramCategories(programId)

const categoryOptions = computed(() => {
  return [{ value: null, label: 'Uncategorized' }].concat(
    categories.value?.map((category) => ({
      label: snakeToWordCase(category.name),
      value: category.id,
    }))
  )
})

const addChecklist = async () => {
  const checklistObj = {
    programId,
    data: {
      title: title.value,
      categoryId: selectedCategory.value?.value || null,
      isCompleted: false,
      completedBy: '',
      completedAt: Timestamp.fromDate(new Date()),
      createdAt: Timestamp.fromDate(new Date()),
    },
  }

  await addChecklistItemMutation(checklistObj)
  title.value = ''
  // selectedCategory.value = null // for easy continuation of adding checklists
}
</script>

<template>
  <form>
    <input type="text" placeholder="Add an item here" v-model="title" />
    <v-select placeholder="Select category" :options="categoryOptions" v-model="selectedCategory"></v-select>
    <button :disabled="!title" @click.prevent="addChecklist" type="submit">Add</button>
  </form>
</template>

<style lang="scss" scoped>
form {
  display: flex;
  gap: 0.5rem;

  input {
    padding: 0.3rem 0.5rem;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    font-size: 0.9rem;
    width: 100%;
  }

  .v-select {
    max-width: 200px;
    width: 100%;
    font-size: 0.9rem;

    .vs__search {
      font-size: 0.9rem !important;
    }
  }

  button {
    padding: 0.3rem 0.5rem;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    font-size: 0.9rem;
    background: #f8fafc;
    color: #64748b;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background-color: #d5dee7;
      color: #1e293b;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;

    input {
      width: 100%;
      padding: 0.5rem;
    }

    .v-select {
      max-width: 100%;
    }

    button {
      width: 100%;
      padding: 0.5rem;
    }
  }
}
</style>