import { Timestamp } from 'firebase/firestore'

export enum LogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

export enum LogAction {
  // Auth
  USER_SIGNED_IN_SUCCESS = 'user_signed_in_success',
  USER_SIGNED_IN_FAILED = 'user_signed_in_failed',
  USER_SIGNED_OUT_SUCCESS = 'user_signed_out_success',
  USER_SIGNED_OUT_FAILED = 'user_signed_out_failed',

  // Programs
  PROGRAM_FETCH_FAILED = 'program_fetch_failed',
  PROGRAM_FETCH_SUCCESS = 'program_fetch_success',
  PROGRAMS_FOR_ORGANIZATION_FETCH_SUCCESS = 'programs_for_organization_fetch_success',
  PROGRAMS_FOR_ORGANIZATION_FETCH_FAILED = 'programs_for_organization_fetch_failed',
  PROGRAM_UPDATE_FAILED = 'program_update_failed',
  PROGRAM_UPDATE_SUCCESS = 'program_update_success',
  PROGRAM_CREATED = 'program_created',
  PROGRAM_UPDATED = 'program_updated',
  PROGRAM_DELETED_SUCCESS = 'program_deleted_success',
  PROGRAM_DELETED_FAILED = 'program_deleted_failed',
  PROGRAM_TRASHED_SUCCESS = 'program_trashed_success',
  PROGRAM_TRASHED_FAILED = 'program_trashed_failed',
  PROGRAM_RESTORED_SUCCESS = 'program_restored_success',
  PROGRAM_RESTORED_FAILED = 'program_restore_failed',

  // Organization
  ORGANIZATION_CREATED_SUCCESS = 'organization_created_success',
  ORGANIZATION_CREATED_FAILED = 'organization_created_failed',
  ORGANIZATION_UPDATED_SUCCESS = 'organization_updated_success',
  ORGANIZATION_UPDATED_FAILED = 'organization_updated_failed',
  MEMBER_ADDED = 'member_added',
  MEMBER_ADDED_FAILED = 'member_added_failed',
  MEMBER_REMOVED = 'member_removed',
  MEMBER_REMOVED_FAILED = 'member_removed_failed',
  MEMBER_ADDED_TO_PROGRAM = 'member_added_to_program',
  MEMBER_ADDED_TO_PROGRAM_FAILED = 'member_added_to_program_failed',

  // System
  ERROR_OCCURRED = 'error_occurred',
  PERMISSION_DENIED = 'permission_denied',

  // Auth
  USER_PASSWORD_RESET = 'user_password_reset',

  // Program Actions
  PROGRAM_CREATION_FAILED = 'program_creation_failed',

  // Page Visits
  PAGE_VISIT = 'page_visit',

  // Onboarding
  CONFIRM_ACCOUNT_SUCCESS = 'confirm_account_success',
  CONFIRM_ACCOUNT_FAILED = 'confirm_account_failed',

  // Invites
  INVITE_USER_TO_ORGANIZATION_SUCCESS = 'invite_user_to_organization_success',
  INVITE_USER_TO_ORGANIZATION_FAILED = 'invite_user_to_organization_failed',

  // Users
  USER_FETCH_FAILED = 'user_fetch_failed',
  USER_FETCH_SUCCESS = 'user_fetch_success',
  USER_CREATE_FAILED = 'user_create_failed',
  USER_CREATE_SUCCESS = 'user_create_success',
  USER_UPDATE_FAILED = 'user_update_failed',
  USER_UPDATE_SUCCESS = 'user_update_success',
  USER_DELETED_SUCCESS = 'user_deleted_success',
  USER_DELETED_FAILED = 'user_deleted_failed',
}

export type LogEntry = {
  id: string
  level: LogLevel
  action: LogAction
  targetType: 'program' | 'organization' | 'user' | 'system'
  message: string
  metadata?: Record<string, any>
  createdAt: Date
  statusCode: number
  pagePath: string
}
