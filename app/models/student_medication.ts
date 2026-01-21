import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import StudentMedicalInfo from './student_medical_info.js'

export default class StudentMedication extends BaseModel {
  static table = 'StudentMedication'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare medicalInfoId: string

  @column()
  declare name: string

  @column()
  declare dosage: string

  @column()
  declare frequency: string

  @column()
  declare instructions: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => StudentMedicalInfo, { foreignKey: 'medicalInfoId' })
  declare medicalInfo: BelongsTo<typeof StudentMedicalInfo>
}
