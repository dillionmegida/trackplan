export const LINKS = {
  onboarding: '/onboarding',
  landing: '/',
  home: '/dashboard',
  login: '/login',
  createProgram: '/dashboard/program/create',
  program: (id: string) => `/dashboard/program/${id}`,
  program_edit: (id: string) => `/dashboard/program/${id}/edit`,
  trash: '/trash',
  archived: '/archived',
  my_account: '/my-account',
  organization: (id: string) => `/dashboard/organization/${id}`,
  organization_edit: (id: string) => `/dashboard/organization/${id}/edit`,
  inviteToOrganization: (id: string) => `/dashboard/organization/${id}/invite`
}
