import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class GetSchoolHealthController {
  async handle(_ctx: HttpContext) {
    const rows = await db.rawQuery(`
      SELECT
        s.id,
        s.name,
        s.slug,
        sub.status AS subscription_status,
        COALESCE(students.cnt, 0) AS active_students,
        COALESCE(teachers.cnt, 0) AS active_teachers,
        COALESCE(users.cnt, 0) AS active_users,
        COALESCE(logins.cnt, 0) AS recent_logins,
        last_login.last_user_login,
        features.has_classes,
        features.has_assignments,
        features.has_attendance,
        features.has_enrollments,
        features.has_payments
      FROM "School" s
      LEFT JOIN "Subscription" sub ON sub."schoolId" = s.id
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS cnt FROM "Student" st
        JOIN "Contract" c ON c.id = st."contractId"
        WHERE c."schoolId" = s.id
      ) students ON true
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS cnt FROM "UserHasSchool" uhs
        JOIN "User" u ON u.id = uhs."userId"
        JOIN "Role" r ON r.id = u."roleId"
        WHERE uhs."schoolId" = s.id AND r.name = 'TEACHER'
      ) teachers ON true
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS cnt FROM "UserHasSchool" uhs
        WHERE uhs."schoolId" = s.id
      ) users ON true
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS cnt FROM "UserHasSchool" uhs
        JOIN "User" u ON u.id = uhs."userId"
        WHERE uhs."schoolId" = s.id
          AND u."lastLoggedInAt" > NOW() - interval '30 days'
      ) logins ON true
      LEFT JOIN LATERAL (
        SELECT MAX(u."lastLoggedInAt") AS last_user_login
        FROM "UserHasSchool" uhs
        JOIN "User" u ON u.id = uhs."userId"
        WHERE uhs."schoolId" = s.id
      ) last_login ON true
      LEFT JOIN LATERAL (
        SELECT
          EXISTS(SELECT 1 FROM "Class" cl WHERE cl."schoolId" = s.id) AS has_classes,
          EXISTS(
            SELECT 1 FROM "Assignment" a
            JOIN "TeacherHasClass" thc ON thc.id = a."teacherHasClassId"
            JOIN "Class" cl ON cl.id = thc."classId"
            WHERE cl."schoolId" = s.id
          ) AS has_assignments,
          EXISTS(
            SELECT 1 FROM "StudentHasAttendance" sha
            JOIN "Student" st ON st.id = sha."studentId"
            JOIN "Contract" c ON c.id = st."contractId"
            WHERE c."schoolId" = s.id
          ) AS has_attendance,
          EXISTS(
            SELECT 1 FROM "StudentHasLevel" shl
            JOIN "Contract" c ON c.id = shl."contractId"
            WHERE c."schoolId" = s.id AND shl."deletedAt" IS NULL
          ) AS has_enrollments,
          EXISTS(
            SELECT 1 FROM "StudentPayment" sp
            JOIN "Contract" c ON c.id = sp."contractId"
            WHERE c."schoolId" = s.id
          ) AS has_payments
      ) features ON true
      ORDER BY last_login.last_user_login ASC NULLS FIRST
    `)

    const schools = rows.rows.map((r: Record<string, string | number | boolean | null>) => {
      const lastActivity = r.last_user_login
        ? new Date(r.last_user_login as string)
        : null
      const daysSinceActivity = lastActivity
        ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
        : null

      let healthStatus: 'healthy' | 'warning' | 'critical' | 'inactive'
      if (daysSinceActivity === null || daysSinceActivity > 60) healthStatus = 'inactive'
      else if (daysSinceActivity > 30) healthStatus = 'critical'
      else if (daysSinceActivity > 14) healthStatus = 'warning'
      else healthStatus = 'healthy'

      const featureAdoption = [
        r.has_classes && 'Turmas',
        r.has_assignments && 'Atividades',
        r.has_attendance && 'Frequência',
        r.has_enrollments && 'Matrículas',
        r.has_payments && 'Financeiro',
      ].filter(Boolean)

      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        subscriptionStatus: r.subscription_status ?? 'NONE',
        activeStudents: Number(r.active_students),
        activeTeachers: Number(r.active_teachers),
        activeUsers: Number(r.active_users),
        recentLogins: Number(r.recent_logins),
        lastActivityAt: r.last_user_login ?? null,
        daysSinceActivity,
        healthStatus,
        featureAdoption,
      }
    })

    const summary = {
      total: schools.length,
      healthy: schools.filter((s: { healthStatus: string }) => s.healthStatus === 'healthy').length,
      warning: schools.filter((s: { healthStatus: string }) => s.healthStatus === 'warning').length,
      critical: schools.filter((s: { healthStatus: string }) => s.healthStatus === 'critical').length,
      inactive: schools.filter((s: { healthStatus: string }) => s.healthStatus === 'inactive').length,
    }

    return { schools, summary }
  }
}
