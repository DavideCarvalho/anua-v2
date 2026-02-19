import { BaseModelDto } from '@adocasts.com/dto/base'
import type AcademicPeriodHoliday from '#models/academic_period_holiday'

export default class AcademicPeriodHolidayDto extends BaseModelDto {
  declare id: string
  declare date: Date
  declare academicPeriodId: string
  declare createdAt: Date
  declare updatedAt: Date

  constructor(academicPeriodHoliday?: AcademicPeriodHoliday) {
    super()

    if (!academicPeriodHoliday) return

    this.id = academicPeriodHoliday.id
    this.date = academicPeriodHoliday.date.toJSDate()
    this.academicPeriodId = academicPeriodHoliday.academicPeriodId
    this.createdAt = academicPeriodHoliday.createdAt.toJSDate()
    this.updatedAt = academicPeriodHoliday.updatedAt.toJSDate()
  }
}
