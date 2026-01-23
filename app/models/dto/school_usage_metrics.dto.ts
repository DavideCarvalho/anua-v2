import { BaseModelDto } from '@adocasts.com/dto/base'
import type SchoolUsageMetrics from '#models/school_usage_metrics'
import type { DateTime } from 'luxon'

export default class SchoolUsageMetricsDto extends BaseModelDto {
  declare id: string
  declare schoolId: string
  declare month: number
  declare year: number
  declare activeStudents: number
  declare activeTeachers: number
  declare activeUsers: number
  declare classesCreated: number
  declare assignmentsCreated: number
  declare attendanceRecords: number
  declare totalRevenue: number
  declare totalEnrollments: number
  declare loginCount: number
  declare lastActivityAt: DateTime | null
  declare createdAt: DateTime

  constructor(model?: SchoolUsageMetrics) {
    super()

    if (!model) return

    this.id = model.id
    this.schoolId = model.schoolId
    this.month = model.month
    this.year = model.year
    this.activeStudents = model.activeStudents
    this.activeTeachers = model.activeTeachers
    this.activeUsers = model.activeUsers
    this.classesCreated = model.classesCreated
    this.assignmentsCreated = model.assignmentsCreated
    this.attendanceRecords = model.attendanceRecords
    this.totalRevenue = model.totalRevenue
    this.totalEnrollments = model.totalEnrollments
    this.loginCount = model.loginCount
    this.lastActivityAt = model.lastActivityAt
    this.createdAt = model.createdAt
  }
}
