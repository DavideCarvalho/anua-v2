import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import LeaderboardEntry from './leaderboard_entry.js'
import School from '#models/school'
import Class from '#models/class'
import Subject from '#models/subject'

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
  declare type: 'POINTS' | 'ATTENDANCE' | 'GRADES' | 'PARTICIPATION'

  @column()
  declare period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SEMESTER' | 'ANNUAL'

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

  @belongsTo(() => School)
  declare school: BelongsTo<typeof School>

  @belongsTo(() => Class)
  declare class: BelongsTo<typeof Class>

  @belongsTo(() => Subject)
  declare subject: BelongsTo<typeof Subject>

  @hasMany(() => LeaderboardEntry)
  declare entries: HasMany<typeof LeaderboardEntry>
}
