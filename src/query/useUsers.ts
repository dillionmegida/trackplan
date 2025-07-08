import { useMutation, useQuery } from '@tanstack/vue-query'
import { db } from '@/configs/firebase'
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import type { UserType } from '@/types/User'
import { toast } from 'vue3-toastify'
import { queryClient } from '@/configs/react-query'

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

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const userRef = doc(db, 'users', userId)
      const userSnapshot = await getDoc(userRef)
      if (!userSnapshot.exists()) {
        return "not-found"
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
    },
    onError: () => {
      toast.error('Failed to create user. Please try again.')
    },
  })
}
