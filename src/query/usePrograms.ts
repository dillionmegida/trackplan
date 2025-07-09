import { QueryClient, useQuery } from '@tanstack/vue-query'

import { db } from '@/configs/firebase'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
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

export const useProgramsForOrganization = (
  organizationId: MaybeRefOrGetter<string | undefined | null>,
) => {
  return useQuery({
    queryKey: ['programs', () => toValue(organizationId)],
    queryFn: async () => {
      const orgId = toValue(organizationId)
      if (!orgId) return []

      const programsRef = collection(db, 'programs')
      const q = query(
        programsRef,
        where('organizationId', '==', orgId),
        where('trashDate', '==', null),
      )
      const programsSnapshot = await getDocs(q)
      const programs = programsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      return programs as ProgramType[]
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
        throw new Error('Program not found')
      }
      return {
        id: programDoc.id,
        ...programDoc.data(),
      } as ProgramType
    },
    enabled: !!programId,
  })
}

type UseCreateProgramArgs = {
  data: Omit<ProgramType, 'id'>
}

export const useCreateProgram = () => {
  return useMutation({
    mutationFn: async ({ data }: UseCreateProgramArgs): Promise<{ id: string; organizationId: string }> => {
      const programRef = collection(db, 'programs')
      const docRef = await addDoc(programRef, data)
      return { id: docRef.id, organizationId: data.organizationId }
    },
    onSuccess: ({ id, organizationId }) => {
      toast.success('Program created successfully')
      queryClient.invalidateQueries({ queryKey: ['programs', organizationId] })
    },
    onError: (error) => {
      toast.error('Failed to create program. Please try again.')
    },
  })
}

type UseUpdateProgramArgs = {
  data: Omit<ProgramType, 'createdAt' | 'createdBy'>
}

export const useUpdateProgram = () => {
  return useMutation({
    mutationFn: async ({
      data,
    }: UseUpdateProgramArgs): Promise<{ id: string; organizationId: string }> => {
      const programRef = doc(db, 'programs', data.id)

      const programDoc = await getDoc(programRef)
      if (!programDoc.exists()) {
        throw new Error('Program not found')
      }
      const programData = programDoc.data()
      if (programData.organizationId !== data.organizationId) {
        throw new Error('You are not authorized to update this program')
      }

      await updateDoc(programRef, { ...programData, ...data })
      return { id: data.id, organizationId: data.organizationId }
    },
    onSuccess: ({ id, organizationId }) => {
      toast.success('Program updated successfully')
      queryClient.invalidateQueries({ queryKey: ['program', id] })
      queryClient.invalidateQueries({ queryKey: ['programs', organizationId] })
    },
    onError: (error) => {
      toast.error('Failed to update program. Please try again.')
    },
  })
}

export const useAddProgramToTrash = () => {
  return useMutation({
    mutationFn: async ({ programId, userId }: { programId: string; userId: string }) => {
      const programRef = doc(db, 'programs', programId)
      const programDoc = await getDoc(programRef)
      if (!programDoc.exists()) {
        throw new Error('Program not found')
      }

      const programData = programDoc.data()
      if (programData.organizationId !== userId) {
        throw new Error('You are not authorized to delete this program')
      }

      await updateDoc(programRef, { trashDate: serverTimestamp() as Timestamp })
      return { userId }
    },
    onSuccess: ({ userId }) => {
      toast.success('Program deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['programs', userId] })
      queryClient.invalidateQueries({ queryKey: ['programs-trash', userId] })
    },
    onError: (error) => {
      toast.error('Failed to delete program. Please try again.')
    },
  })
}

export const useDeleteProgram = () => {
  return useMutation({
    mutationFn: async ({ programId, userId }: { programId: string; userId: string }) => {
      const programRef = doc(db, 'programs', programId)
      const programDoc = await getDoc(programRef)
      if (!programDoc.exists()) {
        throw new Error('Program not found')
      }

      const programData = programDoc.data()
      if (programData.organizationId !== userId) {
        throw new Error('You are not authorized to delete this program')
      }

      await deleteDoc(programRef)
      return { userId }
    },
    onSuccess: ({ userId }) => {
      toast.success('Program deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['programs', userId] })
    },
    onError: (error) => {
      toast.error('Failed to delete program. Please try again.')
    },
  })
}

export const useRestoreProgramFromTrash = () => {
  return useMutation({
    mutationFn: async ({ programId, userId }: { programId: string; userId: string }) => {
      const programRef = doc(db, 'programs', programId)
      const programDoc = await getDoc(programRef)
      if (!programDoc.exists()) {
        throw new Error('Program not found')
      }

      const programData = programDoc.data()
      if (programData.organizationId !== userId) {
        throw new Error('You are not authorized to restore this program')
      }

      await updateDoc(programRef, { trashDate: null })
      return { userId }
    },
    onSuccess: ({ userId }) => {
      toast.success('Program restored successfully')
      queryClient.invalidateQueries({ queryKey: ['programs', userId] })
    },
    onError: (error) => {
      toast.error('Failed to restore program. Please try again.')
    },
  })
}
