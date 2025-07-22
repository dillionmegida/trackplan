import { useMutation, useQuery } from '@tanstack/vue-query'
import { db } from '@/configs/firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { useAuthStore } from '@/stores/auth'
import type { ProgramType } from '@/types/Program'
import { toast } from 'vue3-toastify'
import { CustomError } from '@/utils/error'
import { organizationLogger } from '@/services/logger/organizationLogger'
import { queryClient } from '@/configs/react-query'
import { authorizedToUpdateProgram, checkIfDocExists } from '@/helpers/firebase'
import type { UserType } from '@/types/User'
import { QEURY_KEY } from './QueryKey'
import type { OrganizationType } from '@/types/Organization'

export function useProgramsUserHasAccessTo(memberId: string) {
  const auth = useAuthStore()

  return useQuery({
    queryKey: QEURY_KEY.organizationMemberAccess(memberId),
    queryFn: async () => {
      if (!auth.user) throw new Error('User not authenticated')

      const userRef = doc(db, 'users', memberId)
      await checkIfDocExists<UserType>({ docRef: userRef, errorMsg: 'User not found' })

      const programsRef = collection(db, 'programs')
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
    mutationFn: async ({
      memberId,
      organizationId,
      programId,
      shouldHaveAccess,
    }: {
      memberId: string
      organizationId: string
      programId: string
      shouldHaveAccess: boolean
    }) => {
      if (!auth.user) throw new Error('User not authenticated')

      const organizationRef = doc(db, 'organizations', organizationId)
      const organizationData = await checkIfDocExists<OrganizationType>({
        docRef: organizationRef,
        errorMsg: 'Organization not found',
      })

      if (!organizationData.memberIds.includes(memberId)) {
        throw new Error('User is not a member of this organization')
      }

      const programRef = doc(db, 'programs', programId)

      const programData = await checkIfDocExists<ProgramType>({
        docRef: programRef,
        errorMsg: 'Program not found',
      })

      authorizedToUpdateProgram({ program: programData, userId: auth.user.uid })

      const currentAccess = programData?.memberIds || []

      const newAccess = shouldHaveAccess
        ? [...currentAccess, memberId]
        : currentAccess.filter((id) => id !== memberId)

      await updateDoc(programRef, {
        memberIds: newAccess,
      })

      return newAccess
    },
    onSuccess: () => {
      toast.success('Updated user access')
    },
    onError: (error: any) => {
      toast.error(error.message ?? 'Failed to update access')
      const customError = new CustomError(error.message, error.statusCode ?? 500)
      organizationLogger.memberAddedToProgramFailed(customError)
    },
  })
}
