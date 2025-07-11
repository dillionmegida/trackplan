import { LogAction } from '@/types/Log'
import { Logger } from './logger'
import type { CustomError } from '@/utils/error'

class OnboardingLogger extends Logger {
  public confirmAccountSuccess() {
    return this.info({
      action: LogAction.CONFIRM_ACCOUNT_SUCCESS,
      message: 'Account confirmed successfully',
      targetType: 'user',
      createdAt: new Date(),
      statusCode: 200,
      pagePath: window.location.pathname,
    })
  }

  public confirmAccountFailed(error: CustomError) {
    return this.error({
      action: LogAction.CONFIRM_ACCOUNT_FAILED,
      message: 'Failed to confirm account',
      targetType: 'user',
      createdAt: new Date(),
      statusCode: error.statusCode,
      pagePath: window.location.pathname,
    }, error)
  }
}

export const onboardingLogger = new OnboardingLogger()