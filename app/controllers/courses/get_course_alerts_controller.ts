import type { HttpContext } from '@adonisjs/core/http'
import Class_ from '#models/class'
import CourseHasAcademicPeriod from '#models/course_has_academic_period'

interface AlertData {
  type: string
  severity: 'critical' | 'warning' | 'info'
  message: string
  data: Record<string, unknown>
}

export default class GetCourseAlertsController {
  async handle({ params, response }: HttpContext) {
    const { courseId, academicPeriodId } = params

    // First, verify that the course-academic period combination exists
    const courseAcademicPeriod = await CourseHasAcademicPeriod.query()
      .where('courseId', courseId)
      .where('academicPeriodId', academicPeriodId)
      .preload('levelAssignments', (query) => {
        query.where('isActive', true)
      })
      .first()

    if (!courseAcademicPeriod) {
      return response.notFound({ message: 'Curso não encontrado neste período letivo' })
    }

    // Get the level IDs assigned to this course in this academic period
    const levelIds = courseAcademicPeriod.levelAssignments.map((la) => la.levelId)

    if (levelIds.length === 0) {
      return response.ok({
        critical: [],
        warning: [],
        info: [],
        totalAlerts: 0,
      })
    }

    // Get all classes for these levels with student count
    const classes = await Class_.query()
      .whereIn('levelId', levelIds)
      .where('isArchived', false)
      .preload('teacherClasses', (query) => {
        query.where('isActive', true)
      })
      .withCount('students', (query) => {
        query.as('studentCount')
      })

    const criticalAlerts: AlertData[] = []
    const warningAlerts: AlertData[] = []
    const infoAlerts: AlertData[] = []

    // Check for classes without teachers (critical)
    for (const cls of classes) {
      if (cls.teacherClasses.length === 0) {
        criticalAlerts.push({
          type: 'NO_TEACHER',
          severity: 'critical',
          message: `Turma ${cls.name} está sem professor`,
          data: {
            classId: cls.id,
            className: cls.name,
            studentCount: cls.$extras.studentCount || 0,
          },
        })
      }
    }

    // Note: Low attendance and students without recent grades would require
    // more complex queries with attendance/grade data. Adding placeholders here.

    return response.ok({
      critical: criticalAlerts,
      warning: warningAlerts,
      info: infoAlerts,
      totalAlerts: criticalAlerts.length + warningAlerts.length + infoAlerts.length,
    })
  }
}
