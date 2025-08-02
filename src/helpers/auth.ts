import { useAuthStore } from '@/stores/auth'

export const throwIfNotLoggedIn = (message = 'You are not logged in') => {
  const auth = useAuthStore()

  if (!auth.user) {
    throw new Error(message)
  }

  return auth.user
}