import { BaseModelDto } from '@adocasts.com/dto/base'
import type PointTransaction from '#models/point_transaction'
import type { TransactionType } from '#models/point_transaction'
import type { DateTime } from 'luxon'

export default class PointTransactionDto extends BaseModelDto {
  declare id: string
  declare studentGamificationId: string
  declare points: number
  declare balanceAfter: number
  declare type: TransactionType
  declare reason: string | null
  declare relatedEntityType: string | null
  declare relatedEntityId: string | null
  declare createdAt: DateTime

  constructor(model?: PointTransaction) {
    super()

    if (!model) return

    this.id = model.id
    this.studentGamificationId = model.studentGamificationId
    this.points = model.points
    this.balanceAfter = model.balanceAfter
    this.type = model.type
    this.reason = model.reason
    this.relatedEntityType = model.relatedEntityType
    this.relatedEntityId = model.relatedEntityId
    this.createdAt = model.createdAt
  }
}
