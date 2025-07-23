import { useMutation, useQuery } from '@tanstack/vue-query'
import { db } from '@/configs/firebase'
import { collection, getDocs, doc, addDoc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore'
import type { ProgramChecklistItemType } from '@/types/ProgramChecklist'
import { toast } from 'vue3-toastify'
import { queryClient } from '@/configs/react-query'
import { calculateProgramMeta } from '@/utils/programMeta'
import { checkIfDocExists } from '@/helpers/firebase'
import { QEURY_KEY } from './QueryKey'
import { updateItemInChecklistsQueryData } from '@/helpers/queryData'

export const useProgramChecklists = (programId: string) => {
  return useQuery({
    queryKey: QEURY_KEY.programChecklists(programId),
    queryFn: async () => {
      const programRef = doc(db, 'programs', programId)
      const checklistsRef = collection(programRef, 'checklists')
      const checklistsSnapshot = await getDocs(checklistsRef)
      const checklists = checklistsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      return checklists as ProgramChecklistItemType[]
    },
    enabled: !!programId,
  })
}

type UseAddProgramChecklistArgs = {
  programId: string
  data: Omit<ProgramChecklistItemType, 'id'>
}

export const useAddProgramChecklist = () => {
  return useMutation({
    mutationFn: async ({ programId, data }: UseAddProgramChecklistArgs) => {
      const programRef = doc(db, 'programs', programId)
      const checklistsRef = collection(programRef, 'checklists')

      const docRef = await addDoc(checklistsRef, data)

      calculateProgramMeta(programId)

      return { programId, id: docRef.id }
    },
    onSuccess: ({ programId }) => {
      queryClient.invalidateQueries({ queryKey: QEURY_KEY.programChecklists(programId) })
    },
    onError: (error) => {
      const errorMsg = error.message ?? 'Failed to add checklist item. Please try again.'
      toast.error(errorMsg)
    },
  })
}

type UseDeleteProgramChecklistArgs = {
  programId: string
  checklistId: string
}

export const useDeleteProgramChecklistItem = () => {
  return useMutation({
    mutationFn: async ({ programId, checklistId }: UseDeleteProgramChecklistArgs) => {
      const programRef = doc(db, 'programs', programId)
      const checklistsRef = collection(programRef, 'checklists')
      const checklistRef = doc(checklistsRef, checklistId)

      await checkIfDocExists({ docRef: checklistRef, errorMsg: 'Checklist item not found' })

      await deleteDoc(checklistRef)
      calculateProgramMeta(programId)
      return { programId }
    },
    onSuccess: ({ programId }) => {
      queryClient.invalidateQueries({ queryKey: QEURY_KEY.programChecklists(programId) })
    },
    onError: (error) => {
      const errorMsg = error.message ?? 'Failed to delete checklist item. Please try again.'
      toast.error(errorMsg)
    },
  })
}

type UseUpdateProgramChecklistArgs = {
  programId: string
  checklistId: string
  checklistItemObj: ProgramChecklistItemType
}

export const useUpdateProgramChecklistItem = () => {
  return useMutation({
    mutationFn: async ({
      programId,
      checklistId,
      checklistItemObj,
    }: UseUpdateProgramChecklistArgs) => {
      const programRef = doc(db, 'programs', programId)
      const checklistsRef = collection(programRef, 'checklists')
      const checklistRef = doc(checklistsRef, checklistId)

      await checkIfDocExists({ docRef: checklistRef, errorMsg: 'Checklist item not found' })

      await updateDoc(checklistRef, checklistItemObj)
      calculateProgramMeta(programId)
      return { programId, checklistId, checklistItemObj }
    },
    onError: (error) => {
      const errorMsg = error.message ?? 'Failed to update checklist item. Please try again.'
      toast.error(errorMsg)
    },
    onSuccess: ({ programId, checklistId, checklistItemObj }) => {
      updateItemInChecklistsQueryData(checklistId, programId, checklistItemObj)
    },
  })
}
