import { BaseModelDto } from '@adocasts.com/dto/base'
import type AcademicPeriodWeekendClass from '#models/academic_period_weekend_class'

export default class AcademicPeriodWeekendClassDto extends BaseModelDto {
  declare id: string
  declare academicPeriodId: string
  declare date: Date
  declare createdAt: Date
  declare updatedAt: Date

  constructor(academicPeriodWeekendClass?: AcademicPeriodWeekendClass) {
    super()

    if (!academicPeriodWeekendClass) return

    this.id = academicPeriodWeekendClass.id
    this.academicPeriodId = academicPeriodWeekendClass.academicPeriodId
    this.date = academicPeriodWeekendClass.date.toJSDate()
    this.createdAt = academicPeriodWeekendClass.createdAt.toJSDate()
    this.updatedAt = academicPeriodWeekendClass.updatedAt.toJSDate()
  }
}
