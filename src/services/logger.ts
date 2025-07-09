import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/configs/firebase'
import { LogLevel, LogAction } from '@/types/Log'
import type { LogEntry } from '@/types/Log'
import { useAuthStore } from '@/stores/auth'

const LOGS_COLLECTION = 'logs'

class Logger {
  private async log(
    level: LogLevel,
    action: LogAction,
    message: string,
    metadata: Record<string, any> = {},
  ) {
    try {
      const authStore = useAuthStore()

      const logEntry: Omit<LogEntry, 'id' | 'timestamp'> = {
        level,
        action,
        userId: authStore.user?.uid || 'anonymous',
        message,
        metadata,
        ...(metadata.organizationId && { organizationId: metadata.organizationId }),
        ...(metadata.targetId && { targetId: metadata.targetId }),
        ...(metadata.targetType && { targetType: metadata.targetType }),
      }

      // Remove metadata fields that are already at the root
      const { organizationId, targetId, targetType, ...restMetadata } = metadata

      const logWithTimestamp = {
        ...logEntry,
        metadata: restMetadata,
        timestamp: serverTimestamp(),
      }

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          '/api/logs',
          JSON.stringify(logWithTimestamp),
        )
      }

      await addDoc(collection(db, LOGS_COLLECTION), logWithTimestamp)
    } catch (error) {
      console.error('Failed to log event:', error)
    }
  }

  // Public methods for different log levels
  public info(action: LogAction, message: string, metadata: Record<string, any> = {}) {
    return this.log(LogLevel.INFO, action, message, metadata)
  }

  public warn(action: LogAction, message: string, metadata: Record<string, any> = {}) {
    return this.log(LogLevel.WARNING, action, message, metadata)
  }

  public error(
    action: LogAction,
    message: string,
    error?: Error,
    metadata: Record<string, any> = {},
  ) {
    const errorInfo = error
      ? {
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack,
        }
      : {}

    return this.log(LogLevel.ERROR, action, message, { ...errorInfo, ...metadata })
  }
}

export const logger = new Logger()

// Vue plugin
import { type App } from 'vue'

export const LoggerPlugin = {
  install: (app: App) => {
    app.config.globalProperties.$logger = logger
    // Also add to global error handler
    app.config.errorHandler = (err, vm, info) => {
      logger.error(LogAction.ERROR_OCCURRED, `Vue error: ${info}`, err as Error, {
        component: vm?.$options.name || 'unknown',
      })
    }
  },
}

// Composable for composition API
export function useLogger() {
  return { logger }
}
