import type { HttpContext } from '@adonisjs/core/http'
import Class_ from '#models/class'
import CourseHasAcademicPeriod from '#models/course_has_academic_period'
import AppException from '#exceptions/app_exception'

export default class GetCourseDashboardMetricsController {
  async handle({ params, response }: HttpContext) {
    const { courseId, academicPeriodId } = params

    // First, verify that the course-academic period combination exists
    const courseAcademicPeriod = await CourseHasAcademicPeriod.query()
      .where('courseId', courseId)
      .where('academicPeriodId', academicPeriodId)
      .preload('levelAssignments', (query) => {
        query.where('isActive', true)
        query.preload('level')
      })
      .first()

    if (!courseAcademicPeriod) {
      throw AppException.notFound('Curso não encontrado neste período letivo')
    }

    // Get the level IDs assigned to this course in this academic period
    const levelIds = courseAcademicPeriod.levelAssignments.map((la) => la.levelId)

    if (levelIds.length === 0) {
      return response.ok({
        summary: {
          totalStudents: 0,
          totalTeachers: 0,
          totalClasses: 0,
          averageAttendance: 0,
        },
      })
    }

    // Get all classes for these levels
    const classes = await Class_.query()
      .whereIn('levelId', levelIds)
      .where('isArchived', false)
      .preload('students')
      .preload('teacherClasses', (query) => {
        query.where('isActive', true)
        query.preload('teacher')
      })

    // Calculate metrics
    const totalStudents = classes.reduce((sum, cls) => sum + cls.students.length, 0)

    // Get unique teachers
    const uniqueTeacherIds = new Set<string>()
    classes.forEach((cls) => {
      cls.teacherClasses.forEach((thc) => {
        uniqueTeacherIds.add(thc.teacherId)
      })
    })

    const totalTeachers = uniqueTeacherIds.size
    const totalClasses = classes.length

    // Average attendance placeholder (would need actual attendance data calculation)
    const averageAttendance = 0

    return response.ok({
      summary: {
        totalStudents,
        totalTeachers,
        totalClasses,
        averageAttendance,
      },
    })
  }
}
