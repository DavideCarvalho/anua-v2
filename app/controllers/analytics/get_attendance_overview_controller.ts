import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getAttendanceOverviewValidator } from '#validators/analytics'

export default class GetAttendanceOverviewController {
  async handle({ request, response }: HttpContext) {
    const { schoolId, schoolChainId } = await request.validateUsing(getAttendanceOverviewValidator)

    let schoolFilter = ''
    const params: Record<string, string> = {}

    if (schoolId) {
      schoolFilter = 'AND s.id = :schoolId'
      params.schoolId = schoolId
    } else if (schoolChainId) {
      schoolFilter = 'AND s."schoolChainId" = :schoolChainId'
      params.schoolChainId = schoolChainId
    }

    const [
      totalStudentsResult,
      attendanceStatsResult,
      _lateArrivalsResult,
      justifiedAbsencesResult,
    ] = await Promise.all([
      // Total de estudantes ativos
      db.rawQuery(
        `
        SELECT COUNT(DISTINCT st.id) as count
        FROM "Student" st
        JOIN "User" u ON st.id = u.id
        JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
        JOIN "School" s ON uhs."schoolId" = s.id
        WHERE st."enrollmentStatus" = 'REGISTERED'
        AND u."deletedAt" IS NULL
        ${schoolFilter}
        `,
        params
      ),

      // Stats de presenca
      db.rawQuery(
        `
        SELECT
          COUNT(*) as total_records,
          COUNT(CASE WHEN sha.status = 'PRESENT' THEN 1 END) as present_count,
          COUNT(CASE WHEN sha.status = 'ABSENT' THEN 1 END) as absent_count,
          COUNT(CASE WHEN sha.status = 'LATE' THEN 1 END) as late_count
        FROM "StudentHasAttendance" sha
        JOIN "Attendance" a ON sha."attendanceId" = a.id
        JOIN "Student" st ON sha."studentId" = st.id
        JOIN "User" u ON st.id = u.id
        JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
        JOIN "School" s ON uhs."schoolId" = s.id
        WHERE 1=1 ${schoolFilter}
        `,
        params
      ),

      // Atrasos
      db.rawQuery(
        `
        SELECT COUNT(*) as count
        FROM "StudentHasAttendance" sha
        JOIN "Attendance" a ON sha."attendanceId" = a.id
        JOIN "Student" st ON sha."studentId" = st.id
        JOIN "User" u ON st.id = u.id
        JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
        JOIN "School" s ON uhs."schoolId" = s.id
        WHERE sha.status = 'LATE'
        ${schoolFilter}
        `,
        params
      ),

      // Faltas justificadas
      db.rawQuery(
        `
        SELECT COUNT(*) as count
        FROM "StudentHasAttendance" sha
        JOIN "Attendance" a ON sha."attendanceId" = a.id
        JOIN "Student" st ON sha."studentId" = st.id
        JOIN "User" u ON st.id = u.id
        JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
        JOIN "School" s ON uhs."schoolId" = s.id
        WHERE sha.status = 'ABSENT'
        AND sha.justification IS NOT NULL
        ${schoolFilter}
        `,
        params
      ),
    ])

    const totalStudents = Number(totalStudentsResult.rows[0]?.count || 0)
    const totalRecords = Number(attendanceStatsResult.rows[0]?.total_records || 0)
    const presentCount = Number(attendanceStatsResult.rows[0]?.present_count || 0)
    const absentCount = Number(attendanceStatsResult.rows[0]?.absent_count || 0)
    const lateCount = Number(attendanceStatsResult.rows[0]?.late_count || 0)
    const justifiedCount = Number(justifiedAbsencesResult.rows[0]?.count || 0)

    const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0
    const absentRate = totalRecords > 0 ? (absentCount / totalRecords) * 100 : 0
    const lateRate = totalRecords > 0 ? (lateCount / totalRecords) * 100 : 0
    const justificationRate = absentCount > 0 ? (justifiedCount / absentCount) * 100 : 0

    return response.ok({
      totalStudents,
      totalRecords,
      presentCount,
      absentCount,
      lateCount,
      justifiedCount,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      absentRate: Math.round(absentRate * 10) / 10,
      lateRate: Math.round(lateRate * 10) / 10,
      justificationRate: Math.round(justificationRate * 10) / 10,
    })
  }
}
