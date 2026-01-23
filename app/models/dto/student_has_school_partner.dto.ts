import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentHasSchoolPartner from '#models/student_has_school_partner'
import type { DateTime } from 'luxon'

export default class StudentHasSchoolPartnerDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare schoolPartnerId: string
  declare academicPeriodId: string
  declare startDate: DateTime
  declare endDate: DateTime | null
  declare isActive: boolean
  declare userId: string | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: StudentHasSchoolPartner) {
    super()

    if (!model) return

    this.id = model.id
    this.studentId = model.studentId
    this.schoolPartnerId = model.schoolPartnerId
    this.academicPeriodId = model.academicPeriodId
    this.startDate = model.startDate
    this.endDate = model.endDate
    this.isActive = model.isActive
    this.userId = model.userId
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
