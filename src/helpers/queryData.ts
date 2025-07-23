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
