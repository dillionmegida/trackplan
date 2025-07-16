import { useMutation, useQuery } from '@tanstack/vue-query'
import { db } from '@/configs/firebase'
import { collection, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where, writeBatch, type DocumentReference } from 'firebase/firestore'
import type { UserType } from '@/types/User'
import { toast } from 'vue3-toastify'
import { queryClient } from '@/configs/react-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const NOT_FOUND = 'not-found'
import { onboardingLogger } from '@/services/logger/onboardingLogger'
import { CustomError } from '@/utils/error'
import { checkIfDocExists } from '@/helpers/firebase'
import { QEURY_KEY } from './QueryKey'

export const useUsers = () => {
  return useQuery({
    queryKey: QEURY_KEY.users(),
    queryFn: async () => {
      const usersRef = collection(db, 'users')
      const usersSnapshot = await getDocs(usersRef)
      const users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      return users
    },
  })
}

export const useUser = (userId: string | MaybeRefOrGetter<string | undefined | null>) => {
  return useQuery({
    queryKey: QEURY_KEY.user(toValue(userId) ?? ''),
    queryFn: async () => {
      const userRef = doc(db, 'users', toValue(userId) ?? '')
      const userSnapshot = await getDoc(userRef)

      // useful for onboarding
      if (!userSnapshot.exists()) {
        return { name: NOT_FOUND } as UserType
      }

      return { id: userSnapshot.id, ...userSnapshot.data() } as UserType
    },
    enabled: !!userId,
  })
}

type UseUpdateUserArgs = {
  userId: string
  data: UserType
}

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async ({ userId, data }: UseUpdateUserArgs) => {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, data)
    },
    // TODO: invalidate stuff, onsuccess stuff
  })
}

type UseCreateUserArgs = {
  data: UserType
}

export const useCreateUser = (authId: string) => {
  return useMutation({
    mutationFn: async ({ data }: UseCreateUserArgs) => {
      const batch = writeBatch(db)
      const userRef = doc(db, 'users', data.id)
      batch.set(userRef, data)

      const organizationRef = doc(db, 'organizations', data.id)
      batch.set(organizationRef, {
        id: data.id,
        name: data.name,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        createdBy: data.id,
        updatedBy: data.id,
      })

      await batch.commit()
    },
    onSuccess: () => {
      queryClient.invalidateQueries()
      onboardingLogger.confirmAccountSuccess()
    },
    onError: (error: CustomError) => {
      toast.error('Failed to create user. Please try again.')
      const customError = new CustomError(error.message, error.statusCode ?? 500)
      onboardingLogger.confirmAccountFailed(customError)
    },
  })
}

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      const userRef = doc(db, 'users', userId)

      await checkIfDocExists({ docRef: userRef, errorMsg: 'User not found' })

      const batch = writeBatch(db)

      const organizationsRef = collection(db, 'organizations')
      const organizationsQ = query(organizationsRef, where('createdBy', '==', userId))
      const organizationsSnapshot = await getDocs(organizationsQ)
      const organizations = organizationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      const programDocRefs: DocumentReference[] = []
      const organizationRefs: DocumentReference[] = []

      // First, collect all program document references and organization references
      for (const organization of organizations) {
        const organizationRef = doc(db, 'organizations', organization.id)
        const programsCollectionRef = collection(db, 'programs')
        const programQ = query(programsCollectionRef, where('organizationId', '==', organization.id))
        const programSnapshot = await getDocs(programQ)
        
        // Add each program document reference to the batch
        programSnapshot.docs.forEach((doc) => {
          programDocRefs.push(doc.ref)
        })
        
        organizationRefs.push(organizationRef)
      }

      // Add all program deletions to the batch
      programDocRefs.forEach((programRef) => batch.delete(programRef))
      // Add all organization deletions to the batch
      organizationRefs.forEach((organizationRef) => batch.delete(organizationRef))

      // Add user deletion to the batch
      batch.delete(userRef)

      await batch.commit()
    },
    onSuccess: () => {
      // invalidate all queries
      queryClient.invalidateQueries()
      toast.success('User deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to delete user. Please try again.')
    },
  })
}
