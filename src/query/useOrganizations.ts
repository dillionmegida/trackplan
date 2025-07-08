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
    onError: () => {
      toast.error('Failed to create organization. Please try again.')
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
      const organizationRef = doc(db, 'organizations', toValue(organizationId))
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
