import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
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

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare type: NotificationType

  @column()
  declare title: string

  @column()
  declare message: string

  @column()
  declare data: Record<string, unknown> | null

  @column()
  declare isRead: boolean

  @column.dateTime()
  declare readAt: DateTime | null

  @column()
  declare sentViaInApp: boolean

  @column()
  declare sentViaEmail: boolean

  @column()
  declare sentViaPush: boolean

  @column()
  declare sentViaSms: boolean

  @column()
  declare sentViaWhatsApp: boolean

  @column.dateTime()
  declare emailSentAt: DateTime | null

  @column()
  declare emailError: string | null

  @column()
  declare actionUrl: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}
