import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
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

  @beforeCreate()
  static assignId(model: StudentEmergencyContact) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'userId' })
  declare userId: string | null

  @column({ columnName: 'name' })
  declare name: string

  @column({ columnName: 'phone' })
  declare phone: string

  @column({ columnName: 'relationship' })
  declare relationship: EmergencyContactRelationship

  @column({ columnName: 'order' })
  declare order: number

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}
