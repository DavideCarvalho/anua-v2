import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getAcademicOverviewValidator } from '#validators/grades'
import { getPedagogicalScope, buildScopeFilters } from '#services/pedagogical_scope'

export default class GetAcademicOverviewController {
  async handle({ request, response, ...ctx }: HttpContext) {
    const { schoolId, schoolChainId, academicPeriodId, classId } = await request.validateUsing(
      getAcademicOverviewValidator
    )
    const scope = await getPedagogicalScope(ctx as HttpContext)
    const scopeFilters = buildScopeFilters(scope)

    // Build school filter from validator params
    let schoolFilter = ''
    const schoolParams: Record<string, string> = {}

    if (schoolId && scope.type !== 'teacher') {
      schoolFilter = 'AND s.id = :schoolId'
      schoolParams.schoolId = schoolId
    } else if (schoolChainId && scope.type !== 'teacher') {
      schoolFilter = 'AND s."schoolChainId" = :schoolChainId'
      schoolParams.schoolChainId = schoolChainId
    }

    const filterClause = schoolFilter || scopeFilters.schoolFilter || scopeFilters.classFilter
    const allParams = { ...schoolParams, ...scopeFilters.params }

    let extraFilters = ''
    if (academicPeriodId) {
      extraFilters +=
        ' AND EXISTS (SELECT 1 FROM "ClassHasAcademicPeriod" chap WHERE chap."classId" = c.id AND chap."academicPeriodId" = :academicPeriodId)'
      allParams.academicPeriodId = academicPeriodId
    }
    if (classId) {
      extraFilters += ' AND c.id = :classId'
      allParams.classId = classId
    }

    // Execute queries in parallel
    const [
      totalStudentsResult,
      totalAssignmentsResult,
      submissionsStatsResult,
      schoolsResult,
      totalSubjectsResult,
    ] = await Promise.all([
      db.rawQuery(
        `
        SELECT COUNT(*) as count
        FROM "Student" st
        JOIN "Class" c ON st."classId" = c.id
        JOIN "School" s ON c."schoolId" = s.id
        WHERE st."enrollmentStatus" = 'REGISTERED'
        ${filterClause}
        ${extraFilters}
        `,
        allParams
      ),

      db.rawQuery(
        `
        SELECT COUNT(*) as count
        FROM "Assignment" a
        JOIN "TeacherHasClass" thc ON a."teacherHasClassId" = thc.id
        JOIN "Class" c ON thc."classId" = c.id
        JOIN "School" s ON c."schoolId" = s.id
        WHERE 1=1 ${filterClause} ${extraFilters}
        `,
        allParams
      ),

      db.rawQuery(
        `
        SELECT
          COUNT(*) as total_submissions,
          COUNT(CASE WHEN sha.grade IS NOT NULL THEN 1 END) as graded_count,
          AVG(CASE WHEN sha.grade IS NOT NULL AND a.grade > 0
              THEN (sha.grade::float / a.grade::float) * 100
              ELSE NULL END) as average_percentage
        FROM "StudentHasAssignment" sha
        JOIN "Assignment" a ON sha."assignmentId" = a.id
        JOIN "Student" st ON sha."studentId" = st.id
        JOIN "Class" c ON st."classId" = c.id
        JOIN "School" s ON c."schoolId" = s.id
        WHERE 1=1 ${filterClause} ${extraFilters}
        `,
        allParams
      ),

      db.rawQuery(
        `
        SELECT id, name, "minimumGrade"
        FROM "School" s
        WHERE 1=1 ${filterClause.replace(/AND s\./g, 'AND s.')}
        `,
        allParams
      ),

      db.rawQuery(
        `
        SELECT COUNT(*) as count
        FROM "Subject" sub
        JOIN "School" s ON sub."schoolId" = s.id
        WHERE 1=1 ${filterClause}
        `,
        allParams
      ),
    ])

    const totalStudents = Number(totalStudentsResult.rows[0]?.count || 0)
    const totalAssignments = Number(totalAssignmentsResult.rows[0]?.count || 0)
    const totalSubmissions = Number(submissionsStatsResult.rows[0]?.total_submissions || 0)
    const gradedAssignments = Number(submissionsStatsResult.rows[0]?.graded_count || 0)
    const averageGrade = Number(submissionsStatsResult.rows[0]?.average_percentage || 0)
    const totalSubjects = Number(totalSubjectsResult.rows[0]?.count || 0)

    // Calculate completion rate
    const completionRate = totalSubmissions > 0 ? (gradedAssignments / totalSubmissions) * 100 : 0

    // Calculate at-risk students (students with average below minimum grade)
    const defaultMinGrade = 6
    const minimumGrade =
      schoolsResult.rows.length > 0
        ? Number(schoolsResult.rows[0]?.minimumGrade || defaultMinGrade)
        : defaultMinGrade

    const atRiskResult = await db.rawQuery(
      `
      SELECT COUNT(DISTINCT st.id) as count
      FROM "Student" st
      JOIN "Class" c ON st."classId" = c.id
      JOIN "School" s ON c."schoolId" = s.id
      JOIN "StudentHasAssignment" sha ON st.id = sha."studentId"
      JOIN "Assignment" a ON sha."assignmentId" = a.id
      WHERE st."enrollmentStatus" = 'REGISTERED'
      AND sha.grade IS NOT NULL
      ${filterClause}
      ${extraFilters}
      GROUP BY st.id
      HAVING AVG(CASE WHEN a.grade > 0
        THEN (sha.grade::float / a.grade::float) * 10
        ELSE 0 END) < :minGrade
      `,
      { ...allParams, minGrade: minimumGrade }
    )

    const atRiskStudents = atRiskResult.rows.length

    return response.ok({
      totalStudents,
      totalAssignments,
      gradedAssignments,
      totalSubmissions,
      completionRate: Math.round(completionRate * 10) / 10,
      averageGrade: Math.round(averageGrade * 10) / 10,
      atRiskStudents,
      atRiskPercentage:
        totalStudents > 0 ? Math.round((atRiskStudents / totalStudents) * 100 * 10) / 10 : 0,
      totalSubjects,
    })
  }
}
