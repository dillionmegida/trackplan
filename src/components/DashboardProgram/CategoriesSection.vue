<script lang="ts" setup>
import {
  useCreateProgramCategory,
  useDeleteProgramCategory,
  useProgramCategories,
} from '@/query/useProgramCategories'
import { snakeToWordCase, wordToSnakeCase } from '@/utils/string'
import { Timestamp } from 'firebase/firestore'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue3-toastify'
import InfoBlock from '@/components/InfoBlock.vue'
import CloseIcon from '@/components/icons/CloseIcon.vue'
import PlusIcon from '@/components/icons/PlusIcon.vue'

const route = useRoute()
const programId = route.params.id as string

const {
  data: categories,
  isLoading: categoriesLoading,
  error: categoriesError,
} = useProgramCategories(programId)

const { mutateAsync: createCategoryMutation, isPending: createCategoryPending } =
  useCreateProgramCategory()
const { mutateAsync: deleteCategoryMutation, isPending: deleteCategoryPending } =
  useDeleteProgramCategory()

const newCategoryName = ref('')

async function createCategory() {
  if (!newCategoryName.value) {
    toast.error('Category name is required')
    return
  }

  const categoryName = wordToSnakeCase(newCategoryName.value.trim())

  const categoryObj = {
    name: categoryName,
    description: '',
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
  }

  await createCategoryMutation({ programId, data: categoryObj })
  newCategoryName.value = ''
}

async function deleteCategory(categoryId: string) {
  try {
    await deleteCategoryMutation({ programId, categoryId })
  } catch (error) {
    toast.error('Failed to delete category. Please try again.')
  }
}
</script>

<template>
  <!-- TODO: Add loading state -->
  <!-- <div v-if="categoriesLoading" class="loading">Loading categories...</div> -->

  <InfoBlock
    v-if="categoriesError"
    variant="error"
    message="Error loading categories for this program."
  />

  <div class="categories-list">
    <span class="categories-description">Categories allow you to group related checklists.</span>
    <form @submit.prevent="createCategory" class="category-add-form">
      <input v-model="newCategoryName" placeholder="Category name" />
      <button :disabled="newCategoryName === '' || createCategoryPending" type="submit">
        <PlusIcon size="16" />
      </button>
    </form>
    <span class="category-item" v-if="categories?.length === 0">Add your first category</span>
    <div v-for="category in categories" :key="category.id" class="category-item">
      <div class="category-title">{{ snakeToWordCase(category.name) }}</div>
      <button
        @click="deleteCategory(category.id)"
        type="button"
        :disabled="deleteCategoryPending"
        class="delete-button"
      >
        <CloseIcon size="12" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.categories-list {
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  position: relative;

  .categories-description {
    font-size: 0.8rem;
    background: #f8fafc;
    padding: 0.25rem 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    position: absolute;
    top: -1rem;
    left: 1rem;
    color: #64748b;
    margin-bottom: 1rem;
  }

  .category-item,
  .category-add-form {
    height: 30px;
  }

  .category-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    border-radius: 6px;
    background: #fbfad6;
    border: 1px solid #d1d5db;
    font-size: 0.9rem;
    gap: 0.2rem;

    .delete-button {
      position: relative;
      top: 1px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        color: red;
      }
    }
  }
}

.category-add-form {
  display: flex;
  gap: 0.5rem;

  input {
    max-width: 200px;
    width: 100%;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    font-size: 0.9rem;
  }

  button {
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    font-size: 0.9rem;
    background: #f8fafc;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background-color: #d5dee7;
      color: #1e293b;
    }
  }
}
</style>