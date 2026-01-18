import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import Achievement from './achievement.js'

export type GamificationEventType =
  | 'ASSIGNMENT_COMPLETED'
  | 'ASSIGNMENT_SUBMITTED'
  | 'ASSIGNMENT_GRADED'
  | 'ATTENDANCE_MARKED'
  | 'ATTENDANCE_PRESENT'
  | 'ATTENDANCE_LATE'
  | 'GRADE_RECEIVED'
  | 'GRADE_EXCELLENT'
  | 'GRADE_GOOD'
  | 'BEHAVIOR_POSITIVE'
  | 'BEHAVIOR_NEGATIVE'
  | 'PARTICIPATION_CLASS'
  | 'PARTICIPATION_EVENT'
  | 'STORE_PURCHASE'
  | 'STORE_ORDER_APPROVED'
  | 'STORE_ORDER_DELIVERED'
  | 'POINTS_MANUAL_ADD'
  | 'POINTS_MANUAL_REMOVE'
  | 'ACHIEVEMENT_UNLOCKED'

export type GamificationEventStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED'

export type GamificationEntityType =
  | 'Assignment'
  | 'Attendance'
  | 'Grade'
  | 'Behavior'
  | 'Participation'
  | 'StoreOrder'
  | 'Manual'
  | 'Achievement'

export default class GamificationEvent extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare eventType: GamificationEventType

  @column()
  declare status: GamificationEventStatus

  @column()
  declare entityType: GamificationEntityType

  @column()
  declare entityId: string

  @column()
  declare pointsChange: number

  @column()
  declare achievementId: string | null

  @column()
  declare description: string | null

  @column()
  declare metadata: Record<string, unknown> | null

  @column()
  declare errorMessage: string | null

  @column()
  declare retryCount: number

  @column.dateTime()
  declare processedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Student)
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => Achievement)
  declare achievement: BelongsTo<typeof Achievement>
}
