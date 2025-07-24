import { queryClient } from '@/configs/react-query'
import { QEURY_KEY } from '@/query/QueryKey'

export function addUserToOrganizationQueryData(
  userId: string,
) {
  queryClient.setQueryData(
    QEURY_KEY.organizationMembers(),
    (oldData: string[]) => {
      return [...oldData, userId]
    },
  )
}

export function removeUserFromOrganizationQueryData(
  userId: string,
) {
  queryClient.setQueryData(
    QEURY_KEY.organizationMembers(),
    (oldData: string[]) => {
      return oldData.filter((id) => id !== userId)
    },
  )
}