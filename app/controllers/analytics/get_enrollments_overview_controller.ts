import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getEnrollmentsOverviewValidator } from '#validators/analytics'

interface StatusRow {
  status: string
  count: string
}

interface LevelRow {
  level_name: string
  student_count: string
}

export default class GetEnrollmentsOverviewController {
  async handle({ request, response }: HttpContext) {
    const { schoolId, schoolChainId } = await request.validateUsing(getEnrollmentsOverviewValidator)

    let schoolFilter = ''
    const params: Record<string, string> = {}

    if (schoolId) {
      schoolFilter = 'AND s.id = :schoolId'
      params.schoolId = schoolId
    } else if (schoolChainId) {
      schoolFilter = 'AND s."schoolChainId" = :schoolChainId'
      params.schoolChainId = schoolChainId
    }

    const [enrollmentStatsResult, byStatusResult, byLevelResult, recentEnrollmentsResult] =
      await Promise.all([
        // Stats gerais
        db.rawQuery(
          `
        SELECT
          COUNT(*) as total_students,
          COUNT(CASE WHEN st."enrollmentStatus" = 'REGISTERED' THEN 1 END) as active_students,
          COUNT(CASE WHEN st."enrollmentStatus" = 'PENDING_DOCUMENT_REVIEW' THEN 1 END) as pending_students
        FROM "Student" st
        JOIN "User" u ON st.id = u.id
        JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
        JOIN "School" s ON uhs."schoolId" = s.id
        WHERE u."deletedAt" IS NULL
        ${schoolFilter}
        `,
          params
        ),

        // Por status
        db.rawQuery(
          `
        SELECT
          st."enrollmentStatus" as status,
          COUNT(*) as count
        FROM "Student" st
        JOIN "User" u ON st.id = u.id
        JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
        JOIN "School" s ON uhs."schoolId" = s.id
        WHERE u."deletedAt" IS NULL
        ${schoolFilter}
        GROUP BY st."enrollmentStatus"
        `,
          params
        ),

        // Por nível/série
        db.rawQuery(
          `
        SELECT
          l.name as level_name,
          COUNT(DISTINCT st.id) as student_count
        FROM "Student" st
        JOIN "User" u ON st.id = u.id
        JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
        JOIN "School" s ON uhs."schoolId" = s.id
        LEFT JOIN "Class" cl ON st."classId" = cl.id
        LEFT JOIN "Level" l ON cl."levelId" = l.id
        WHERE st."enrollmentStatus" = 'REGISTERED'
        AND u."deletedAt" IS NULL
        AND l.name IS NOT NULL
        ${schoolFilter}
        GROUP BY l.name
        ORDER BY student_count DESC
        LIMIT 10
        `,
          params
        ),

        // Matriculas recentes (ultimos 30 dias)
        db.rawQuery(
          `
        SELECT
          COUNT(*) as recent_enrollments
        FROM "Student" st
        JOIN "User" u ON st.id = u.id
        JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
        JOIN "School" s ON uhs."schoolId" = s.id
        WHERE u."createdAt" >= NOW() - INTERVAL '30 days'
        AND u."deletedAt" IS NULL
        ${schoolFilter}
        `,
          params
        ),
      ])

    const totalStudents = Number(enrollmentStatsResult.rows[0]?.total_students || 0)
    const activeStudents = Number(enrollmentStatsResult.rows[0]?.active_students || 0)
    const pendingStudents = Number(enrollmentStatsResult.rows[0]?.pending_students || 0)
    const recentEnrollments = Number(recentEnrollmentsResult.rows[0]?.recent_enrollments || 0)

    const byStatus = (byStatusResult.rows as StatusRow[]).map((row) => ({
      status: row.status,
      count: Number(row.count),
    }))

    const byLevel = (byLevelResult.rows as LevelRow[]).map((row) => ({
      levelName: row.level_name,
      studentCount: Number(row.student_count),
    }))

    return response.ok({
      totalStudents,
      activeStudents,
      pendingStudents,
      cancelledStudents: 0, // Schema doesn't support cancelled status yet
      recentEnrollments,
      activeRate:
        totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100 * 10) / 10 : 0,
      byStatus,
      byLevel,
    })
  }
}
