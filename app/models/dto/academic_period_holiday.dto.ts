import { BaseModelDto } from '@adocasts.com/dto/base'
import type AcademicPeriodHoliday from '#models/academic_period_holiday'
import type { DateTime } from 'luxon'

export default class AcademicPeriodHolidayDto extends BaseModelDto {
  declare id: string
  declare date: DateTime
  declare academicPeriodId: string
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(academicPeriodHoliday?: AcademicPeriodHoliday) {
    super()

    if (!academicPeriodHoliday) return

    this.id = academicPeriodHoliday.id
    this.date = academicPeriodHoliday.date
    this.academicPeriodId = academicPeriodHoliday.academicPeriodId
    this.createdAt = academicPeriodHoliday.createdAt
    this.updatedAt = academicPeriodHoliday.updatedAt
  }
}
