import { queryClient } from '@/configs/react-query'
import { QEURY_KEY } from '@/query/QueryKey'
import type { ProgramChecklistItemType } from '@/types/ProgramChecklist'

export function updateItemInChecklistsQueryData(
  checklistId: string,
  programId: string,
  checklistItemObj: ProgramChecklistItemType,
) {
  queryClient.setQueryData(
    QEURY_KEY.programChecklists(programId),
    (oldData: ProgramChecklistItemType[]) => {
      return oldData.map((checklist) => {
        if (checklist.id === checklistId) {
          return {
            ...checklistItemObj,
          }
        }
        return checklist
      })
    },
  )
}

export function addItemToChecklistsQueryData(
  checklistItemObj: ProgramChecklistItemType,
  programId: string,
) {
  queryClient.setQueryData(
    QEURY_KEY.programChecklists(programId),
    (oldData: ProgramChecklistItemType[]) => {
      return [...oldData, checklistItemObj]
    },
  )
}

export function removeItemFromChecklistsQueryData(
  checklistId: string,
  programId: string,
) {
  queryClient.setQueryData(
    QEURY_KEY.programChecklists(programId),
    (oldData: ProgramChecklistItemType[]) => {
      return oldData.filter((checklist) => checklist.id !== checklistId)
    },
  )
}