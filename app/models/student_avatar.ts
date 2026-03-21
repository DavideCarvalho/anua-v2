import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Student from './student.js'

export default class StudentAvatar extends BaseModel {
  static table = 'StudentAvatar'

  @beforeCreate()
  static assignId(model: StudentAvatar) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'studentId' })
  declare studentId: string

  @column({ columnName: 'skinTone' })
  declare skinTone: string

  @column({ columnName: 'hairStyle' })
  declare hairStyle: string

  @column({ columnName: 'hairColor' })
  declare hairColor: string

  @column({ columnName: 'outfit' })
  declare outfit: string

  @column()
  declare accessories: string[]

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>
}
