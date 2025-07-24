import { queryClient } from '@/configs/react-query'
import { QEURY_KEY } from '@/query/QueryKey'
import type { ProgramChecklistCategoryType } from '@/types/ProgramChecklist'

export function addCategoryToProgramQueryData(
  programId: string,
  category: ProgramChecklistCategoryType,
) {
  queryClient.setQueryData(
    QEURY_KEY.programCategories(programId),
    (oldData: ProgramChecklistCategoryType[] | undefined) => {
      if (!oldData) return

      return [...oldData, category]
    },
  )
}

export function removeCategoryFromProgramQueryData(
  programId: string,
  categoryId: string,
) {
  queryClient.setQueryData(
    QEURY_KEY.programCategories(programId),
    (oldData: ProgramChecklistCategoryType[] | undefined) => {
      if (!oldData) return

      return oldData.filter((category) => category.id !== categoryId)
    },
  )
}