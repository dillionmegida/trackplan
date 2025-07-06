import { useQuery } from '@tanstack/vue-query'
import { db } from '@/configs/firebase'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'

export const useUsers = () => {
  const query = useQuery({
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

  return {
    query,
  }
}

export const useUser = (userId: string) => {
  const query = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const userRef = doc(db, 'users', userId)
      const userSnapshot = await getDoc(userRef)
      if (!userSnapshot.exists()) {
        throw new Error('User not found')
      }
      return { id: userSnapshot.id, ...userSnapshot.data() }
    },
  })

  return {
    query,
  }
}
