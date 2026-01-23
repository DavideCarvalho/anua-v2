import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentEmergencyContact from '#models/student_emergency_contact'
import type { EmergencyContactRelationship } from '#models/student_emergency_contact'
import type { DateTime } from 'luxon'

export default class StudentEmergencyContactDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare userId: string | null
  declare name: string
  declare phone: string
  declare relationship: EmergencyContactRelationship
  declare order: number
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: StudentEmergencyContact) {
    super()

    if (!model) return

    this.id = model.id
    this.studentId = model.studentId
    this.userId = model.userId
    this.name = model.name
    this.phone = model.phone
    this.relationship = model.relationship
    this.order = model.order
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
