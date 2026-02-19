import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentMedicalInfo from '#models/student_medical_info'

export default class StudentMedicalInfoDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare conditions: string | null
  declare documents: Array<{ name: string; url: string }> | null
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: StudentMedicalInfo) {
    super()

    if (!model) return

    this.id = model.id
    this.studentId = model.studentId
    this.conditions = model.conditions
    this.documents = model.documents
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
