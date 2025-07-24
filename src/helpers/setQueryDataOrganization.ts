import { queryClient } from '@/configs/react-query'
import { QEURY_KEY } from '@/query/QueryKey'
import type { OrganizationType } from '@/types/Organization'
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
  userId: string,
) {
  queryClient.setQueryData(
    QEURY_KEY.organizationMembers(),
    (oldData: UserType[] | undefined) => {
      if (!oldData) return

      return oldData.filter((id) => id.id !== userId)
    },
  )
}

export function updateOrganizationQueryData(
  organizationData: OrganizationType,
  authUserId: string,
) {
  queryClient.setQueryData(
    QEURY_KEY.organization(organizationData.id),
    (oldData: OrganizationType | undefined) => {
      if (!oldData) return

      return { ...oldData, ...organizationData }
    },
  )

  queryClient.setQueryData(
    QEURY_KEY.organizationsForUser(authUserId),
    (oldData: OrganizationType[] | undefined) => {
      if (!oldData) return

      return oldData.map((organization) => {
        if (organization.id === organizationData.id) {
          return organizationData
        }
        return organization
      })
    },
  )
}