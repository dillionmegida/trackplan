import { useQuery } from '@tanstack/vue-query'

import { db } from '@/configs/firebase'
import {
  addDoc,
  and,
  collection,
  deleteDoc,
  doc,
  or,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { useMutation } from '@tanstack/vue-query'
import type { ProgramType } from '@/types/Program'
import { toast } from 'vue3-toastify'
import { queryClient } from '@/configs/react-query'

import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { programsLogger } from '@/services/logger/programsLogger'
import { CustomError } from '@/utils/error'
import {
  authorizedToDeleteProgram,
  authorizedToUpdateProgram,
  checkIfDocExists,
  getDocsData,
} from '@/helpers/firebase'
import { QEURY_KEY } from './QueryKey'

export const useProgramsUserHasAccessTo = ({
  organizationId,
  authUserId,
}: {
  organizationId: MaybeRefOrGetter<string | undefined | null>
  authUserId: string
}) => {
  return useQuery({
    queryKey: QEURY_KEY.programsForUser(toValue(organizationId) as string),
    queryFn: async () => {
      const orgId = toValue(organizationId)
      if (!orgId) return []

      const programsRef = collection(db, 'programs')
      const q = query(
        programsRef,
        and(
          where('organizationId', '==', orgId),
          where('trashDate', '==', null),
          where('memberIds', 'array-contains', authUserId),
        ),
      )

      const programsData = await getDocsData(q)
      return programsData as ProgramType[]
    },
    throwOnError(error: CustomError, query) {
      programsLogger.programsForOrganizationFetchFailed(error)
      return false
    },
    enabled: () => !!toValue(organizationId),
  })
}

export const useProgramsForOrganization = (
  organizationId: MaybeRefOrGetter<string | undefined | null>,
  authUserId: string,
) => {
  return useQuery({
    queryKey: QEURY_KEY.programsForOrganization(toValue(organizationId) as string),
    queryFn: async () => {
      const orgId = toValue(organizationId)
      if (!orgId) return []

      const programsRef = collection(db, 'programs')
      const q = query(
        programsRef,
        where('trashDate', '==', null),
        where('memberIds', 'array-contains', authUserId),
        where('organizationId', '==', organizationId),
      )

      const programsData = await getDocsData<ProgramType>(q)
      return programsData
    },
    throwOnError(error: CustomError, query) {
      programsLogger.programsForOrganizationFetchFailed(error)
      return false
    },
    enabled: () => !!toValue(organizationId),
  })
}

export const useTrashedProgramsForOrganization = (
  organizationId: MaybeRefOrGetter<string | undefined | null>,
  authUserId: string,
) => {
  return useQuery({
    queryKey: QEURY_KEY.trashedProgramsForOrganization(toValue(organizationId) as string),
    queryFn: async () => {
      const orgId = toValue(organizationId)
      if (!orgId) return []

      const programsRef = collection(db, 'programs')
      const q = query(
        programsRef,
        and(
          where('organizationId', '==', orgId),
          where('trashDate', '!=', null),
          where('memberIds', 'array-contains', authUserId),
        ),
      )

      const programsData = await getDocsData<ProgramType>(q)
      return programsData
    },
    enabled: () => !!toValue(organizationId),
  })
}

export const useProgram = (programId: string) => {
  return useQuery({
    queryKey: QEURY_KEY.program(programId),
    queryFn: async () => {
      const programRef = doc(db, 'programs', programId)

      const programDoc = await checkIfDocExists<ProgramType>({
        docRef: programRef,
        errorMsg: 'Program not found',
      })

      return programDoc
    },
    throwOnError(error: CustomError, query) {
      programsLogger.programFetchFailed(error)
      return false
    },
    retry: 1,
    enabled: !!programId,
  })
}

type UseCreateProgramArgs = {
  data: Omit<ProgramType, 'id'>
}

export const useCreateProgram = () => {
  return useMutation({
    mutationFn: async ({
      data,
    }: UseCreateProgramArgs): Promise<{ id: string; organizationId: string }> => {
      const programRef = collection(db, 'programs')
      const docRef = await addDoc(programRef, data)
      return { id: docRef.id, organizationId: data.organizationId }
    },
    onSuccess: ({ organizationId }) => {
      toast.success('Program created successfully')
      queryClient.invalidateQueries({ queryKey: QEURY_KEY.programsForUser(organizationId) })
      queryClient.invalidateQueries({ queryKey: QEURY_KEY.programsForOrganization(organizationId) })
      programsLogger.programCreationSuccess()
    },
    onError: (error) => {
      toast.error('Failed to create program. Please try again.')
      const customError = new CustomError(error.message, 500)
      programsLogger.programCreationFailed(customError)
    },
  })
}

type UseUpdateProgramArgs = {
  data: Omit<ProgramType, 'createdAt' | 'createdBy'>
  userId: string
}

export const useUpdateProgram = () => {
  return useMutation({
    mutationFn: async ({
      data,
      userId,
    }: UseUpdateProgramArgs): Promise<{ id: string; organizationId: string }> => {
      const programRef = doc(db, 'programs', data.id)

      const programData = await checkIfDocExists<ProgramType>({
        docRef: programRef,
        errorMsg: 'Program not found',
      })

      authorizedToUpdateProgram({ program: programData, userId })

      await updateDoc(programRef, { ...programData, ...data })
      return { id: data.id, organizationId: data.organizationId }
    },
    onSuccess: ({ id, organizationId }) => {
      toast.success('Program updated successfully')
      queryClient.invalidateQueries({ queryKey: QEURY_KEY.program(id) })
      queryClient.invalidateQueries({ queryKey: QEURY_KEY.programsForUser(organizationId) })
      queryClient.invalidateQueries({ queryKey: QEURY_KEY.programsForOrganization(organizationId) })
    },
    onError: (error: CustomError) => {
      toast.error(error.message ?? 'Failed to update program. Please try again.')
      const customError = new CustomError(error.message, error.statusCode ?? 500)
      programsLogger.programUpdateFailed(customError)
    },
  })
}

export const useAddProgramToTrash = () => {
  return useMutation({
    mutationFn: async ({ programId, userId }: { programId: string; userId: string }) => {
      const programRef = doc(db, 'programs', programId)

      const programData = await checkIfDocExists<ProgramType>({
        docRef: programRef,
        errorMsg: 'Program not found',
      })

      authorizedToDeleteProgram({ program: programData, userId })

      await updateDoc(programRef, { trashDate: serverTimestamp() as Timestamp })
      return { userId, organizationId: programData.organizationId }
    },
    onSuccess: ({ userId, organizationId }) => {
      toast.success('Program deleted successfully')
      queryClient.invalidateQueries({ queryKey: QEURY_KEY.programsForUser(organizationId) })
      queryClient.invalidateQueries({
        queryKey: QEURY_KEY.trashedProgramsForOrganization(organizationId),
      })
    },
    onError: (error: CustomError) => {
      toast.error('Failed to delete program. Please try again.')
      const customError = new CustomError(error.message, error.statusCode ?? 500)
      programsLogger.programTrashFailed(customError)
    },
  })
}

export const useDeleteProgram = () => {
  return useMutation({
    mutationFn: async ({ programId, userId }: { programId: string; userId: string }) => {
      const programRef = doc(db, 'programs', programId)

      const programData = await checkIfDocExists<ProgramType>({
        docRef: programRef,
        errorMsg: 'Program not found',
      })

      authorizedToDeleteProgram({ program: programData, userId })

      await deleteDoc(programRef)
      return { organizationId: programData.organizationId }
    },
    onSuccess: ({ organizationId }) => {
      toast.success('Program deleted successfully')
      queryClient.invalidateQueries({ queryKey: QEURY_KEY.programsForUser(organizationId) })
    },
    onError: (error: CustomError) => {
      toast.error('Failed to delete program. Please try again.')
      const customError = new CustomError(error.message, error.statusCode ?? 500)
      programsLogger.programDeleteFailed(customError)
    },
  })
}

export const useRestoreProgramFromTrash = () => {
  return useMutation({
    mutationFn: async ({ programId, userId }: { programId: string; userId: string }) => {
      const programRef = doc(db, 'programs', programId)

      const programData = await checkIfDocExists<ProgramType>({
        docRef: programRef,
        errorMsg: 'Program not found',
      })

      authorizedToDeleteProgram({ program: programData, userId })

      await updateDoc(programRef, { trashDate: null })
      return { organizationId: programData.organizationId }
    },
    onSuccess: ({ organizationId }) => {
      toast.success('Program restored successfully')
      queryClient.invalidateQueries({ queryKey: QEURY_KEY.programsForUser(organizationId) })
      queryClient.invalidateQueries({
        queryKey: QEURY_KEY.trashedProgramsForOrganization(organizationId),
      })
    },
    onError: (error: CustomError) => {
      toast.error('Failed to restore program. Please try again.')
      const customError = new CustomError(error.message, error.statusCode ?? 500)
      programsLogger.programRestoreFailed(customError)
    },
  })
}
