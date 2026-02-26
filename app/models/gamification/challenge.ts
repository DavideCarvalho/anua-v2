import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import StudentChallenge from './student_challenge.js'
import School from '../school.js'

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
  declare category: 'ACADEMIC' | 'ATTENDANCE' | 'BEHAVIOR' | 'PARTICIPATION' | 'SOCIAL' | 'SPECIAL'

  @column()
  declare criteria: Record<string, any>

  @column()
  declare isRecurring: boolean

  @column()
  declare recurrencePeriod: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SEMESTER' | 'ANNUAL' | null

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

  @belongsTo(() => School)
  declare school: BelongsTo<typeof School>

  @hasMany(() => StudentChallenge)
  declare studentChallenges: HasMany<typeof StudentChallenge>
}
