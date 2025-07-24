import { queryClient } from '@/configs/react-query'
import { QEURY_KEY } from '@/query/QueryKey'
import type { UserType } from '@/types/User'

export function addUserToOrganizationQueryData(
  user: UserType,
) {
  queryClient.setQueryData(
    QEURY_KEY.organizationMembers(),
    (oldData: UserType[] | undefined) => {
      if (!oldData) return

      return [...oldData, user]
    },
  )
}

export function removeUserFromOrganizationQueryData(
  user: UserType,
) {
  queryClient.setQueryData(
    QEURY_KEY.organizationMembers(),
    (oldData: UserType[] | undefined) => {
      if (!oldData) return

      return oldData.filter((id) => id.id !== user.id)
    },
  )
}