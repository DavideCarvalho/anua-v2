import { BaseModelDto } from '@adocasts.com/dto/base'
import type AcademicPeriodWeekendClass from '#models/academic_period_weekend_class'
import type { DateTime } from 'luxon'

export default class AcademicPeriodWeekendClassDto extends BaseModelDto {
  declare id: string
  declare academicPeriodId: string
  declare date: DateTime
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(academicPeriodWeekendClass?: AcademicPeriodWeekendClass) {
    super()

    if (!academicPeriodWeekendClass) return

    this.id = academicPeriodWeekendClass.id
    this.academicPeriodId = academicPeriodWeekendClass.academicPeriodId
    this.date = academicPeriodWeekendClass.date
    this.createdAt = academicPeriodWeekendClass.createdAt
    this.updatedAt = academicPeriodWeekendClass.updatedAt
  }
}
