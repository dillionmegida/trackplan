import { useQuery } from '@tanstack/vue-query'
import { db } from '@/configs/firebase'
import { collection, getDocs, doc, addDoc, deleteDoc } from 'firebase/firestore'
import { useMutation } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import { queryClient } from '@/configs/react-query'
import type { ProgramChecklistCategoryType } from '@/types/ProgramChecklist'

export const useProgramCategories = (programId: string) => {
  return useQuery({
    queryKey: ['program-categories', programId],
    queryFn: async () => {
      const programRef = doc(db, 'programs', programId)
      const categoriesRef = collection(programRef, 'categories')
      const categoriesSnapshot = await getDocs(categoriesRef)
      const categories = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      return categories
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
    }: UseCreateCategoryArgs): Promise<{ id: string; programId: string }> => {
      const programRef = doc(db, 'programs', programId)
      const categoriesRef = collection(programRef, 'categories')
      const categoryDoc = await addDoc(categoriesRef, data)
      return { id: categoryDoc.id, programId }
    },
    onSuccess: ({ programId }) => {
      toast.success('Category created successfully')
      queryClient.invalidateQueries({ queryKey: ['program-categories', programId] })
    },
    onError: (error) => {
      toast.error('Failed to create category. Please try again.')
    },
  })
}

export const useDeleteProgramCategory = () => {
  return useMutation({
    mutationFn: async ({ programId, categoryId }: { programId: string; categoryId: string }) => {
      const programRef = doc(db, 'programs', programId)
      const categoryRef = doc(programRef, 'categories', categoryId)

      await deleteDoc(categoryRef)

      return { programId }
    },
    onSuccess: ({ programId }) => {
      toast.success('Category deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['program-categories', programId] })
    },
    onError: (error) => {
      toast.error('Failed to delete category. Please try again.')
    },
  })
}
