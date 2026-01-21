import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, column, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import School from './school.js'
import StudentChallenge from './student_challenge.js'

export type ChallengeCategory = 'ATTENDANCE' | 'ACADEMIC' | 'BEHAVIOR' | 'EXTRACURRICULAR' | 'SPECIAL'
export type RecurrencePeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

export default class Challenge extends BaseModel {
  static table = 'Challenge'

  @beforeCreate()
  static assignId(model: Challenge) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare icon: string | null

  @column()
  declare points: number

  @column()
  declare category: ChallengeCategory

  @column()
  declare criteria: Record<string, unknown>

  @column()
  declare isRecurring: boolean

  @column()
  declare recurrencePeriod: RecurrencePeriod | null

  @column.date()
  declare startDate: DateTime | null

  @column.date()
  declare endDate: DateTime | null

  @column()
  declare schoolId: string | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => School, { foreignKey: 'schoolId' })
  declare school: BelongsTo<typeof School>

  @hasMany(() => StudentChallenge, { foreignKey: 'challengeId' })
  declare studentChallenges: HasMany<typeof StudentChallenge>
}
