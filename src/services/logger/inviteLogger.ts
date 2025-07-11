import { Logger } from './logger'
import { LogAction } from '@/types/Log'
import { CustomError } from '@/utils/error'

class InviteLogger extends Logger {
  public inviteUserToOrganizationSuccess() {
    return this.info({
      action: LogAction.INVITE_USER_TO_ORGANIZATION_SUCCESS,
      message: 'User invited to organization successfully',
      targetType: 'organization',
      createdAt: new Date(),
      statusCode: 200,
      pagePath: window.location.pathname,
    })
  }

  public inviteUserToOrganizationFailed(error: CustomError) {
    return this.error(
      {
        action: LogAction.INVITE_USER_TO_ORGANIZATION_FAILED,
        message: 'Failed to invite user to organization',
        targetType: 'organization',
        createdAt: new Date(),
        statusCode: error.statusCode,
        pagePath: window.location.pathname,
      },
      error,
    )
  }
}


export const inviteLogger = new InviteLogger()
