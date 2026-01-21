import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { getHrOverviewValidator } from '#validators/analytics'

interface SchoolRow {
  school_name: string
  employee_count: string
  teacher_count: string
}

export default class GetHrOverviewController {
  async handle({ request, response }: HttpContext) {
    const { schoolId, schoolChainId } = await request.validateUsing(getHrOverviewValidator)

    let schoolFilter = ''
    const params: Record<string, string> = {}

    if (schoolId) {
      schoolFilter = 'AND s.id = :schoolId'
      params.schoolId = schoolId
    } else if (schoolChainId) {
      schoolFilter = 'AND s."schoolChainId" = :schoolChainId'
      params.schoolChainId = schoolChainId
    }

    const [employeeStatsResult, teacherStatsResult, timesheetStatsResult, bySchoolResult] =
      await Promise.all([
        // Stats de funcionarios (usuarios com registros de ponto)
        db.rawQuery(
          `
        SELECT
          COUNT(DISTINCT et."userId") as total_employees
        FROM "EmployeeTimesheet" et
        JOIN "Timesheet" ts ON et."timesheetId" = ts.id
        JOIN "School" s ON ts."schoolId" = s.id
        WHERE 1=1 ${schoolFilter}
        `,
          params
        ),

        // Stats de professores
        db.rawQuery(
          `
        SELECT
          COUNT(DISTINCT t.id) as total_teachers,
          COUNT(DISTINCT thc."teacherId") as teachers_with_classes
        FROM "Teacher" t
        JOIN "User" u ON t.id = u.id
        JOIN "UserHasSchool" uhs ON u.id = uhs."userId"
        JOIN "School" s ON uhs."schoolId" = s.id
        LEFT JOIN "TeacherHasClass" thc ON t.id = thc."teacherId"
        WHERE u."deletedAt" IS NULL
        ${schoolFilter}
        `,
          params
        ),

        // Stats de ponto (timesheet entries)
        db.rawQuery(
          `
        SELECT
          COUNT(*) as total_records,
          COUNT(CASE WHEN te."exitTime" IS NOT NULL THEN 1 END) as completed_records,
          COUNT(CASE WHEN te."exitTime" IS NULL AND te.worked = true THEN 1 END) as incomplete_records
        FROM "TimesheetEntry" te
        JOIN "EmployeeTimesheet" et ON te."employeeTimesheetId" = et.id
        JOIN "Timesheet" ts ON et."timesheetId" = ts.id
        JOIN "School" s ON ts."schoolId" = s.id
        WHERE te.date >= CURRENT_DATE - INTERVAL '30 days'
        ${schoolFilter}
        `,
          params
        ),

        // Por escola
        db.rawQuery(
          `
        SELECT
          s.name as school_name,
          COUNT(DISTINCT et."userId") as employee_count,
          COUNT(DISTINCT t.id) as teacher_count
        FROM "School" s
        LEFT JOIN "Timesheet" ts ON s.id = ts."schoolId"
        LEFT JOIN "EmployeeTimesheet" et ON ts.id = et."timesheetId"
        LEFT JOIN "UserHasSchool" uhs ON s.id = uhs."schoolId"
        LEFT JOIN "Teacher" t ON uhs."userId" = t.id
        WHERE 1=1 ${schoolFilter}
        GROUP BY s.id, s.name
        ORDER BY teacher_count DESC
        LIMIT 10
        `,
          params
        ),
      ])

    const totalEmployees = Number(employeeStatsResult.rows[0]?.total_employees || 0)
    const totalTeachers = Number(teacherStatsResult.rows[0]?.total_teachers || 0)
    const teachersWithClasses = Number(teacherStatsResult.rows[0]?.teachers_with_classes || 0)

    const totalTimesheetRecords = Number(timesheetStatsResult.rows[0]?.total_records || 0)
    const completedTimesheets = Number(timesheetStatsResult.rows[0]?.completed_records || 0)
    const incompleteTimesheets = Number(timesheetStatsResult.rows[0]?.incomplete_records || 0)

    const timesheetCompletionRate =
      totalTimesheetRecords > 0
        ? Math.round((completedTimesheets / totalTimesheetRecords) * 100 * 10) / 10
        : 0

    const bySchool = (bySchoolResult.rows as SchoolRow[]).map((row) => ({
      schoolName: row.school_name,
      employeeCount: Number(row.employee_count),
      teacherCount: Number(row.teacher_count),
    }))

    return response.ok({
      totalEmployees,
      totalTeachers,
      teachersWithClasses,
      totalTimesheetRecords,
      completedTimesheets,
      incompleteTimesheets,
      timesheetCompletionRate,
      bySchool,
    })
  }
}
