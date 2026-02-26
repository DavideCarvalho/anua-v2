import { BaseModelDto } from '@adocasts.com/dto/base'
import type Course from '#models/course'
import AcademicPeriodDto from './academic_period.dto.js'

export default class CourseDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare slug: string
  declare schoolId: string
  declare version: number
  declare coordinatorId: string | null
  declare enrollmentMinimumAge: number | null
  declare enrollmentMaximumAge: number | null
  declare maxStudentsPerClass: number | null
  declare createdAt: Date
  declare updatedAt: Date | null
  declare academicPeriods?: AcademicPeriodDto[]

  constructor(model?: Course) {
    super()

    if (!model) return

    this.id = model.id
    this.name = model.name
    this.slug = model.slug
    this.schoolId = model.schoolId
    this.version = model.version
    this.coordinatorId = model.coordinatorId
    this.enrollmentMinimumAge = model.enrollmentMinimumAge
    this.enrollmentMaximumAge = model.enrollmentMaximumAge
    this.maxStudentsPerClass = model.maxStudentsPerClass
    this.createdAt = model.createdAt.toJSDate()
    this.updatedAt = model.updatedAt ? model.updatedAt.toJSDate() : null
    this.academicPeriods = model.academicPeriods
      ? AcademicPeriodDto.fromArray(model.academicPeriods)
      : undefined
  }
}
