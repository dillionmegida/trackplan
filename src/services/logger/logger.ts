import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/configs/firebase'
import { LogLevel, LogAction } from '@/types/Log'
import type { LogEntry } from '@/types/Log'

export class Logger {
  private async log(level: LogLevel, args: Omit<LogEntry, 'level' | 'id' | 'timestamp'>) {
    if (import.meta.env.DEV) {
      console.warn("Not uploading logs in development")
      console.log(args.action)

      if (args.action === LogAction.ERROR_OCCURRED) {
        console.error(args.metadata?.errorStack)
      }
      return
    }

    if (import.meta.env.DEV && !args.statusCode) {
      throw new Error('statusCode is required')
    }

    try {
      const logEntry: Omit<LogEntry, 'id' | 'timestamp'> = {
        level,
        action: args.action,
        message: args.message,
        metadata: args.metadata,
        targetType: args.targetType,
        createdAt: args.createdAt,
        statusCode: args.statusCode,
        pagePath: args.pagePath,
      }

      const logWithTimestamp = {
        ...logEntry,
        metadata: { ...args.metadata },
        timestamp: new Date(),
      }

      const collectionRef = collection(db, 'logs')
      addDoc(collectionRef, logWithTimestamp)
    } catch (error) {
      console.error('Failed to log event:', error)
    }
  }

  // Public methods for different log levels
  public info(args: Omit<LogEntry, 'level' | 'id' | 'timestamp'>) {
    return this.log(LogLevel.INFO, args)
  }

  public warn(args: Omit<LogEntry, 'level' | 'id' | 'timestamp'>) {
    return this.log(LogLevel.WARNING, args)
  }

  public error(args: Omit<LogEntry, 'level' | 'id' | 'timestamp'>, error: CustomError) {
    const errorInfo = {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
    }

    args.metadata = { ...args.metadata, ...errorInfo }

    return this.log(LogLevel.ERROR, args)
  }
}

export const logger = new Logger()

// Vue plugin
import { type App } from 'vue'
import { genId } from '@/utils/string'
import { CustomError } from '@/utils/error'

export const LoggerPlugin = {
  install: (app: App) => {
    app.config.globalProperties.$logger = logger
    app.config.errorHandler = (err: Error, vm: any, info: string) => {
      console.log(err)
      const customError = new CustomError(err.message, 500)

      logger.error(
        {
          action: LogAction.ERROR_OCCURRED,
          message: `Vue error: ${info}`,
          targetType: 'system',
          createdAt: new Date(),
          statusCode: 500,
          pagePath: window.location.pathname,
        },
        customError,
      )
    }
  },
}

// Composable for composition API
export function useLogger() {
  return { logger }
}
