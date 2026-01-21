import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'
import User from './user.js'

export type EmergencyContactRelationship =
  | 'MOTHER'
  | 'FATHER'
  | 'GRANDMOTHER'
  | 'GRANDFATHER'
  | 'AUNT'
  | 'UNCLE'
  | 'COUSIN'
  | 'NEPHEW'
  | 'NIECE'
  | 'GUARDIAN'
  | 'OTHER'

export default class StudentEmergencyContact extends BaseModel {
  static table = 'StudentEmergencyContact'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare studentId: string

  @column()
  declare userId: string | null

  @column()
  declare name: string

  @column()
  declare phone: string

  @column()
  declare relationship: EmergencyContactRelationship

  @column()
  declare order: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}
