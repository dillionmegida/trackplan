import { LogAction, LogLevel } from "@/types/Log";
import { Logger } from "./logger";
import type { CustomError } from "@/utils/error";

class OrganizationLogger extends Logger {
  public createOrganizationSuccess() {
    this.info({
      action: LogAction.ORGANIZATION_CREATED_SUCCESS,
      message: 'Organization created successfully',
      targetType: 'organization',
      createdAt: new Date(),
      statusCode: 200,
      pagePath: window.location.pathname,
    })
  }

  public createOrganizationFailed(error: CustomError) {
    return this.error(
      {
        action: LogAction.ORGANIZATION_CREATED_FAILED,
        message: 'Failed to create organization',
        targetType: 'organization',
        createdAt: new Date(),
        statusCode: error.statusCode,
        pagePath: window.location.pathname,
      },
      error,
    )
  }

  public updateOrganizationSuccess() {
    this.info({
      action: LogAction.ORGANIZATION_UPDATED_SUCCESS,
      message: 'Organization updated successfully',
      targetType: 'organization',
      createdAt: new Date(),
      statusCode: 200,
      pagePath: window.location.pathname,
    })
  }

  public updateOrganizationFailed(error: CustomError) {
    return this.error(
      {
        action: LogAction.ORGANIZATION_UPDATED_FAILED,
        message: 'Failed to update organization',
        targetType: 'organization',
        createdAt: new Date(),
        statusCode: error.statusCode,
        pagePath: window.location.pathname,
      },
      error,
    )
  }

  public memberAddedFailed(error: CustomError) {
    return this.error(
      {
        action: LogAction.MEMBER_ADDED_FAILED,
        message: 'Failed to add member',
        targetType: 'organization',
        createdAt: new Date(),
        statusCode: error.statusCode,
        pagePath: window.location.pathname,
      },
      error,
    )
  }

  public memberRemovedFailed(error: CustomError) {
    return this.error(
      {
        action: LogAction.MEMBER_REMOVED_FAILED,
        message: 'Failed to remove member',
        targetType: 'organization',
        createdAt: new Date(),
        statusCode: error.statusCode,
        pagePath: window.location.pathname,
      },
      error,
    )
  }

  public memberAddedToProgramFailed(error: CustomError) {
    return this.error(
      {
        action: LogAction.MEMBER_ADDED_TO_PROGRAM_FAILED,
        message: 'Failed to add member to program',
        targetType: 'organization',
        createdAt: new Date(),
        statusCode: error.statusCode,
        pagePath: window.location.pathname,
      },
      error,
    )
  }
    
}

export const organizationLogger = new OrganizationLogger()

