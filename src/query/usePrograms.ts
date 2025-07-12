import { QueryClient, useQuery } from '@tanstack/vue-query'

import { db } from '@/configs/firebase'
import {
  addDoc,
  and,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  or,
  query,
  serverTimestamp,
  setDoc,
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

export const useProgramsUserHasAccessTo = ({
  organizationId,
  authUserId,
}: {
  organizationId: MaybeRefOrGetter<string | undefined | null>
  authUserId: string
}) => {
  return useQuery({
    queryKey: ['user-programs', () => toValue(organizationId)],
    queryFn: async () => {
      const orgId = toValue(organizationId)
      if (!orgId) return []

      const programsRef = collection(db, 'programs')
      const q = query(
        programsRef,
        and(
          where('organizationId', '==', orgId),
          where('trashDate', '==', null),
          or(
            where('memberIds', 'array-contains', authUserId),
            where('createdBy', '==', authUserId),
          ),
        ),
      )

      const programsSnapshot = await getDocs(q)
      const programs = programsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      return programs as ProgramType[]
    },
    throwOnError(error: CustomError, query) {
      programsLogger.programsForOrganizationFetchFailed(error)
      return false
    },
    enabled: () => !!toValue(organizationId),
  })
}

export const useProgramsForOrganization = (
  organizationId: MaybeRefOrGetter<string | undefined | null>
) => {
  return useQuery({
    queryKey: ['org-programs', () => toValue(organizationId)],
    queryFn: async () => {
      const orgId = toValue(organizationId)
      if (!orgId) return []

      const programsRef = collection(db, 'programs')
      const q = query(
        programsRef,
        and(
          where('organizationId', '==', orgId),
          where('trashDate', '==', null),
        ),
      )

      const programsSnapshot = await getDocs(q)
      const programs = programsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      return programs as ProgramType[]
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
) => {
  return useQuery({
    queryKey: ['programs-trash', organizationId],
    queryFn: async () => {
      const orgId = toValue(organizationId)
      if (!orgId) return []

      const programsRef = collection(db, 'programs')
      const q = query(
        programsRef,
        where('organizationId', '==', orgId),
        where('trashDate', '!=', null),
      )
      const programsSnapshot = await getDocs(q)
      const programs = programsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      return programs as ProgramType[]
    },
    enabled: !!organizationId,
  })
}

export const useProgram = (programId: string) => {
  return useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      const programRef = doc(db, 'programs', programId)
      const programDoc = await getDoc(programRef)
      if (!programDoc.exists()) {
        throw new CustomError('Program not found', 404)
      }

      return {
        id: programDoc.id,
        ...programDoc.data(),
      } as ProgramType
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
      queryClient.invalidateQueries({ queryKey: ['user-programs', organizationId] })
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

      const programDoc = await getDoc(programRef)
      if (!programDoc.exists()) {
        throw new CustomError('Program not found', 404)
      }
      const programData = programDoc.data()
      if (programData.createdBy !== userId) {
        throw new CustomError('You are not authorized to update this program', 403)
      }

      await updateDoc(programRef, { ...programData, ...data })
      return { id: data.id, organizationId: data.organizationId }
    },
    onSuccess: ({ id, organizationId }) => {
      toast.success('Program updated successfully')
      queryClient.invalidateQueries({ queryKey: ['program', id] })
      queryClient.invalidateQueries({ queryKey: ['user-programs', organizationId] })
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
      const programDoc = await getDoc(programRef)
      if (!programDoc.exists()) {
        throw new CustomError('Program not found', 404)
      }

      const programData = programDoc.data()
      if (programData.organizationId !== userId) {
        throw new CustomError('You are not authorized to delete this program', 403)
      }

      await updateDoc(programRef, { trashDate: serverTimestamp() as Timestamp })
      return { userId }
    },
    onSuccess: ({ userId }) => {
      toast.success('Program deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['user-programs', userId] })
      queryClient.invalidateQueries({ queryKey: ['programs-trash', userId] })
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
      const programDoc = await getDoc(programRef)
      if (!programDoc.exists()) {
        throw new CustomError('Program not found', 404)
      }

      const programData = programDoc.data()
      if (programData.organizationId !== userId) {
        throw new CustomError('You are not authorized to delete this program', 403)
      }

      await deleteDoc(programRef)
      return { userId }
    },
    onSuccess: ({ userId }) => {
      toast.success('Program deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['user-programs', userId] })
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
      const programDoc = await getDoc(programRef)
      if (!programDoc.exists()) {
        throw new CustomError('Program not found', 404)
      }

      const programData = programDoc.data()
      if (programData.organizationId !== userId) {
        throw new CustomError('You are not authorized to restore this program', 403)
      }

      await updateDoc(programRef, { trashDate: null })
      return { userId }
    },
    onSuccess: ({ userId }) => {
      toast.success('Program restored successfully')
      queryClient.invalidateQueries({ queryKey: ['user-programs', userId] })
    },
    onError: (error: CustomError) => {
      toast.error('Failed to restore program. Please try again.')
      const customError = new CustomError(error.message, error.statusCode ?? 500)
      programsLogger.programRestoreFailed(customError)
    },
  })
}
