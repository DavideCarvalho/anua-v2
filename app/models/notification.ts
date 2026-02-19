import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export type NotificationType =
  | 'ASSIGNMENT_CREATED'
  | 'ASSIGNMENT_SUBMITTED'
  | 'ASSIGNMENT_GRADED'
  | 'EXAM_SCHEDULED'
  | 'EXAM_GRADE_AVAILABLE'
  | 'ATTENDANCE_MARKED'
  | 'PAYMENT_DUE'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_OVERDUE'
  | 'EVENT_CREATED'
  | 'EVENT_REMINDER'
  | 'POST_LIKED'
  | 'POST_COMMENTED'
  | 'COMMENT_REPLIED'
  | 'POINTS_EARNED'
  | 'LEVEL_UP'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'STREAK_MILESTONE'
  | 'STORE_ORDER_STATUS'
  | 'ABSENCE_REPORTED'
  | 'SCHEDULE_CHANGED'
  | 'SYSTEM_ANNOUNCEMENT'
  | 'MAINTENANCE_SCHEDULED'

export default class Notification extends BaseModel {
  static table = 'Notification'

  @beforeCreate()
  static assignId(notification: Notification) {
    if (!notification.id) {
      notification.id = uuidv7()
    }
  }

  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  @column({ columnName: 'userId' })
  declare userId: string

  @column({ columnName: 'type' })
  declare type: NotificationType

  @column({ columnName: 'title' })
  declare title: string

  @column({ columnName: 'message' })
  declare message: string

  @column({ columnName: 'data' })
  declare data: Record<string, unknown> | null

  @column({ columnName: 'isRead' })
  declare isRead: boolean

  @column.dateTime({ columnName: 'readAt' })
  declare readAt: DateTime | null

  @column({ columnName: 'sentViaInApp' })
  declare sentViaInApp: boolean

  @column({ columnName: 'sentViaEmail' })
  declare sentViaEmail: boolean

  @column({ columnName: 'sentViaPush' })
  declare sentViaPush: boolean

  @column({ columnName: 'sentViaSms' })
  declare sentViaSms: boolean

  @column({ columnName: 'sentViaWhatsApp' })
  declare sentViaWhatsApp: boolean

  @column.dateTime({ columnName: 'emailSentAt' })
  declare emailSentAt: DateTime | null

  @column({ columnName: 'emailError' })
  declare emailError: string | null

  @column({ columnName: 'actionUrl' })
  declare actionUrl: string | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}
