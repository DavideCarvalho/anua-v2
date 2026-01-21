import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getAttendanceTrendsValidator } from '#validators/analytics'

interface AttendanceTrendRow {
  period: string
  total: string
  present: string
  absent: string
  late: string
}

export default class GetAttendanceTrendsController {
  async handle({ request, response }: HttpContext) {
    const { schoolId, schoolChainId, period = 'month' } = await request.validateUsing(
      getAttendanceTrendsValidator
    )

    let schoolFilter = ''
    const params: Record<string, string> = {}

    if (schoolId) {
      schoolFilter = 'AND s.id = :schoolId'
      params.schoolId = schoolId
    } else if (schoolChainId) {
      schoolFilter = 'AND s."schoolChainId" = :schoolChainId'
      params.schoolChainId = schoolChainId
    }

    let dateFormat: string
    let dateInterval: string

    switch (period) {
      case 'week':
        dateFormat = 'YYYY-MM-DD'
        dateInterval = "7 days"
        break
      case 'year':
        dateFormat = 'YYYY-MM'
        dateInterval = "12 months"
        break
      default:
        dateFormat = 'YYYY-MM-DD'
        dateInterval = "30 days"
    }

    const trendsResult = await db.rawQuery(
      `
      SELECT
        TO_CHAR(a.date, '${dateFormat}') as period,
        COUNT(*) as total,
        COUNT(CASE WHEN sha.status = 'PRESENT' THEN 1 END) as present,
        COUNT(CASE WHEN sha.status = 'ABSENT' THEN 1 END) as absent,
        COUNT(CASE WHEN sha.status = 'LATE' THEN 1 END) as late
      FROM "StudentHasAttendance" sha
      JOIN "Attendance" a ON sha."attendanceId" = a.id
      JOIN "Student" st ON sha."studentId" = st.id
      JOIN "User" u ON st.id = u.id
      JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
      JOIN "School" s ON uhs."schoolId" = s.id
      WHERE a.date >= NOW() - INTERVAL '${dateInterval}'
      ${schoolFilter}
      GROUP BY TO_CHAR(a.date, '${dateFormat}')
      ORDER BY period ASC
      `,
      params
    )

    const trends = (trendsResult.rows as AttendanceTrendRow[]).map((row) => ({
      period: row.period,
      total: Number(row.total),
      present: Number(row.present),
      absent: Number(row.absent),
      late: Number(row.late),
      attendanceRate:
        Number(row.total) > 0
          ? Math.round((Number(row.present) / Number(row.total)) * 100 * 10) / 10
          : 0,
    }))

    return response.ok({ trends })
  }
}
