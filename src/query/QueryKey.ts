export const QEURY_KEY = {
  // Programs
  programsForUser: (organizationId: string) => ['user-programs', organizationId],
  programsForOrganization: (organizationId: string) => ['org-programs', organizationId],
  trashedProgramsForOrganization: (organizationId: string) => ['org-programs-trash', organizationId],
  program: (programId: string) => ['program', programId],
  demoPrograms: () => ['demo-programs'],

  // Organizations
  organizationsForUser: (userId: string) => ['user-organizations', userId],
  organization: (organizationId: string) => ['organization', organizationId],

  // Program Categories
  programCategories: (programId: string) => ['program-categories', programId],

  // Users
  users: () => ['users'],
  user: (userId: string) => ['user', userId],

  // Program Checklists
  programChecklists: (programId: string) => ['program-checklists', programId],

  // Orgaanization Members
  organizationMembers: () => ['organization-members'],
  organizationMemberAccess: (memberId: string) => ['organization-member-access', memberId],

}