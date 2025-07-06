import { Timestamp } from 'firebase/firestore'

export type ChecklistTemplateType = {
  id: string
  name: string
  description: string
  createdBy: string
  createdAt: Timestamp
}

export type ChecklistTemplateCategoryType = {
  id: string
  name: string
  description: string
  createdAt: Timestamp
}

export type ChecklistTemplateItemType = {
  id: string
  title: string
  description?: string
  
}