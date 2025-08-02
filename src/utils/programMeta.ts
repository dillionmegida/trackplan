import { db } from '@/configs/firebase'
import { doc, collection, getDocs, updateDoc } from 'firebase/firestore'
import type { ProgramChecklistItemType } from '@/types/ProgramChecklist'

export const calculateProgramMeta = async (programId: string) => {
  try {
    const programRef = doc(db, 'programs', programId)
    const checklistsRef = collection(programRef, 'checklists')

    const checklistsSnapshot = await getDocs(checklistsRef)
    const checklists = checklistsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ProgramChecklistItemType[]

    const totalItems = checklists.length
    const totalCompletedItems = checklists.filter((checklist) => checklist.isCompleted).length

    updateDoc(programRef, {
      meta: {
        totalItems,
        totalCompletedItems,
      },
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error calculating program meta:', error)
    return {
      totalItems: 0,
      totalCompletedItems: 0,
    }
  }
}
