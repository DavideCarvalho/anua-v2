import { Exception } from '@adonisjs/core/exceptions'

export enum CheckoutErrorCode {
  STORE_NOT_FOUND = 'STORE_NOT_FOUND',
  ENROLLMENT_NOT_FOUND = 'ENROLLMENT_NOT_FOUND',
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
  ITEM_UNAVAILABLE = 'ITEM_UNAVAILABLE',
  ITEM_WRONG_STORE = 'ITEM_WRONG_STORE',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  UNAUTHORIZED = 'UNAUTHORIZED',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

interface CheckoutExceptionOptions {
  code: CheckoutErrorCode
  status: number
  description?: string
  meta?: Record<string, any>
}

export default class CheckoutException extends Exception {
  declare code: CheckoutErrorCode
  declare description: string
  declare meta?: Record<string, any>

  constructor(options: CheckoutExceptionOptions) {
    super(options.description || options.code, { status: options.status })
    this.code = options.code
    this.description = options.description || options.code
    this.meta = options.meta
  }

  static storeNotFound(): CheckoutException {
    return new CheckoutException({
      code: CheckoutErrorCode.STORE_NOT_FOUND,
      status: 404,
      description: 'Loja não encontrada',
    })
  }

  static enrollmentNotFound(): CheckoutException {
    return new CheckoutException({
      code: CheckoutErrorCode.ENROLLMENT_NOT_FOUND,
      status: 400,
      description: 'Aluno não possui matrícula ativa com contrato',
    })
  }

  static itemNotFound(): CheckoutException {
    return new CheckoutException({
      code: CheckoutErrorCode.ITEM_NOT_FOUND,
      status: 404,
      description: 'Item não encontrado',
    })
  }

  static itemUnavailable(itemName: string): CheckoutException {
    return new CheckoutException({
      code: CheckoutErrorCode.ITEM_UNAVAILABLE,
      status: 400,
      description: `Item indisponível: ${itemName}`,
    })
  }

  static itemWrongStore(itemName: string): CheckoutException {
    return new CheckoutException({
      code: CheckoutErrorCode.ITEM_WRONG_STORE,
      status: 400,
      description: `Item ${itemName} não pertence a esta loja`,
    })
  }

  static insufficientStock(itemName: string, available: number): CheckoutException {
    return new CheckoutException({
      code: CheckoutErrorCode.INSUFFICIENT_STOCK,
      status: 400,
      description: `Estoque insuficiente para ${itemName}. Disponível: ${available}`,
      meta: { itemName, available },
    })
  }

  static insufficientBalance(balance: number): CheckoutException {
    return new CheckoutException({
      code: CheckoutErrorCode.INSUFFICIENT_BALANCE,
      status: 400,
      description: `Saldo insuficiente. Disponível: ${balance}`,
      meta: { balance },
    })
  }

  static unauthorized(message: string): CheckoutException {
    return new CheckoutException({
      code: CheckoutErrorCode.UNAUTHORIZED,
      status: 403,
      description: message,
    })
  }

  static badRequest(message: string): CheckoutException {
    return new CheckoutException({
      code: CheckoutErrorCode.BAD_REQUEST,
      status: 400,
      description: message,
    })
  }
}
