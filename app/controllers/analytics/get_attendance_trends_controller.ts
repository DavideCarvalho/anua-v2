import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getAttendanceTrendsValidator } from '#validators/analytics'
import { getPedagogicalScope } from '#services/pedagogical_scope'

interface AttendanceTrendRow {
  period: string
  total: string
  present: string
  absent: string
  late: string
}

export default class GetAttendanceTrendsController {
  async handle({ request, response, ...ctx }: HttpContext) {
    const {
      schoolId,
      schoolChainId,
      academicPeriodId,
      courseId,
      classId,
      period = 'month',
    } = await request.validateUsing(getAttendanceTrendsValidator)

    const scope = await getPedagogicalScope(ctx as HttpContext)

    let schoolFilter = ''
    let classFilter = ''
    let extraFilter = ''
    const params: Record<string, any> = {}

    if (scope.type === 'teacher') {
      if (scope.classIds.length === 0) {
        return response.ok({ trends: [] })
      }
      const placeholders = scope.classIds.map((_, i) => `:classId${i}`).join(', ')
      scope.classIds.forEach((id, i) => {
        params[`classId${i}`] = id
      })
      classFilter = `AND st."classId" IN (${placeholders})`
    } else {
      if (schoolId) {
        schoolFilter = 'AND s.id = :schoolId'
        params.schoolId = schoolId
      } else if (schoolChainId) {
        schoolFilter = 'AND s."schoolChainId" = :schoolChainId'
        params.schoolChainId = schoolChainId
      } else if (scope.schoolIds.length > 0) {
        schoolFilter = 'AND s.id = ANY(:scopeSchoolIds)'
        params.scopeSchoolIds = scope.schoolIds
      }
    }

    if (classId) {
      extraFilter += ' AND c.id = :classId'
      params.classId = classId
    }
    if (courseId) {
      extraFilter += ' AND c."courseId" = :courseId'
      params.courseId = courseId
    }
    if (academicPeriodId) {
      extraFilter +=
        ' AND EXISTS (SELECT 1 FROM "ClassHasAcademicPeriod" chap WHERE chap."classId" = c.id AND chap."academicPeriodId" = :academicPeriodId)'
      params.academicPeriodId = academicPeriodId
    }

    let dateFormat: string
    let dateInterval: string

    switch (period) {
      case 'week':
        dateFormat = 'YYYY-MM-DD'
        dateInterval = '7 days'
        break
      case 'year':
        dateFormat = 'YYYY-MM'
        dateInterval = '12 months'
        break
      default:
        dateFormat = 'YYYY-MM-DD'
        dateInterval = '30 days'
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
      JOIN "Class" c ON st."classId" = c.id
      JOIN "School" s ON c."schoolId" = s.id
      WHERE a.date >= NOW() - INTERVAL '${dateInterval}'
      ${schoolFilter}
      ${classFilter}
      ${extraFilter}
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
