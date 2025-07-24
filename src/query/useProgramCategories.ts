import { useQuery } from '@tanstack/vue-query'
import { db } from '@/configs/firebase'
import { collection, getDocs, doc, addDoc, deleteDoc, query, where } from 'firebase/firestore'
import { useMutation } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { queryClient } from '@/configs/react-query'
import type { ProgramChecklistCategoryType } from '@/types/ProgramChecklist'
import { QEURY_KEY } from './QueryKey'
import { addCategoryToProgramQueryData, removeCategoryFromProgramQueryData } from '@/helpers/setQueryDataCategories'

export const useProgramCategories = (programId: string) => {
  return useQuery({
    queryKey: QEURY_KEY.programCategories(programId),
    queryFn: async () => {
      const programRef = doc(db, 'programs', programId)
      const categoriesRef = collection(programRef, 'categories')
      const categoriesSnapshot = await getDocs(categoriesRef)
      const categories = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      return categories as ProgramChecklistCategoryType[]
    },
    enabled: !!programId,
  })
}

type UseCreateCategoryArgs = {
  programId: string
  data: Omit<ProgramChecklistCategoryType, 'id'>
}

export const useCreateProgramCategory = () => {
  return useMutation({
    mutationFn: async ({
      programId,
      data,
    }: UseCreateCategoryArgs): Promise<{
      programId: string
      categoryData: ProgramChecklistCategoryType
    }> => {
      const programRef = doc(db, 'programs', programId)
      const categoriesRef = collection(programRef, 'categories')

      const existingCategoryQuery = query(categoriesRef, where('name', '==', data.name))
      const existingCategorySnapshot = await getDocs(existingCategoryQuery)

      if (!existingCategorySnapshot.empty) {
        throw new Error(`Category '${data.name}' already exists`)
      }

      const categoryDoc = await addDoc(categoriesRef, data)
      const categoryData = {
        id: categoryDoc.id,
        ...data,
      }
      return { programId, categoryData }
    },
    onSuccess: ({ programId, categoryData }) => {
      addCategoryToProgramQueryData(programId, categoryData)
    },
    onError: (error) => {
      const errorMsg = error.message ?? 'Failed to create category. Please try again.'
      toast.error(errorMsg)
    },
  })
}

export const useDeleteProgramCategory = () => {
  return useMutation({
    mutationFn: async ({ programId, categoryId }: { programId: string; categoryId: string }) => {
      const programRef = doc(db, 'programs', programId)
      const categoryRef = doc(programRef, 'categories', categoryId)

      await deleteDoc(categoryRef)

      return { programId, categoryId }
    },
    onSuccess: ({ programId, categoryId }) => {
      removeCategoryFromProgramQueryData(programId, categoryId)
    },
    onError: (error) => {
      toast.error('Failed to delete category. Please try again.')
    },
  })
}
