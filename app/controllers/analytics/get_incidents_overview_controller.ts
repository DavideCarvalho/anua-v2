import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getIncidentsOverviewValidator } from '#validators/analytics'

interface TypeRow {
  type: string
  count: string
}

interface IncidentSchoolRow {
  school_name: string
  incident_count: string
}

export default class GetIncidentsOverviewController {
  async handle({ request, response }: HttpContext) {
    const { schoolId, schoolChainId } = await request.validateUsing(getIncidentsOverviewValidator)

    let schoolFilter = ''
    const params: Record<string, string> = {}

    if (schoolId) {
      schoolFilter = 'AND s.id = :schoolId'
      params.schoolId = schoolId
    } else if (schoolChainId) {
      schoolFilter = 'AND s."schoolChainId" = :schoolChainId'
      params.schoolChainId = schoolChainId
    }

    const [incidentStatsResult, byTypeResult, bySchoolResult, recentIncidentsResult] =
      await Promise.all([
        // Stats gerais
        db.rawQuery(
          `
        SELECT
          COUNT(*) as total_incidents,
          COUNT(CASE WHEN o.type = 'BEHAVIOR' THEN 1 END) as behavior_count,
          COUNT(CASE WHEN o.type = 'PERFORMANCE' THEN 1 END) as performance_count,
          COUNT(CASE WHEN o.type = 'ABSENCE' THEN 1 END) as absence_count,
          COUNT(CASE WHEN o.type = 'LATE' THEN 1 END) as late_count,
          COUNT(CASE WHEN o.type = 'OTHER' THEN 1 END) as other_count
        FROM "Occurence" o
        JOIN "Student" st ON o."studentId" = st.id
        JOIN "User" u ON st.id = u.id
        JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
        JOIN "School" s ON uhs."schoolId" = s.id
        WHERE 1=1 ${schoolFilter}
        `,
          params
        ),

        // Por tipo
        db.rawQuery(
          `
        SELECT
          o.type,
          COUNT(*) as count
        FROM "Occurence" o
        JOIN "Student" st ON o."studentId" = st.id
        JOIN "User" u ON st.id = u.id
        JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
        JOIN "School" s ON uhs."schoolId" = s.id
        WHERE 1=1 ${schoolFilter}
        GROUP BY o.type
        ORDER BY count DESC
        `,
          params
        ),

        // Por escola
        db.rawQuery(
          `
        SELECT
          s.name as school_name,
          COUNT(*) as incident_count
        FROM "Occurence" o
        JOIN "Student" st ON o."studentId" = st.id
        JOIN "User" u ON st.id = u.id
        JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
        JOIN "School" s ON uhs."schoolId" = s.id
        WHERE 1=1 ${schoolFilter}
        GROUP BY s.name
        ORDER BY incident_count DESC
        LIMIT 10
        `,
          params
        ),

        // Ultimos 30 dias
        db.rawQuery(
          `
        SELECT COUNT(*) as recent_incidents
        FROM "Occurence" o
        JOIN "Student" st ON o."studentId" = st.id
        JOIN "User" u ON st.id = u.id
        JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
        JOIN "School" s ON uhs."schoolId" = s.id
        WHERE o."createdAt" >= NOW() - INTERVAL '30 days'
        ${schoolFilter}
        `,
          params
        ),
      ])

    const totalIncidents = Number(incidentStatsResult.rows[0]?.total_incidents || 0)
    const behaviorCount = Number(incidentStatsResult.rows[0]?.behavior_count || 0)
    const performanceCount = Number(incidentStatsResult.rows[0]?.performance_count || 0)
    const absenceCount = Number(incidentStatsResult.rows[0]?.absence_count || 0)
    const lateCount = Number(incidentStatsResult.rows[0]?.late_count || 0)
    const otherCount = Number(incidentStatsResult.rows[0]?.other_count || 0)
    const recentIncidents = Number(recentIncidentsResult.rows[0]?.recent_incidents || 0)

    const byType = (byTypeResult.rows as TypeRow[]).map((row) => ({
      type: row.type,
      count: Number(row.count),
    }))

    const bySchool = (bySchoolResult.rows as IncidentSchoolRow[]).map((row) => ({
      schoolName: row.school_name,
      incidentCount: Number(row.incident_count),
    }))

    return response.ok({
      totalIncidents,
      behaviorCount,
      performanceCount,
      absenceCount,
      lateCount,
      otherCount,
      recentIncidents,
      byType,
      bySchool,
    })
  }
}
