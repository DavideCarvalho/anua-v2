import { BaseModelDto } from '@adocasts.com/dto/base'
import type { DateTime } from 'luxon'

export class StudentPaymentDto extends BaseModelDto {
  declare id: string
  declare type: string
  declare amount: number
  declare dueDate: DateTime | string
  declare paidAt: DateTime | string | null
  declare status: string
  declare paymentGateway: string | null
  declare paymentGatewayId: string | null

  constructor(data: {
    id: string
    type: string
    amount: number
    dueDate: DateTime | string
    paidAt: DateTime | string | null
    status: string
    paymentGateway: string | null
    paymentGatewayId: string | null
  }) {
    super()
    this.id = data.id
    this.type = data.type
    this.amount = data.amount
    this.dueDate = data.dueDate
    this.paidAt = data.paidAt
    this.status = data.status
    this.paymentGateway = data.paymentGateway
    this.paymentGatewayId = data.paymentGatewayId
  }
}

export class PaymentsSummaryDto extends BaseModelDto {
  declare totalAmount: number
  declare paidAmount: number
  declare pendingAmount: number
  declare overdueAmount: number
  declare paidCount: number
  declare pendingCount: number
  declare overdueCount: number

  constructor(data: {
    totalAmount: number
    paidAmount: number
    pendingAmount: number
    overdueAmount: number
    paidCount: number
    pendingCount: number
    overdueCount: number
  }) {
    super()
    this.totalAmount = data.totalAmount
    this.paidAmount = data.paidAmount
    this.pendingAmount = data.pendingAmount
    this.overdueAmount = data.overdueAmount
    this.paidCount = data.paidCount
    this.pendingCount = data.pendingCount
    this.overdueCount = data.overdueCount
  }
}

export class PaginationMetaDto extends BaseModelDto {
  declare total: number
  declare perPage: number
  declare currentPage: number
  declare lastPage: number
  declare firstPage: number

  constructor(data: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
    firstPage: number
  }) {
    super()
    this.total = data.total
    this.perPage = data.perPage
    this.currentPage = data.currentPage
    this.lastPage = data.lastPage
    this.firstPage = data.firstPage
  }
}

export class StudentPaymentsResponseDto extends BaseModelDto {
  declare data: StudentPaymentDto[]
  declare meta: PaginationMetaDto
  declare summary: PaymentsSummaryDto

  constructor(data: {
    data: StudentPaymentDto[]
    meta: PaginationMetaDto
    summary: PaymentsSummaryDto
  }) {
    super()
    this.data = data.data
    this.meta = data.meta
    this.summary = data.summary
  }
}
