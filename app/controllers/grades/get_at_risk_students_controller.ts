import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getAtRiskStudentsValidator } from '#validators/grades'

export default class GetAtRiskStudentsController {
  async handle({ request, response }: HttpContext) {
    const {
      schoolId,
      schoolChainId,
      minimumGrade = 6,
      limit = 50,
    } = await request.validateUsing(getAtRiskStudentsValidator)

    // Build filters
    let schoolFilter = ''
    const params: Record<string, string | number> = { minimumGrade, limit }

    if (schoolId) {
      schoolFilter = 'AND s.id = :schoolId'
      params.schoolId = schoolId
    } else if (schoolChainId) {
      schoolFilter = 'AND s."schoolChainId" = :schoolChainId'
      params.schoolChainId = schoolChainId
    }

    // Get students with their average grades
    const studentsResult = await db.rawQuery(
      `
      WITH student_averages AS (
        SELECT
          st.id as student_id,
          u.name as student_name,
          u.email as student_email,
          s.id as school_id,
          s.name as school_name,
          COALESCE(s."minimumGrade", :minimumGrade) as school_min_grade,
          COUNT(DISTINCT sha.id) as assignments_count,
          AVG(
            CASE
              WHEN a.grade > 0
              THEN (sha.grade::float / a.grade::float) * 10
              ELSE 0
            END
          ) as average_grade
        FROM "Student" st
        JOIN "User" u ON st.id = u.id
        JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
        JOIN "School" s ON uhs."schoolId" = s.id
        LEFT JOIN "StudentHasAssignment" sha ON st.id = sha."studentId" AND sha.grade IS NOT NULL
        LEFT JOIN "Assignment" a ON sha."assignmentId" = a.id
        WHERE st."enrollmentStatus" = 'REGISTERED'
        AND u."deletedAt" IS NULL
        ${schoolFilter}
        GROUP BY st.id, u.name, u.email, s.id, s.name, s."minimumGrade"
        HAVING COUNT(sha.id) > 0
      )
      SELECT *
      FROM student_averages
      WHERE average_grade < school_min_grade
      ORDER BY average_grade ASC
      LIMIT :limit
      `,
      params
    )

    const atRiskStudents = studentsResult.rows.map((row: any) => ({
      studentId: row.student_id,
      studentName: row.student_name,
      studentEmail: row.student_email,
      schoolId: row.school_id,
      schoolName: row.school_name,
      averageGrade: Math.round(Number(row.average_grade) * 10) / 10,
      minimumRequired: Number(row.school_min_grade),
      assignmentsCount: Number(row.assignments_count),
      deficit: Math.round((Number(row.school_min_grade) - Number(row.average_grade)) * 10) / 10,
    }))

    // Group by school
    const bySchool = new Map<
      string,
      {
        schoolId: string
        schoolName: string
        count: number
        students: typeof atRiskStudents
      }
    >()

    atRiskStudents.forEach((student: (typeof atRiskStudents)[number]) => {
      const existing = bySchool.get(student.schoolId) ?? {
        schoolId: student.schoolId,
        schoolName: student.schoolName,
        count: 0,
        students: [],
      }
      existing.count += 1
      existing.students.push(student)
      bySchool.set(student.schoolId, existing)
    })

    // Get total students count for percentage calculation
    const totalStudentsResult = await db.rawQuery(
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
    )

    const totalStudents = Number(totalStudentsResult.rows[0]?.count || 0)

    return response.ok({
      totalAtRisk: atRiskStudents.length,
      totalStudents,
      atRiskPercentage:
        totalStudents > 0
          ? Math.round((atRiskStudents.length / totalStudents) * 100 * 10) / 10
          : 0,
      bySchool: Array.from(bySchool.values())
        .sort((a, b) => b.count - a.count)
        .map((item) => ({
          schoolId: item.schoolId,
          schoolName: item.schoolName,
          count: item.count,
          students: item.students.slice(0, 10), // Top 10 per school
        })),
      topStudents: atRiskStudents.slice(0, 20), // Top 20 with lowest grades
    })
  }
}
