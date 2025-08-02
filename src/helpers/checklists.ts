import type {
  ProgramChecklistCategoryType,
  ProgramChecklistItemType,
} from '@/types/ProgramChecklist'

export const groupChecklists = (
  checklists: ProgramChecklistItemType[],
  categories: ProgramChecklistCategoryType[],
) => {
  const group: Record<
    string,
    {
      unchecked: ProgramChecklistItemType[]
      checked: ProgramChecklistItemType[]
      id: string
    }
  > = {}

  const categoryMap = new Map(categories.map((category) => [category.id, category.name]))

  // Initialize with uncategorized
  group['uncategorized'] = { unchecked: [], checked: [], id: 'uncategorized' }

  // Initialize all categories from the categories list to maintain order
  categories
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((category) => {
      group[category.name] = { unchecked: [], checked: [], id: category.id }
    })

  // Group checklists into their categories
  checklists.forEach((checklist) => {
    const categoryId = checklist.categoryId as string
    const categoryName = categoryId
      ? (categoryMap.get(categoryId) as string) || 'uncategorized'
      : 'uncategorized'

    if (!group[categoryName]) {
      group[categoryName] = { unchecked: [], checked: [], id: categoryName }
    }

    if (checklist.isCompleted) {
      group[categoryName].checked.push(checklist)
    } else {
      group[categoryName].unchecked.push(checklist)
    }
  })

  return group
}

export const throwIfChecklistItemNotFound = (
  checklistItems: ProgramChecklistItemType[],
  checklistId: string,
  message = 'Checklist not found',
) => {
  const targetChecklist = checklistItems.find((checklist) => checklist.id === checklistId)
  if (!targetChecklist) {
    throw new Error(message)
  }

  return targetChecklist
}
