import { useMutation, useQuery } from '@tanstack/vue-query'
import { db } from '@/configs/firebase'
import {
  collection,
  doc,
  setDoc,
  getDocs,
  where,
  query,
  updateDoc,
  getDoc,
  writeBatch,
  arrayRemove,
} from 'firebase/firestore'
import type { OrganizationType } from '@/types/Organization'
import type { UserType } from '@/types/User'
import { queryClient } from '@/configs/react-query'
import { toast } from 'vue3-toastify'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { CustomError } from '@/utils/error'
import { organizationLogger } from '@/services/logger/organizationLogger'
import type { ProgramType } from '@/types/Program'
import { checkIfDocExists } from '@/helpers/firebase'
import { QEURY_KEY } from './QueryKey'

export const useCreateOrganization = () => {
  return useMutation({
    mutationFn: async ({ data }: { data: OrganizationType }) => {
      const organizationRef = doc(db, 'organizations', data.id)
      await setDoc(organizationRef, data)

      return { id: data.id }
    },
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: QEURY_KEY.organization(id) })
      queryClient.invalidateQueries({ queryKey: QEURY_KEY.organizationsForUser(id) })
    },
    onError: (error: any) => {
      toast.error('Failed to create organization. Please try again.')
      const customError = new CustomError(error.message, error.statusCode || 500)
      organizationLogger.createOrganizationFailed(customError)
    },
  })
}

export const useSelectActiveOrganization = (userId: string) => {
  return useMutation({
    mutationFn: async ({ organizationId }: { organizationId: string }) => {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, { activeOrganizationId: organizationId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QEURY_KEY.user(userId) })
    },
    onError: () => {
      toast.error('Failed to select organization. Please try again.')
    },
  })
}

export const useOrganizationsForUser = (userId: string) => {
  return useQuery({
    queryKey: QEURY_KEY.organizationsForUser(userId),
    queryFn: async () => {
      const userRef = doc(db, 'users', userId)

      await checkIfDocExists<UserType>({
        docRef: userRef,
        errorMsg: 'User not found',
      })

      const organizationsRef = collection(db, 'organizations')
      const q = query(organizationsRef, where('memberIds', 'array-contains', userId))
      const organizationsSnapshot = await getDocs(q)

      const organizations = organizationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      return organizations as OrganizationType[]
    },
  })
}

export const useOrganization = (organizationId: MaybeRefOrGetter<string | undefined | null>) => {
  return useQuery({
    queryKey: QEURY_KEY.organization(toValue(organizationId) as string),
    queryFn: async () => {
      const organizationRef = doc(db, 'organizations', toValue(organizationId) as string)

      const organizationData = await checkIfDocExists<OrganizationType>({
        docRef: organizationRef,
        errorMsg: 'Organization not found',
      })

      return organizationData
    },
    enabled: !!organizationId,
  })
}

export const useUpdateOrganizationName = (organizationId: string) => {
  return useMutation({
    mutationFn: async (name: string) => {
      const organizationRef = doc(db, 'organizations', organizationId)

      const organizationData = await checkIfDocExists<OrganizationType>({
        docRef: organizationRef,
        errorMsg: 'Organization not found',
      })

      const userId = organizationData.createdBy

      await updateDoc(organizationRef, { name })

      return { userId }
    },
    onSuccess: ({ userId }) => {
      queryClient.invalidateQueries({ queryKey: QEURY_KEY.organization(organizationId) })
      queryClient.invalidateQueries({ queryKey: QEURY_KEY.organizationsForUser(userId) })
    },
    onError: (error: any) => {
      toast.error('Failed to update organization name. Please try again.')
      const customError = new CustomError(error.message, error.statusCode || 500)
      organizationLogger.updateOrganizationFailed(customError)
    },
  })
}

export const useMembersInOrganization = (organizationId: string) => {
  return useQuery({
    queryKey: QEURY_KEY.membersInOrganization(organizationId),
    queryFn: async () => {
      const organizationRef = doc(db, 'organizations', organizationId)

      await checkIfDocExists<OrganizationType>({
        docRef: organizationRef,
        errorMsg: 'Organization not found',
      })

      const organizationData = (await getDoc(organizationRef)).data() as OrganizationType;

      // get all members from organization memberIds
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where("id", 'in', organizationData.memberIds))
      const usersSnapshot = await getDocs(q)

      const users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      return users as UserType[]
    },
    enabled: !!organizationId,
  })
}

export const useRemoveMemberFromOrganization = (organizationId: string) => {
  return useMutation({
    mutationFn: async ({ authId, userId }: { authId: string; userId: string }) => {
      const organizationRef = doc(db, 'organizations', organizationId)

      const organizationData = await checkIfDocExists<OrganizationType>({
        docRef: organizationRef,
        errorMsg: 'Organization not found',
      })

      const createdById = organizationData.createdBy

      if (createdById !== authId) {
        throw new CustomError(
          'You are not authorized to remove a member from this organization',
          400,
        )
      }

      const userRef = doc(db, 'users', userId)

      const userData = await checkIfDocExists<UserType>({
        docRef: userRef,
        errorMsg: 'The member you are trying to remove is not found',
      })

      const batch = writeBatch(db)

      const programsRef = collection(db, 'programs')
      const programsQ = query(programsRef, where('memberIds', 'array-contains', userId))
      const programsSnapshot = await getDocs(programsQ)

      programsSnapshot.forEach((programDoc) => {
        const programData = programDoc.data() as ProgramType
        if (!programData.memberIds) return

        batch.update(programDoc.ref, { memberIds: arrayRemove(userId) })
      })

      batch.update(organizationRef, { memberIds: arrayRemove(userId) })

      await batch.commit()
    },
    onSuccess: () => {
      toast.success(
        'Member removed from organization successfully. Please refresh the page to see the changes.',
      )
      queryClient.invalidateQueries({ queryKey: QEURY_KEY.membersInOrganization(organizationId) })
    },
    onError: (error: any) => {
      toast.error(error.message ?? 'Failed to remove member from organization. Please try again.')
      const customError = new CustomError(error.message, error.statusCode || 500)
      organizationLogger.memberRemovedFailed(customError)
    },
  })
}
