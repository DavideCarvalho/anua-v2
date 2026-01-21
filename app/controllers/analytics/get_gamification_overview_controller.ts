import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getGamificationOverviewValidator } from '#validators/analytics'

interface TopStudentRow {
  id: string
  name: string
  points: string
  level: string
  school_name: string
}

export default class GetGamificationOverviewController {
  async handle({ request, response }: HttpContext) {
    const { schoolId, schoolChainId } = await request.validateUsing(
      getGamificationOverviewValidator
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

    const [pointsStatsResult, achievementsResult, storeStatsResult, topStudentsResult] =
      await Promise.all([
        // Stats de pontos
        db.rawQuery(
          `
        SELECT
          COALESCE(SUM(sg."totalPoints"), 0) as total_points,
          COALESCE(AVG(sg."totalPoints"), 0) as avg_points,
          COUNT(DISTINCT sg."studentId") as students_with_points
        FROM "StudentGamification" sg
        JOIN "Student" st ON sg."studentId" = st.id
        JOIN "User" u ON st.id = u.id
        JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
        JOIN "School" s ON uhs."schoolId" = s.id
        WHERE 1=1 ${schoolFilter}
        `,
          params
        ),

        // Stats de conquistas
        db.rawQuery(
          `
        SELECT
          COUNT(DISTINCT a.id) as total_achievements,
          COUNT(sa.id) as achievements_earned,
          COUNT(DISTINCT sg."studentId") as students_with_achievements
        FROM "Achievement" a
        JOIN "School" s ON a."schoolId" = s.id
        LEFT JOIN "StudentAchievement" sa ON a.id = sa."achievementId"
        LEFT JOIN "StudentGamification" sg ON sa."studentGamificationId" = sg.id
        WHERE 1=1 ${schoolFilter}
        `,
          params
        ),

        // Stats da loja
        db.rawQuery(
          `
        SELECT
          COUNT(DISTINCT si.id) as total_items,
          COUNT(DISTINCT CASE WHEN si."isActive" = true THEN si.id END) as available_items,
          COUNT(DISTINCT so.id) as total_orders,
          COALESCE(SUM(so."totalPoints"), 0) as points_spent
        FROM "StoreItem" si
        JOIN "School" s ON si."schoolId" = s.id
        LEFT JOIN "StoreOrderItem" soi ON si.id = soi."storeItemId"
        LEFT JOIN "StoreOrder" so ON soi."orderId" = so.id
        WHERE 1=1 ${schoolFilter}
        `,
          params
        ),

        // Top 10 alunos
        db.rawQuery(
          `
        SELECT
          st.id,
          u.name,
          sg."totalPoints" as points,
          sg."currentLevel" as level,
          s.name as school_name
        FROM "StudentGamification" sg
        JOIN "Student" st ON sg."studentId" = st.id
        JOIN "User" u ON st.id = u.id
        JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
        JOIN "School" s ON uhs."schoolId" = s.id
        WHERE 1=1 ${schoolFilter}
        ORDER BY sg."totalPoints" DESC
        LIMIT 10
        `,
          params
        ),
      ])

    const totalPoints = Number(pointsStatsResult.rows[0]?.total_points || 0)
    const avgPoints = Number(pointsStatsResult.rows[0]?.avg_points || 0)
    const studentsWithPoints = Number(pointsStatsResult.rows[0]?.students_with_points || 0)

    const totalAchievements = Number(achievementsResult.rows[0]?.total_achievements || 0)
    const achievementsEarned = Number(achievementsResult.rows[0]?.achievements_earned || 0)
    const studentsWithAchievements = Number(
      achievementsResult.rows[0]?.students_with_achievements || 0
    )

    const totalStoreItems = Number(storeStatsResult.rows[0]?.total_items || 0)
    const availableStoreItems = Number(storeStatsResult.rows[0]?.available_items || 0)
    const totalOrders = Number(storeStatsResult.rows[0]?.total_orders || 0)
    const pointsSpent = Number(storeStatsResult.rows[0]?.points_spent || 0)

    const topStudents = (topStudentsResult.rows as TopStudentRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      points: Number(row.points),
      level: Number(row.level),
      schoolName: row.school_name,
    }))

    return response.ok({
      totalPoints,
      avgPoints: Math.round(avgPoints * 10) / 10,
      studentsWithPoints,
      totalAchievements,
      achievementsEarned,
      studentsWithAchievements,
      totalStoreItems,
      availableStoreItems,
      totalOrders,
      pointsSpent,
      topStudents,
    })
  }
}
