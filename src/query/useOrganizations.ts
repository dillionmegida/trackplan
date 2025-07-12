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
} from 'firebase/firestore'
import type { OrganizationType } from '@/types/Organization'
import type { UserType } from '@/types/User'
import { queryClient } from '@/configs/react-query'
import { toast } from 'vue3-toastify'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { CustomError } from '@/utils/error'
import { organizationLogger } from '@/services/logger/organizationLogger'

export const useCreateOrganization = () => {
  return useMutation({
    mutationFn: async ({ data }: { data: OrganizationType }) => {
      const organizationRef = doc(db, 'organizations', data.id)
      await setDoc(organizationRef, data)

      return { id: data.id }
    },
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ['organizations', id] })
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
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
    },
    onError: () => {
      toast.error('Failed to select organization. Please try again.')
    },
  })
}

export const useOrganizationsForUser = (userId: string) => {
  return useQuery({
    queryKey: ['organizations', userId],
    queryFn: async () => {
      const userRef = doc(db, 'users', userId)
      const userSnapshot = await getDoc(userRef)

      if (!userSnapshot.exists()) {
        throw new Error('User not found')
      }

      const userData = userSnapshot.data() as UserType
      const organizationIds = userData.organizationIds || []

      if (organizationIds.length === 0) {
        return []
      }

      const organizationsRef = collection(db, 'organizations')
      const q = query(organizationsRef, where('id', 'in', organizationIds))
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
    queryKey: ['organization', organizationId],
    queryFn: async () => {
      const organizationRef = doc(db, 'organizations', toValue(organizationId) as string)
      const docSnap = await getDoc(organizationRef)

      if (!docSnap.exists()) {
        throw new Error('Organization not found')
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as OrganizationType
    },
    enabled: !!organizationId,
  })
}

export const useUpdateOrganizationName = (organizationId: string) => {
  return useMutation({
    mutationFn: async (name: string) => {
      const organizationRef = doc(db, 'organizations', organizationId)
      const organizationSnapshot = await getDoc(organizationRef)

      if (!organizationSnapshot.exists()) {
        throw new CustomError('Organization not found', 404)
      }

      const organizationData = organizationSnapshot.data()
      const userId = organizationData.createdBy

      await updateDoc(organizationRef, { name })

      return { userId }
    },
    onSuccess: ({ userId }) => {
      queryClient.invalidateQueries({ queryKey: ['organization', organizationId] })
      queryClient.invalidateQueries({ queryKey: ['organizations', userId] })
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
    queryKey: ['organization-members', organizationId],
    queryFn: async () => {
      const organizationRef = doc(db, 'organizations', organizationId)
      const docSnap = await getDoc(organizationRef)

      if (!docSnap.exists()) {
        throw new Error('Organization not found')
      }

      // get all users where their organizationIds include the current organization
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('organizationIds', 'array-contains', organizationId))
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
      const organizationSnapshot = await getDoc(organizationRef)

      if (!organizationSnapshot.exists()) {
        throw new CustomError('Organization not found', 404)
      }

      const organizationData = organizationSnapshot.data()
      const createdById = organizationData.createdBy

      if (createdById !== authId) {
        throw new CustomError(
          'You are not authorized to remove a member from this organization',
          400,
        )
      }

      const userRef = doc(db, 'users', userId)
      const userSnapshot = await getDoc(userRef)

      if (!userSnapshot.exists()) {
        throw new CustomError('The member you are trying to remove is not found', 404)
      }

      const userData = userSnapshot.data()
      const organizationIds = userData.organizationIds.filter((id: string) => id !== organizationId)

      await updateDoc(userRef, { organizationIds })
    },
    onSuccess: () => {
      toast.success('Member removed from organization successfully')
      queryClient.invalidateQueries({ queryKey: ['organization-members', organizationId] })
    },
    onError: (error: any) => {
      toast.error(error.message ?? 'Failed to remove member from organization. Please try again.')
      const customError = new CustomError(error.message, error.statusCode || 500)
      organizationLogger.memberRemovedFailed(customError)
    },
  })
}
