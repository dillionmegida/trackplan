import { queryClient } from '@/configs/react-query'
import { QEURY_KEY } from '@/query/QueryKey'
import type { ProgramType } from '@/types/Program'

export function addProgramToOrganizationQueryData(programData: ProgramType) {
  queryClient.setQueryData(
    QEURY_KEY.programsForOrganization(programData.organizationId),
    (oldData: ProgramType[] | undefined) => {
      if (!oldData) return
      
      return [...oldData, programData]
    },
  )
  queryClient.setQueryData(
    QEURY_KEY.programsForUser(programData.organizationId),
    (oldData: ProgramType[] | undefined) => {
      if (!oldData) return
      
      return [...oldData, programData]
    },
  )
}

export function updateProgramQueryData(programData: ProgramType) {
  queryClient.setQueryData(
    QEURY_KEY.program(programData.id),
    (oldData: ProgramType) => {
      return { ...oldData, ...programData }
    },
  )
  queryClient.setQueryData(
    QEURY_KEY.programsForUser(programData.organizationId),
    (oldData: ProgramType[] | undefined) => {
      if (!oldData) return

      return oldData.map((program) => (program.id === programData.id ? programData : program))
    },
  )
  queryClient.setQueryData(
    QEURY_KEY.programsForOrganization(programData.organizationId),
    (oldData: ProgramType[] | undefined) => {
      if (!oldData) return
      
      return oldData.map((program) => (program.id === programData.id ? programData : program))
    },
  )
}

export function restoreProgramFromTrashQueryData(programData: ProgramType) {
  queryClient.setQueryData(
    QEURY_KEY.programsForUser(programData.organizationId),
    (oldData: ProgramType[] | undefined) => {
      if (!oldData) return
  
      return [...oldData, programData]
    },
  )
  queryClient.setQueryData(
    QEURY_KEY.trashedProgramsForOrganization(programData.organizationId),
    (oldData: ProgramType[] | undefined) => {
      if (!oldData) return
      
      return oldData.filter((program) => program.id !== programData.id)
    },
  )
}

export function addProgramToTrashQueryData(programData: ProgramType) {
  queryClient.setQueryData(
    QEURY_KEY.trashedProgramsForOrganization(programData.organizationId),
    (oldData: ProgramType[] | undefined) => {
      if (!oldData) return
      
      return [...oldData, programData]
    },
  )
  queryClient.setQueryData(
    QEURY_KEY.programsForUser(programData.organizationId),
    (oldData: ProgramType[] | undefined) => {
      if (!oldData) return
      
      return oldData.filter((program) => program.id !== programData.id)
    },
  )
}

export function deleteProgramQueryData(programData: ProgramType) {
  queryClient.setQueryData(
    QEURY_KEY.trashedProgramsForOrganization(programData.organizationId),
    (oldData: ProgramType[] | undefined) => {
      if (!oldData) return
      
      return oldData.filter((program) => program.id !== programData.id)
    },
  )
}