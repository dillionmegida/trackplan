// stores/auth.js
import { defineStore } from 'pinia'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'

export const useAuthStore = defineStore<'auth', {
  user: User | null
  isAuthenticated: boolean
}>('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
  }),
  actions: {
    init() {
      const auth = getAuth()
      onAuthStateChanged(auth, (user) => {
        this.user = user
        this.isAuthenticated = !!user
      })
    }
  }
})
