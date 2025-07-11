import { LogAction } from '@/types/Log'
import { Logger } from './logger'
import type { CustomError } from '@/utils/error'

class AuthLogger extends Logger {
  public userSignedInSuccess() {
    return this.info({
      action: LogAction.USER_SIGNED_IN_SUCCESS,
      message: 'User signed in successfully',
      targetType: 'user',
      createdAt: new Date(),
      statusCode: 200,
      pagePath: window.location.pathname,
    })
  }

  public userSignedInFailed(error: CustomError) {
    return this.error({
      action: LogAction.USER_SIGNED_IN_FAILED,
      message: 'Failed to sign in',
      targetType: 'user',
      createdAt: new Date(),
      statusCode: error.statusCode,
      pagePath: window.location.pathname,
    }, error)
  }

  public userSignedOutSuccess() {
    return this.info({
      action: LogAction.USER_SIGNED_OUT_SUCCESS,
      message: 'User signed out successfully',
      targetType: 'user',
      createdAt: new Date(),
      statusCode: 200,
      pagePath: window.location.pathname,
    })
  }

  public userSignedOutFailed(error: CustomError) {
    return this.error({
      action: LogAction.USER_SIGNED_OUT_FAILED,
      message: 'Failed to sign out',
      targetType: 'user',
      createdAt: new Date(),
      statusCode: error.statusCode,
      pagePath: window.location.pathname,
    }, error)
  }
}

export const authLogger = new AuthLogger()
