import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import StudentPayment from './student_payment.js'
import School from './school.js'

export type TuitionTransferStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export default class TuitionTransfer extends BaseModel {
  static table = 'TuitionTransfer'

  @beforeCreate()
  static assignId(model: TuitionTransfer) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentPaymentId: string

  @column()
  declare schoolId: string

  @column()
  declare paymentAmount: number

  @column()
  declare platformFeeAmount: number

  @column()
  declare transferAmount: number

  @column()
  declare platformFeePercentage: number

  @column()
  declare status: TuitionTransferStatus

  @column()
  declare pixTransactionId: string | null

  @column()
  declare pixTransactionStatus: string | null

  @column()
  declare failureReason: string | null

  @column()
  declare retryCount: number

  @column.dateTime()
  declare lastRetryAt: DateTime | null

  @column.dateTime()
  declare processedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => StudentPayment, { foreignKey: 'studentPaymentId' })
  declare studentPayment: BelongsTo<typeof StudentPayment>

  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>
}
