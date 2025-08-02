import type { ProgramType } from '@/types/Program'
import type { OrganizationType } from '@/types/Organization'
import { throwIfNotLoggedIn } from './auth'

type ShouldBeAbleToDeleteProgramParams = {
  program: ProgramType
  organization: OrganizationType
}

export const shouldBeAbleToDeleteProgram = ({
  program,
  organization,
}: ShouldBeAbleToDeleteProgramParams) => {
  const authUser = throwIfNotLoggedIn()

  if (!authUser || !program || !organization) {
    return false
  }

  return authUser.uid === organization.createdBy
}

type ShouldBeAbleToEditProgramParams = {
  program: ProgramType
  organization: OrganizationType
}

export const shouldBeAbleToEditProgram = ({
  program,
  organization,
}: ShouldBeAbleToEditProgramParams) => {
  const authUser = throwIfNotLoggedIn()

  if (!authUser || !program || !organization) {
    return false
  }

  return authUser.uid === organization.createdBy
}
