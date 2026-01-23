import { BaseModelDto } from '@adocasts.com/dto/base'
import type CourseHasAcademicPeriod from '#models/course_has_academic_period'
import type { DateTime } from 'luxon'

export default class CourseHasAcademicPeriodDto extends BaseModelDto {
  declare id: string
  declare courseId: string
  declare academicPeriodId: string
  declare createdAt: DateTime
  declare updatedAt: DateTime | null

  constructor(model?: CourseHasAcademicPeriod) {
    super()

    if (!model) return

    this.id = model.id
    this.courseId = model.courseId
    this.academicPeriodId = model.academicPeriodId
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
