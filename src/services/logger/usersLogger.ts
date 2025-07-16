import type { CustomError } from "@/utils/error"
import { Logger } from "./logger"
import { LogAction } from "@/types/Log"

class UsersLogger extends Logger {
  public userFetchFailed(error: CustomError) {
    return this.error(
      {
        action: LogAction.USER_FETCH_FAILED,
        message: 'Failed to fetch user',
        targetType: 'user',
        createdAt: new Date(),
        statusCode: error.statusCode,
        pagePath: window.location.pathname,
      },
      error,
    )
  }

  public userCreateSuccess() {
    return this.info({
      action: LogAction.USER_CREATE_SUCCESS,
      message: 'User created successfully',
      targetType: 'user',
      createdAt: new Date(),
      statusCode: 200,
      pagePath: window.location.pathname,
    })
  }

  public userCreateFailed(error: CustomError) {
    return this.error(
      {
        action: LogAction.USER_CREATE_FAILED,
        message: 'Failed to create user',
        targetType: 'user',
        createdAt: new Date(),
        statusCode: error.statusCode,
        pagePath: window.location.pathname,
      },
      error,
    )
  }

  public userUpdateSuccess() {
    return this.info({
      action: LogAction.USER_UPDATE_SUCCESS,
      message: 'User updated successfully',
      targetType: 'user',
      createdAt: new Date(),
      statusCode: 200,
      pagePath: window.location.pathname,
    })
  }

  public userUpdateFailed(error: CustomError) {
    return this.error(
      {
        action: LogAction.USER_UPDATE_FAILED,
        message: 'Failed to update user',
        targetType: 'user',
        createdAt: new Date(),
        statusCode: error.statusCode,
        pagePath: window.location.pathname,
      },
      error,
    )
  }

  public userDeleteSuccess() {
    return this.info({
      action: LogAction.USER_DELETED_SUCCESS,
      message: 'User deleted successfully',
      targetType: 'user',
      createdAt: new Date(),
      statusCode: 200,
      pagePath: window.location.pathname,
    })
  }

  public userDeleteFailed(error: CustomError) {
    return this.error(
      {
        action: LogAction.USER_DELETED_FAILED,
        message: 'Failed to delete user',
        targetType: 'user',
        createdAt: new Date(),
        statusCode: error.statusCode,
        pagePath: window.location.pathname,
      },
      error,
    )
  }
}

export const usersLogger = new UsersLogger()
