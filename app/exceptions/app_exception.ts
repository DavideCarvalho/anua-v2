import { Exception } from '@adonisjs/core/exceptions'
import { APP_ERROR_MESSAGES, AppErrorCode } from './app_error_code.js'

interface AppExceptionOptions {
  code: AppErrorCode
  status: number
  description?: string
  meta?: Record<string, unknown>
}

export default class AppException extends Exception {
  declare code: AppErrorCode
  declare description: string
  declare meta?: Record<string, unknown>

  constructor(options: AppExceptionOptions) {
    const description = options.description ?? APP_ERROR_MESSAGES[options.code]
    super(description, { status: options.status })
    this.code = options.code
    this.description = description
    this.meta = options.meta
  }

  static operationFailedWithProvidedData(status: number = 409): AppException {
    return new AppException({
      code: AppErrorCode.OPERATION_FAILED_WITH_PROVIDED_DATA,
      status,
    })
  }

  static invalidCredentials(): AppException {
    return new AppException({
      code: AppErrorCode.INVALID_CREDENTIALS,
      status: 401,
    })
  }

  static invalidOrExpiredCode(): AppException {
    return new AppException({
      code: AppErrorCode.INVALID_OR_EXPIRED_CODE,
      status: 400,
    })
  }

  static badRequest(description?: string): AppException {
    return new AppException({
      code: AppErrorCode.BAD_REQUEST,
      status: 400,
      description,
    })
  }

  static forbidden(description?: string): AppException {
    return new AppException({
      code: AppErrorCode.FORBIDDEN,
      status: 403,
      description,
    })
  }

  static notFound(description?: string): AppException {
    return new AppException({
      code: AppErrorCode.RESOURCE_NOT_FOUND,
      status: 404,
      description,
    })
  }

  static internalServerError(description?: string): AppException {
    return new AppException({
      code: AppErrorCode.INTERNAL_SERVER_ERROR,
      status: 500,
      description,
    })
  }

  static invalidWebhookToken(): AppException {
    return new AppException({
      code: AppErrorCode.INVALID_WEBHOOK_TOKEN,
      status: 403,
    })
  }

  static invalidWebhookPayload(): AppException {
    return new AppException({
      code: AppErrorCode.INVALID_WEBHOOK_PAYLOAD,
      status: 400,
    })
  }

  static missingExternalReference(): AppException {
    return new AppException({
      code: AppErrorCode.MISSING_EXTERNAL_REFERENCE,
      status: 400,
    })
  }

  static storeOrderNotFound(): AppException {
    return new AppException({
      code: AppErrorCode.STORE_ORDER_NOT_FOUND,
      status: 404,
    })
  }

  static storeOrderInvalidStatus(action: string, status: string): AppException {
    return new AppException({
      code: AppErrorCode.STORE_ORDER_INVALID_STATUS,
      status: 400,
      description: `Não é possível ${action} pedido com status: ${status}`,
      meta: { action, status },
    })
  }

  static contractNotFound(): AppException {
    return new AppException({
      code: AppErrorCode.CONTRACT_NOT_FOUND,
      status: 404,
    })
  }
}
