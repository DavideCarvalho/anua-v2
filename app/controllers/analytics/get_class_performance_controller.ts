import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getPedagogicalScope } from '#services/pedagogical_scope'

interface ClassPerformanceRow {
  class_id: string
  class_name: string
  academic_periods: string | null
  average_grade: string | number | null
  attendance_rate: string | number | null
  student_count: string | number
  at_risk_count: string | number
}

export default class GetClassPerformanceController {
  async handle({ response, ...ctx }: HttpContext) {
    const scope = await getPedagogicalScope(ctx as HttpContext)

    let classFilter = ''
    const params: Record<string, any> = {}

    if (scope.type === 'teacher') {
      if (scope.classIds.length === 0) {
        return response.ok({ classes: [] })
      }
      const placeholders = scope.classIds.map((_, i) => `:classId${i}`).join(', ')
      scope.classIds.forEach((id, i) => {
        params[`classId${i}`] = id
      })
      classFilter = `AND c.id IN (${placeholders})`
    } else {
      if (scope.schoolIds.length === 0) {
        return response.ok({ classes: [] })
      }
      classFilter = 'AND c."schoolId" = ANY(:schoolIds)'
      params.schoolIds = scope.schoolIds
    }

    const result = await db.rawQuery(
      `
      WITH class_grades AS (
        SELECT
          c.id as class_id,
          c.name as class_name,
          AVG(CASE WHEN a.grade > 0 THEN (sha.grade::float / a.grade::float) * 10 ELSE NULL END) as average_grade
        FROM "Class" c
        LEFT JOIN "Student" st ON st."classId" = c.id AND st."enrollmentStatus" = 'REGISTERED'
        LEFT JOIN "StudentHasAssignment" sha ON sha."studentId" = st.id AND sha.grade IS NOT NULL
        LEFT JOIN "Assignment" a ON sha."assignmentId" = a.id
        WHERE 1=1 ${classFilter}
        GROUP BY c.id, c.name
      ),
      class_attendance AS (
        SELECT
          c.id as class_id,
          COUNT(*) as total,
          COUNT(CASE WHEN sha.status IN ('PRESENT', 'LATE') THEN 1 END) as present
        FROM "Class" c
        LEFT JOIN "Student" st ON st."classId" = c.id AND st."enrollmentStatus" = 'REGISTERED'
        LEFT JOIN "StudentHasAttendance" sha ON sha."studentId" = st.id
        LEFT JOIN "Attendance" a ON sha."attendanceId" = a.id
        WHERE 1=1 ${classFilter}
        AND a.date >= NOW() - INTERVAL '30 days'
        GROUP BY c.id
      ),
      class_students AS (
        SELECT
          c.id as class_id,
          COUNT(DISTINCT st.id) as student_count
        FROM "Class" c
        LEFT JOIN "Student" st ON st."classId" = c.id AND st."enrollmentStatus" = 'REGISTERED'
        WHERE 1=1 ${classFilter}
        GROUP BY c.id
      ),
      class_at_risk AS (
        SELECT
          c.id as class_id,
          COUNT(DISTINCT st.id) as at_risk_count
        FROM "Class" c
        JOIN "Student" st ON st."classId" = c.id AND st."enrollmentStatus" = 'REGISTERED'
        JOIN "StudentHasAssignment" sha ON sha."studentId" = st.id AND sha.grade IS NOT NULL
        JOIN "Assignment" a ON sha."assignmentId" = a.id
        JOIN "School" s ON c."schoolId" = s.id
        WHERE 1=1 ${classFilter}
        GROUP BY c.id, st.id, s."minimumGrade"
        HAVING AVG(CASE WHEN a.grade > 0 THEN (sha.grade::float / a.grade::float) * 10 ELSE 0 END) < COALESCE(s."minimumGrade", 6)
      )
      SELECT
        cg.class_id,
        cg.class_name,
        COALESCE(STRING_AGG(DISTINCT ap.name, ' | '), 'Sem período') as academic_periods,
        cg.average_grade,
        CASE WHEN ca.total > 0 THEN (ca.present::float / ca.total * 100) ELSE NULL END as attendance_rate,
        COALESCE(cs.student_count, 0) as student_count,
        COALESCE(car.at_risk_count, 0) as at_risk_count
      FROM class_grades cg
      LEFT JOIN class_attendance ca ON ca.class_id = cg.class_id
      LEFT JOIN class_students cs ON cs.class_id = cg.class_id
      LEFT JOIN "ClassHasAcademicPeriod" chap ON chap."classId" = cg.class_id
      LEFT JOIN "AcademicPeriod" ap ON ap.id = chap."academicPeriodId"
      LEFT JOIN (
        SELECT class_id, COUNT(*) as at_risk_count
        FROM class_at_risk
        GROUP BY class_id
      ) car ON car.class_id = cg.class_id
      GROUP BY cg.class_id, cg.class_name, cg.average_grade, ca.total, ca.present, cs.student_count, car.at_risk_count
      ORDER BY cg.average_grade ASC NULLS LAST
      `,
      params
    )

    const classes = (result.rows as ClassPerformanceRow[]).map((row) => ({
      classId: row.class_id,
      className: row.class_name,
      academicPeriods: row.academic_periods
        ?.split(' | ')
        .map((item) => item.trim())
        .filter(Boolean) ?? ['Sem período'],
      averageGrade:
        row.average_grade !== null ? Math.round(Number(row.average_grade) * 10) / 10 : null,
      attendanceRate:
        row.attendance_rate !== null ? Math.round(Number(row.attendance_rate) * 10) / 10 : null,
      studentCount: Number(row.student_count),
      atRiskCount: Number(row.at_risk_count),
    }))

    return response.ok({ classes })
  }
}
