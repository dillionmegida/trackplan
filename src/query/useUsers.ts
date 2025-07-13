import { useMutation, useQuery } from '@tanstack/vue-query'
import { db } from '@/configs/firebase'
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where, writeBatch, type DocumentReference } from 'firebase/firestore'
import type { UserType } from '@/types/User'
import { toast } from 'vue3-toastify'
import { queryClient } from '@/configs/react-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

export const NOT_FOUND = 'not-found'
import { onboardingLogger } from '@/services/logger/onboardingLogger'
import { CustomError } from '@/utils/error'
import { checkIfDocExists } from '@/helpers/firebase'

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
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
    queryKey: ['user', userId],
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
  })
}

type UseCreateUserArgs = {
  data: UserType
}

export const useCreateUser = (authId: string) => {
  return useMutation({
    mutationFn: async ({ data }: UseCreateUserArgs) => {
      const userRef = doc(db, 'users', data.id)
      await setDoc(userRef, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', authId] })
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

      await checkIfDocExists({ docRef: userRef, label: 'User' })

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
          console.log(doc.data())
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

      // await batch.commit()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to delete user. Please try again.')
    },
  })
}
