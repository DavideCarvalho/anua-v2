import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import Class from './class.js'
import Subject from './subject.js'
import LeaderboardEntry from './leaderboard_entry.js'

export type LeaderboardType =
  | 'POINTS'
  | 'AVERAGE_GRADE'
  | 'ATTENDANCE_PERCENTAGE'
  | 'ASSIGNMENTS_COMPLETED'
  | 'EXAMS_AVERAGE'
  | 'STREAK_DAYS'
  | 'BEHAVIOR_SCORE'
export type LeaderboardPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ACADEMIC_PERIOD' | 'ALL_TIME'

export default class Leaderboard extends BaseModel {
  static table = 'Leaderboard'

  @beforeCreate()
  static assignId(model: Leaderboard) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare type: LeaderboardType

  @column()
  declare period: LeaderboardPeriod

  @column.date()
  declare startDate: DateTime

  @column.date()
  declare endDate: DateTime

  @column()
  declare schoolId: string | null

  @column()
  declare classId: string | null

  @column()
  declare subjectId: string | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => Class, { foreignKey: 'classId' })
  declare class: BelongsTo<typeof Class>

  @belongsTo(() => Subject, { foreignKey: 'subjectId' })
  declare subject: BelongsTo<typeof Subject>

  @hasMany(() => LeaderboardEntry, { foreignKey: 'leaderboardId' })
  declare entries: HasMany<typeof LeaderboardEntry>
}
