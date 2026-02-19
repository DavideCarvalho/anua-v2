import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentMedication from '#models/student_medication'
import type { DateTime } from 'luxon'

export default class StudentMedicationDto extends BaseModelDto {
  declare id: string
  declare medicalInfoId: string
  declare name: string
  declare dosage: string
  declare frequency: string
  declare instructions: string | null
  declare createdAt: Date
  declare updatedAt: Date

  constructor(studentMedication?: StudentMedication) {
    super()

    if (!studentMedication) return

    this.id = studentMedication.id
    this.medicalInfoId = studentMedication.medicalInfoId
    this.name = studentMedication.name
    this.dosage = studentMedication.dosage
    this.frequency = studentMedication.frequency
    this.instructions = studentMedication.instructions
    this.createdAt = studentMedication.createdAt.toJSDate()
    this.updatedAt = studentMedication.updatedAt.toJSDate()
  }
}
