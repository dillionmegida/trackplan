import type { CustomError } from '@/utils/error'
import { Logger } from './logger'
import { LogAction } from '@/types/Log'

class ProgramsLogger extends Logger {
  public programFetchSuccess() {
    return this.info({
      action: LogAction.PROGRAM_FETCH_SUCCESS,
      message: 'Program fetched successfully',
      targetType: 'program',
      createdAt: new Date(),
      statusCode: 200,
      pagePath: window.location.pathname,
    })
  }

  public programFetchFailed(error: CustomError) {
    return this.error(
      {
        action: LogAction.PROGRAM_FETCH_FAILED,
        message: 'Failed to fetch program',
        targetType: 'program',
        createdAt: new Date(),
        statusCode: error.statusCode,
        pagePath: window.location.pathname,
      },
      error,
    )
  }

  public programsForOrganizationFetchSuccess() {
    return this.info({
      action: LogAction.PROGRAMS_FOR_ORGANIZATION_FETCH_SUCCESS,
      message: 'Programs for organization fetched successfully',
      targetType: 'program',
      createdAt: new Date(),
      statusCode: 200,
      pagePath: window.location.pathname,
    })
  }

  public programsForOrganizationFetchFailed(error: CustomError) {
    return this.error(
      {
        action: LogAction.PROGRAMS_FOR_ORGANIZATION_FETCH_FAILED,
        message: 'Failed to fetch programs for organization',
        targetType: 'program',
        createdAt: new Date(),
        statusCode: error.statusCode,
        pagePath: window.location.pathname,
      },
      error,
    )
  }

  public programUpdateSuccess() {
    return this.info({
      action: LogAction.PROGRAM_UPDATE_SUCCESS,
      message: 'Program updated successfully',
      targetType: 'program',
      createdAt: new Date(),
      statusCode: 200,
      pagePath: window.location.pathname,
    })
  }

  public programUpdateFailed(error: CustomError) {
    return this.error(
      {
        action: LogAction.PROGRAM_UPDATE_FAILED,
        message: 'Failed to update program',
        targetType: 'program',
        createdAt: new Date(),
        statusCode: error.statusCode,
        pagePath: window.location.pathname,
      },
      error,
    )
  }

  public programCreationSuccess() {
    return this.info({
      action: LogAction.PROGRAM_CREATED,
      message: 'Program created successfully',
      targetType: 'program',
      createdAt: new Date(),
      statusCode: 200,
      pagePath: window.location.pathname,
    })
  }

  public programTrashSuccess() {
    return this.info({
      action: LogAction.PROGRAM_TRASHED_SUCCESS,
      message: 'Program trashed successfully',
      targetType: 'program',
      createdAt: new Date(),
      statusCode: 200,
      pagePath: window.location.pathname,
    })
  }

  public programTrashFailed(error: CustomError) {
    return this.error(
      {
        action: LogAction.PROGRAM_TRASHED_FAILED,
        message: 'Failed to trash program',
        targetType: 'program',
        createdAt: new Date(),
        statusCode: error.statusCode,
        pagePath: window.location.pathname,
      },
      error,
    )
  }

  public programCreationFailed(error: CustomError) {
    return this.error(
      {
        action: LogAction.PROGRAM_CREATION_FAILED,
        message: 'Failed to create program',
        targetType: 'program',
        createdAt: new Date(),
        statusCode: error.statusCode,
        pagePath: window.location.pathname,
      },
      error,
    )
  }

  public programDeleteSuccess() {
    return this.info({
      action: LogAction.PROGRAM_DELETED_SUCCESS,
      message: 'Program deleted successfully',
      targetType: 'program',
      createdAt: new Date(),
      statusCode: 200,
      pagePath: window.location.pathname,
    })
  }

  public programDeleteFailed(error: CustomError) {
    return this.error(
      {
        action: LogAction.PROGRAM_DELETED_FAILED,
        message: 'Failed to delete program',
        targetType: 'program',
        createdAt: new Date(),
        statusCode: error.statusCode,
        pagePath: window.location.pathname,
      },
      error,
    )
  }

  public programRestoreSuccess() {
    return this.info({
      action: LogAction.PROGRAM_RESTORED_SUCCESS,
      message: 'Program restored successfully',
      targetType: 'program',
      createdAt: new Date(),
      statusCode: 200,
      pagePath: window.location.pathname,
    })
  }

  public programRestoreFailed(error: CustomError) {
    return this.error(
      {
        action: LogAction.PROGRAM_RESTORED_FAILED,
        message: 'Failed to restore program',
        targetType: 'program',
        createdAt: new Date(),
        statusCode: error.statusCode,
        pagePath: window.location.pathname,
      },
      error,
    )
  }
}

export const programsLogger = new ProgramsLogger()
