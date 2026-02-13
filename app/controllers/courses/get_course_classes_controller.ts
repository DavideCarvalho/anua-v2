import type { HttpContext } from '@adonisjs/core/http'
import CourseHasAcademicPeriod from '#models/course_has_academic_period'
import Class_ from '#models/class'
import Assignment from '#models/assignment'
import Attendance from '#models/attendance'
import AppException from '#exceptions/app_exception'

interface TeacherInfo {
  id: string
  name: string
  email: string | null
  subject: {
    id: string
    name: string
  }
}

interface ClassExpanded {
  id: string
  name: string
  slug: string
  studentCount: number
  teachers: TeacherInfo[]
  lastActivity: {
    type: 'ASSIGNMENT'
    timestamp: Date
    description: string
  } | null
  averageAttendance: number | null
}

export default class GetCourseClassesController {
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
      throw AppException.notFound('Curso não encontrado neste período letivo')
    }

    // Get the level IDs assigned to this course in this academic period
    const levelIds = courseAcademicPeriod.levelAssignments.map((la) => la.levelId)

    if (levelIds.length === 0) {
      return response.ok([])
    }

    // Get all classes for these levels
    const classes = await Class_.query()
      .whereIn('levelId', levelIds)
      .where('isArchived', false)
      .preload('students')
      .preload('teacherClasses', (query) => {
        query.where('isActive', true)
        query.preload('teacher', (tq) => tq.preload('user'))
        query.preload('subject')
      })
      .orderBy('name', 'asc')

    // Build expanded class data
    const classesExpanded: ClassExpanded[] = await Promise.all(
      classes.map(async (cls) => {
        // Get latest assignment for this class
        const latestAssignment = await Assignment.query()
          .where('academicPeriodId', academicPeriodId)
          .whereHas('teacherHasClass', (query) => {
            query.where('classId', cls.id)
          })
          .orderBy('createdAt', 'desc')
          .first()

        // Get attendance stats for this class
        const attendanceRecords = await Attendance.query()
          .whereHas('calendarSlot', (query) => {
            query.whereHas('calendar', (cq) => {
              cq.where('academicPeriodId', academicPeriodId)
            })
            query.whereHas('teacherHasClass', (thcq) => {
              thcq.where('classId', cls.id)
            })
          })
          .preload('calendarSlot')

        // Calculate average attendance
        const totalStudents = cls.students.length
        let averageAttendance: number | null = null

        if (attendanceRecords.length > 0 && totalStudents > 0) {
          // For a simple calculation, we assume average attendance
          // A more accurate calculation would need StudentHasAttendance data
          averageAttendance = 0 // Placeholder - would need actual calculation
        }

        return {
          id: cls.id,
          name: cls.name,
          slug: cls.slug,
          studentCount: totalStudents,
          teachers: cls.teacherClasses.map((thc) => ({
            id: thc.teacher?.id || thc.teacherId,
            name: thc.teacher?.user?.name || 'Professor',
            email: thc.teacher?.user?.email || null,
            subject: {
              id: thc.subject?.id || thc.subjectId,
              name: thc.subject?.name || 'Matéria',
            },
          })),
          lastActivity: latestAssignment
            ? {
                type: 'ASSIGNMENT' as const,
                timestamp: latestAssignment.createdAt.toJSDate(),
                description: latestAssignment.name,
              }
            : null,
          averageAttendance,
        }
      })
    )

    return response.ok(classesExpanded)
  }
}
