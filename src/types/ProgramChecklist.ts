import { Timestamp } from 'firebase/firestore'
import type { ChecklistTemplateCategoryType, ChecklistTemplateItemType } from './ChecklistTemplate'

export type ProgramChecklistType = {
  id: string
  programId: string
  checklistTemplateId: string | null
  createdAt: Timestamp
}

export type ProgramChecklistCategoryType = ChecklistTemplateCategoryType & {
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type ProgramChecklistItemType = ChecklistTemplateItemType & {
  categoryId: string | null
  isCompleted: boolean
  completedBy: string
  completedAt: Timestamp
  createdAt: Timestamp
}
