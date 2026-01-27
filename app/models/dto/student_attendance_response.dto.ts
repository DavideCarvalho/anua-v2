import { BaseModelDto } from '@adocasts.com/dto/base'
import type { SimplePaginatorMetaKeys } from '@adonisjs/lucid/types/querybuilder'

export class AttendanceRecordDto extends BaseModelDto {
  declare id: string
  declare date: string
  declare status: string
  declare justification: string | null

  constructor(data: { id: string; date: string; status: string; justification: string | null }) {
    super()
    this.id = data.id
    this.date = data.date
    this.status = data.status
    this.justification = data.justification
  }
}

export class AttendanceSummaryDto extends BaseModelDto {
  declare totalClasses: number
  declare presentCount: number
  declare absentCount: number
  declare lateCount: number
  declare excusedCount: number
  declare attendanceRate: number

  constructor(data: {
    totalClasses: number
    presentCount: number
    absentCount: number
    lateCount: number
    excusedCount: number
    attendanceRate: number
  }) {
    super()
    this.totalClasses = data.totalClasses
    this.presentCount = data.presentCount
    this.absentCount = data.absentCount
    this.lateCount = data.lateCount
    this.excusedCount = data.excusedCount
    this.attendanceRate = data.attendanceRate
  }
}

export class StudentAttendanceResponseDto extends BaseModelDto {
  declare data: AttendanceRecordDto[]
  declare meta: SimplePaginatorMetaKeys
  declare summary: AttendanceSummaryDto

  constructor(data: {
    data: AttendanceRecordDto[]
    meta: SimplePaginatorMetaKeys
    summary: AttendanceSummaryDto
  }) {
    super()
    this.data = data.data
    this.meta = data.meta
    this.summary = data.summary
  }
}
