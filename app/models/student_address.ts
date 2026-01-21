import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'

export default class StudentAddress extends BaseModel {
  static table = 'StudentAddress'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare street: string

  @column()
  declare number: string

  @column()
  declare complement: string | null

  @column()
  declare neighborhood: string

  @column()
  declare city: string

  @column()
  declare state: string

  @column()
  declare zipCode: string

  @column()
  declare latitude: number | null

  @column()
  declare longitude: number | null

  // PostGIS geometry point - stored as USER-DEFINED type in DB
  // Use raw queries for spatial operations
  @column()
  declare location: unknown | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>
}
