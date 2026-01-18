import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'

export type PointType =
  | 'HOMEWORK_COMPLETION'
  | 'ATTENDANCE'
  | 'PARTICIPATION'
  | 'EXAM_SCORE'
  | 'BEHAVIOR'
  | 'ACHIEVEMENT'
  | 'LOGIN_STREAK'
  | 'BONUS'

export default class StudentPoint extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare points: number

  @column()
  declare type: PointType

  @column()
  declare description: string

  @column()
  declare metadata: Record<string, any> | null

  @column()
  declare studentId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => Student)
  declare student: BelongsTo<typeof Student>
}
