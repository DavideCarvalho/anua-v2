import { BaseModelDto } from '@adocasts.com/dto/base'
import type { DateTime } from 'luxon'

export class BalanceTransactionDto extends BaseModelDto {
  declare id: string
  declare type: string
  declare amount: number
  declare description: string | null
  declare status: string
  declare createdAt: DateTime | string

  constructor(data: {
    id: string
    type: string
    amount: number
    description: string | null
    status: string
    createdAt: DateTime | string
  }) {
    super()
    this.id = data.id
    this.type = data.type
    this.amount = data.amount
    this.description = data.description
    this.status = data.status
    this.createdAt = data.createdAt
  }
}

export class BalanceSummaryDto extends BaseModelDto {
  declare currentBalance: number
  declare totalCredits: number
  declare totalDebits: number

  constructor(data: { currentBalance: number; totalCredits: number; totalDebits: number }) {
    super()
    this.currentBalance = data.currentBalance
    this.totalCredits = data.totalCredits
    this.totalDebits = data.totalDebits
  }
}

export class BalancePaginationMetaDto extends BaseModelDto {
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

export class StudentBalanceResponseDto extends BaseModelDto {
  declare data: BalanceTransactionDto[]
  declare meta: BalancePaginationMetaDto
  declare summary: BalanceSummaryDto

  constructor(data: {
    data: BalanceTransactionDto[]
    meta: BalancePaginationMetaDto
    summary: BalanceSummaryDto
  }) {
    super()
    this.data = data.data
    this.meta = data.meta
    this.summary = data.summary
  }
}
