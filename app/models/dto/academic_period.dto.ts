import { BaseModelDto } from '@adocasts.com/dto/base'
import type AcademicPeriod from '#models/academic_period'
import type { AcademicPeriodSegment } from '#models/academic_period'
import CourseHasAcademicPeriodDto from './course_has_academic_period.dto.js'

export default class AcademicPeriodDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare slug: string
  declare startDate: Date
  declare endDate: Date
  declare enrollmentStartDate: Date | null
  declare enrollmentEndDate: Date | null
  declare isActive: boolean
  declare segment: AcademicPeriodSegment
  declare isClosed: boolean
  declare minimumGradeOverride: number | null
  declare minimumAttendanceOverride: number | null
  declare schoolId: string
  declare previousAcademicPeriodId: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare courseAcademicPeriods?: CourseHasAcademicPeriodDto[]

  constructor(academicPeriod?: AcademicPeriod) {
    super()

    if (!academicPeriod) return

    this.id = academicPeriod.id
    this.name = academicPeriod.name
    this.slug = academicPeriod.slug
    this.startDate = academicPeriod.startDate.toJSDate()
    this.endDate = academicPeriod.endDate.toJSDate()
    this.enrollmentStartDate = academicPeriod.enrollmentStartDate
      ? academicPeriod.enrollmentStartDate.toJSDate()
      : null
    this.enrollmentEndDate = academicPeriod.enrollmentEndDate
      ? academicPeriod.enrollmentEndDate.toJSDate()
      : null
    this.isActive = academicPeriod.isActive
    this.segment = academicPeriod.segment
    this.isClosed = academicPeriod.isClosed
    this.minimumGradeOverride = academicPeriod.minimumGradeOverride
    this.minimumAttendanceOverride = academicPeriod.minimumAttendanceOverride
    this.schoolId = academicPeriod.schoolId
    this.previousAcademicPeriodId = academicPeriod.previousAcademicPeriodId
    this.createdAt = academicPeriod.createdAt.toJSDate()
    this.updatedAt = academicPeriod.updatedAt.toJSDate()
    this.courseAcademicPeriods = academicPeriod.courseAcademicPeriods
      ? CourseHasAcademicPeriodDto.fromArray(academicPeriod.courseAcademicPeriods)
      : undefined
  }
}
