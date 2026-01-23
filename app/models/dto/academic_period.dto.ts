import { BaseModelDto } from '@adocasts.com/dto/base'
import type AcademicPeriod from '#models/academic_period'
import type { AcademicPeriodSegment } from '#models/academic_period'
import type { DateTime } from 'luxon'

export default class AcademicPeriodDto extends BaseModelDto {
  declare id: string
  declare name: string
  declare slug: string
  declare startDate: DateTime
  declare endDate: DateTime
  declare enrollmentStartDate: DateTime | null
  declare enrollmentEndDate: DateTime | null
  declare isActive: boolean
  declare segment: AcademicPeriodSegment
  declare isClosed: boolean
  declare minimumGradeOverride: number | null
  declare minimumAttendanceOverride: number | null
  declare schoolId: string
  declare previousAcademicPeriodId: string | null
  declare createdAt: DateTime
  declare updatedAt: DateTime

  constructor(academicPeriod?: AcademicPeriod) {
    super()

    if (!academicPeriod) return

    this.id = academicPeriod.id
    this.name = academicPeriod.name
    this.slug = academicPeriod.slug
    this.startDate = academicPeriod.startDate
    this.endDate = academicPeriod.endDate
    this.enrollmentStartDate = academicPeriod.enrollmentStartDate
    this.enrollmentEndDate = academicPeriod.enrollmentEndDate
    this.isActive = academicPeriod.isActive
    this.segment = academicPeriod.segment
    this.isClosed = academicPeriod.isClosed
    this.minimumGradeOverride = academicPeriod.minimumGradeOverride
    this.minimumAttendanceOverride = academicPeriod.minimumAttendanceOverride
    this.schoolId = academicPeriod.schoolId
    this.previousAcademicPeriodId = academicPeriod.previousAcademicPeriodId
    this.createdAt = academicPeriod.createdAt
    this.updatedAt = academicPeriod.updatedAt
  }
}
