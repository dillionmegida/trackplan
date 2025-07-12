import { useMutation, useQuery } from '@tanstack/vue-query'
import { db } from '@/configs/firebase'
import { collection, doc, getDoc, getDocs, query, updateDoc, where, writeBatch } from 'firebase/firestore'
import { useAuthStore } from '@/stores/auth'
import type { ProgramType } from '@/types/Program'
import { toast } from 'vue3-toastify'
import { CustomError } from '@/utils/error'
import { organizationLogger } from '@/services/logger/organizationLogger'
import { queryClient } from '@/configs/react-query'

export function useProgramsUserHasAccessTo(memberId: string) {
  const auth = useAuthStore()

  return useQuery({
    queryKey: ['organizationMemberAccess', memberId],
    queryFn: async () => {
      if (!auth.user) throw new Error('User not authenticated')

      const userRef = doc(db, 'users', memberId)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        throw new Error('User not found')
      }

      const programsRef = collection(db, 'programs')
      // get all programs with memberids array including the member
      const q = query(programsRef, where('memberIds', 'array-contains', memberId))
      const programsSnapshot = await getDocs(q)
      const programIds = programsSnapshot.docs.map((doc) => doc.id)
      

      return programIds
    },
    enabled: !!auth.user,
  })
}

export function useUpdateOrganizationMemberAccess() {
  const auth = useAuthStore()

  return useMutation({
    mutationFn: async ({memberId, programId, shouldHaveAccess }: {
      memberId: string
      programId: string
      shouldHaveAccess: boolean
    }) => {
      if (!auth.user) throw new Error('User not authenticated')

      const userRef = doc(db, 'users', memberId)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        throw new Error('User not found')
      }

      const programRef = doc(db, 'programs', programId)

      // Get current access
      const programSnap = await getDoc(programRef)
      
      if (!programSnap.exists()) {
        throw new Error('Program not found')
      }

      const programData = programSnap.data()

      if (programData.createdBy !== auth.user.uid) {
        throw new Error('You are not authorized to update access to this program')
      }

      const currentAccess = programData?.memberIds || []

      // Update access
      const newAccess = shouldHaveAccess
        ? [...currentAccess, memberId]
        : currentAccess.filter(id => id !== memberId)

      await updateDoc(programRef, {
        memberIds: newAccess
      })

      return newAccess
    },
    onSuccess: () => {
      toast.success('Updated user access')
      queryClient.invalidateQueries({ queryKey: ['org-programs', auth.user?.uid] })
      queryClient.invalidateQueries({ queryKey: ['user-programs', auth.user?.uid] })
    },
    onError: (error: any) => {
      toast.error(error.message ?? 'Failed to update access')
      const customError = new CustomError(error.message, error.statusCode ?? 500)
      organizationLogger.memberAddedToProgramFailed(customError)

    }
  })
}
