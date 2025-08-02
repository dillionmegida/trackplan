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

export const groupPrograms = (programs: ProgramType[]) => {
  if (!programs || programs.length === 0) {
    return {
      recent: [],
      remaining: []
    }
  }

  // Sort programs by updatedAt in descending order (newest first)
  const sortedPrograms = [...programs].sort((a, b) => 
    b.updatedAt.toDate().getTime() - a.updatedAt.toDate().getTime()
  )

  // Get the 3 most recently updated programs
  const recent = sortedPrograms.slice(0, 3)
  
  // Get the rest of the programs
  const remaining = sortedPrograms.slice(3)

  return {
    recent,
    remaining
  }
}
  