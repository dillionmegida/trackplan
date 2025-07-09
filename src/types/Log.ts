import { Timestamp } from 'firebase/firestore'

export enum LogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error'
}

export enum LogAction {
  // Auth
  USER_SIGNED_IN = 'user_signed_in',
  USER_SIGNED_OUT = 'user_signed_out',
  
  // Programs
  PROGRAM_CREATED = 'program_created',
  PROGRAM_UPDATED = 'program_updated',
  PROGRAM_DELETED = 'program_deleted',
  PROGRAM_TRASHED = 'program_trashed',
  PROGRAM_RESTORED = 'program_restored',
  
  // Organization
  ORGANIZATION_CREATED = 'organization_created',
  ORGANIZATION_UPDATED = 'organization_updated',
  MEMBER_ADDED = 'member_added',
  MEMBER_REMOVED = 'member_removed',
  
  // System
  ERROR_OCCURRED = 'error_occurred',
  PERMISSION_DENIED = 'permission_denied',
  
  // Auth
  USER_PASSWORD_RESET = 'user_password_reset',
  
  // Program Actions
  PROGRAM_CREATION_FAILED = 'program_creation_failed',
  
  // Page Visits
  PAGE_VISIT = 'page_visit'
}

export type LogEntry = {
  id?: string
  level: LogLevel
  action: LogAction
  userId: string
  organizationId?: string
  targetId?: string
  targetType: "program" | "organization" | "user"
  message: string
  metadata?: Record<string, any>
  timestamp: Timestamp
}
