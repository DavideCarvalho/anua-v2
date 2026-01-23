import { BaseModelDto } from '@adocasts.com/dto/base'
import type StudentHasLevel from '#models/student_has_level'

interface AttendanceSummary {
  totalClasses: number
  presentCount: number
  absentCount: number
  lateCount: number
  justifiedCount: number
}

export default class GetClassStudentsAttendanceResponseDto extends BaseModelDto {
  declare student: {
    id: string
    name: string
  }
  declare totalClasses: number
  declare presentCount: number
  declare absentCount: number
  declare lateCount: number
  declare justifiedCount: number
  declare attendancePercentage: number

  constructor(studentHasLevel?: StudentHasLevel, summary?: AttendanceSummary) {
    super()

    if (!studentHasLevel) return

    const totalClasses = summary?.totalClasses ?? 0
    const presentCount = summary?.presentCount ?? 0
    const absentCount = summary?.absentCount ?? 0
    const lateCount = summary?.lateCount ?? 0
    const justifiedCount = summary?.justifiedCount ?? 0

    const attendedCount = presentCount + lateCount + justifiedCount
    const attendancePercentage =
      totalClasses > 0 ? Math.round((attendedCount / totalClasses) * 100) : 0

    this.student = {
      id: studentHasLevel.studentId,
      name: studentHasLevel.student?.user?.name || 'Nome não disponível',
    }
    this.totalClasses = totalClasses
    this.presentCount = presentCount
    this.absentCount = absentCount
    this.lateCount = lateCount
    this.justifiedCount = justifiedCount
    this.attendancePercentage = attendancePercentage
  }
}
