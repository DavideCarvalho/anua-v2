import { BaseModelDto } from '@adocasts.com/dto/base'
import type CourseHasAcademicPeriod from '#models/course_has_academic_period'
import type { DateTime } from 'luxon'
import CourseDto from './course.dto.js'
import LevelAssignedToCourseHasAcademicPeriodDto from './level_assigned_to_course_has_academic_period.dto.js'

export default class CourseHasAcademicPeriodDto extends BaseModelDto {
  declare id: string
  declare courseId: string
  declare academicPeriodId: string
  declare createdAt: DateTime
  declare updatedAt: DateTime | null
  declare course?: CourseDto
  declare levelAssignments?: LevelAssignedToCourseHasAcademicPeriodDto[]

  constructor(model?: CourseHasAcademicPeriod) {
    super()

    if (!model) return

    this.id = model.id
    this.courseId = model.courseId
    this.academicPeriodId = model.academicPeriodId
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
    this.course = model.course ? new CourseDto(model.course) : undefined
    this.levelAssignments = model.levelAssignments
      ? LevelAssignedToCourseHasAcademicPeriodDto.fromArray(model.levelAssignments)
      : undefined
  }
}
