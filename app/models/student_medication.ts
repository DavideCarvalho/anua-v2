import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import { v7 as uuidv7 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import StudentMedicalInfo from './student_medical_info.js'

export default class StudentMedication extends BaseModel {
  static table = 'StudentMedication'

  @beforeCreate()
  static assignId(model: StudentMedication) {
    if (!model.id) {
      model.id = uuidv7()
    }
  }

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'medicalInfoId' })
  declare medicalInfoId: string

  @column({ columnName: 'name' })
  declare name: string

  @column({ columnName: 'dosage' })
  declare dosage: string

  @column({ columnName: 'frequency' })
  declare frequency: string

  @column({ columnName: 'instructions' })
  declare instructions: string | null

  @column.dateTime({ autoCreate: true, columnName: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updatedAt' })
  declare updatedAt: DateTime

  @belongsTo(() => StudentMedicalInfo, { foreignKey: 'medicalInfoId' })
  declare medicalInfo: BelongsTo<typeof StudentMedicalInfo>
}
