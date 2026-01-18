import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import Class from './class.js'
import Subject from './subject.js'
import LeaderboardEntry from './leaderboard_entry.js'

export type LeaderboardMetricType = 'POINTS' | 'AVERAGE_GRADE' | 'ATTENDANCE_PERCENTAGE' | 'ASSIGNMENTS_COMPLETED' | 'EXAMS_AVERAGE' | 'STREAK_DAYS' | 'BEHAVIOR_SCORE'
export type LeaderboardPeriodType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ACADEMIC_PERIOD' | 'ALL_TIME'

export default class Leaderboard extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare schoolId: string

  @column()
  declare classId: string | null

  @column()
  declare subjectId: string | null

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare metricType: LeaderboardMetricType

  @column()
  declare periodType: LeaderboardPeriodType

  @column.date()
  declare startDate: DateTime | null

  @column.date()
  declare endDate: DateTime | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => School)
  declare school: BelongsTo<typeof School>

  @belongsTo(() => Class)
  declare class: BelongsTo<typeof Class>

  @belongsTo(() => Subject)
  declare subject: BelongsTo<typeof Subject>

  @hasMany(() => LeaderboardEntry)
  declare entries: HasMany<typeof LeaderboardEntry>
}
