import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import GamificationEvent from './gamification_event.js'

export default class StudentGamification extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare points: number

  @column()
  declare level: number

  @column()
  declare experience: number

  @column()
  declare streakDays: number

  @column.date()
  declare lastActivityDate: DateTime | null

  @column()
  declare totalAssignmentsCompleted: number

  @column()
  declare totalExamsTaken: number

  @column()
  declare averageGrade: number

  @column()
  declare attendancePercentage: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Student)
  declare student: BelongsTo<typeof Student>

  @hasMany(() => GamificationEvent)
  declare events: HasMany<typeof GamificationEvent>
}
