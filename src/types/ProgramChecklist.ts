import { Timestamp } from 'firebase/firestore'
import { ChecklistTemplateCategoryType, ChecklistTemplateItemType } from './ChecklistTemplate'

export type ProgramChecklistType = {
  id: string
  programId: string
  checklistTemplateId: string | null
  createdAt: Timestamp
}

export type ProgramChecklistCategoryType = ChecklistTemplateCategoryType

export type ProgramChecklistItemType = ChecklistTemplateItemType & {
  isCompleted: boolean
  completedBy: string
  completedAt: Timestamp
  createdAt: Timestamp
}
