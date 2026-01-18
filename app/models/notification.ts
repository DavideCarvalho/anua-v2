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
  | 'GENERAL_ANNOUNCEMENT'

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'PUSH' | 'SMS' | 'WHATSAPP'
export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare title: string

  @column()
  declare content: string

  @column()
  declare type: NotificationType

  @column()
  declare channel: NotificationChannel

  @column()
  declare status: NotificationStatus

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime()
  declare scheduledAt: DateTime | null

  @column.dateTime()
  declare sentAt: DateTime | null

  @column.dateTime()
  declare readAt: DateTime | null

  @column()
  declare recipientId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => User, { foreignKey: 'recipientId' })
  declare recipient: BelongsTo<typeof User>
}
