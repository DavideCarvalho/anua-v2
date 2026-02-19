import { BaseModelDto } from '@adocasts.com/dto/base'
import type Course from '#models/course'
import type { DateTime } from 'luxon'

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
  declare createdAt: DateTime
  declare updatedAt: DateTime | null

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
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt
  }
}
