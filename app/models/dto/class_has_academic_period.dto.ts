import { BaseModelDto } from '@adocasts.com/dto/base'
import type ClassHasAcademicPeriod from '#models/class_has_academic_period'
import type { DateTime } from 'luxon'

export default class ClassHasAcademicPeriodDto extends BaseModelDto {
  declare id: string
  declare classId: string
  declare academicPeriodId: string
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(model?: ClassHasAcademicPeriod) {
    super()

    if (!model) return

    this.id = model.id
    this.classId = model.classId
    this.academicPeriodId = model.academicPeriodId
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
