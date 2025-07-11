import { useMutation } from '@tanstack/vue-query'
import { db } from '@/configs/firebase'
import {
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore'
import { toast } from 'vue3-toastify'
import { queryClient } from '@/configs/react-query'
import { inviteLogger } from '@/services/logger/inviteLogger'
import { CustomError } from '@/utils/error'

export type InviteUserArgs = {
  email: string
}

export const useInviteUser = (organizationId: string) => {
  return useMutation({
    mutationFn: async ({ email }: InviteUserArgs) => {
      // TODO: keep track of pending invites so people can accept

      const organizationRef = doc(db, 'organizations', organizationId)
      const organizationSnapshot = await getDoc(organizationRef)

      if (!organizationSnapshot.exists()) {
        throw new Error('Organization not found')
      }

      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('email', '==', email))
      const userSnapshot = await getDocs(q)

      if (userSnapshot.empty) {
        throw new Error('This email does not exist')
      }

      const user = userSnapshot.docs[0].data()

      if (user.organizationIds.includes(organizationId)) {
        throw new Error('This user is already a member of this organization')
      }

      const userRef = doc(db, 'users', user.id)

      const organizationIds = [...user.organizationIds, organizationId]

      await updateDoc(userRef, { organizationIds })
    },
    onSuccess: () => {
      toast.success('Invitation sent successfully!')
      inviteLogger.inviteUserToOrganizationSuccess()
      // TODO:
      // queryClient.invalidateQueries({ queryKey: ['invites', organizationId] })
    },
    onError: (error: any) => {
      toast.error(error.message ?? 'Failed to send invitation. Please try again.')
      const customError = new CustomError(error.message, error.statusCode ?? 500)
      inviteLogger.inviteUserToOrganizationFailed(customError)
    },
  })
}
