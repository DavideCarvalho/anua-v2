import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentHasSchoolPartner from '#models/student_has_school_partner'

export default class StudentHasSchoolPartnerDto extends BaseModelDto {
  declare id: string
  declare studentId: string
  declare schoolPartnerId: string
  declare academicPeriodId: string
  declare startDate: Date
  declare endDate: Date | null
  declare isActive: boolean
  declare userId: string | null
  declare createdAt: Date
  declare updatedAt: Date

  constructor(model?: StudentHasSchoolPartner) {
    super()

    if (!model) return

    this.id = model.id
    this.studentId = model.studentId
    this.schoolPartnerId = model.schoolPartnerId
    this.academicPeriodId = model.academicPeriodId
    this.startDate = model.startDate.toJSDate()
    this.endDate = model.endDate ? model.endDate.toJSDate() : null
    this.isActive = model.isActive
    this.userId = model.userId
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt.toJSDate()
  }
}
