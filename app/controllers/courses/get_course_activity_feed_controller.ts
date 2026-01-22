import type { HttpContext } from '@adonisjs/core/http'
import CourseHasAcademicPeriod from '#models/course_has_academic_period'
import Assignment from '#models/assignment'
import Attendance from '#models/attendance'
import Class_ from '#models/class'

interface ActivityItem {
  id: string
  type: 'ASSIGNMENT' | 'ATTENDANCE'
  timestamp: Date
  description: string
  className: string
  subjectName?: string
}

export default class GetCourseActivityFeedController {
  async handle({ params, request, response }: HttpContext) {
    const { courseId, academicPeriodId } = params
    const limit = Number(request.input('limit', 10))

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
      return response.ok([])
    }

    // Get all class IDs for these levels
    const classes = await Class_.query()
      .whereIn('levelId', levelIds)
      .where('isArchived', false)
      .select('id', 'name')

    const classIds = classes.map((cls) => cls.id)
    const classMap = new Map(classes.map((cls) => [cls.id, cls.name]))

    if (classIds.length === 0) {
      return response.ok([])
    }

    const activities: ActivityItem[] = []

    // Get recent assignments
    const recentAssignments = await Assignment.query()
      .where('academicPeriodId', academicPeriodId)
      .whereHas('teacherHasClass', (query) => {
        query.whereIn('classId', classIds)
      })
      .preload('teacherHasClass', (query) => {
        query.preload('teacher', (tq) => tq.preload('user'))
        query.preload('subject')
        query.preload('class')
      })
      .orderBy('createdAt', 'desc')
      .limit(limit)

    for (const assignment of recentAssignments) {
      const teacherName = assignment.teacherHasClass?.teacher?.user?.name || 'Professor'
      const className = assignment.teacherHasClass?.class?.name || 'Turma'
      const subjectName = assignment.teacherHasClass?.subject?.name

      activities.push({
        id: assignment.id,
        type: 'ASSIGNMENT',
        timestamp: assignment.createdAt.toJSDate(),
        description: `Prof. ${teacherName} postou "${assignment.name}"`,
        className,
        subjectName,
      })
    }

    // Get recent attendance records
    const recentAttendance = await Attendance.query()
      .whereHas('calendarSlot', (query) => {
        query.whereHas('calendar', (cq) => {
          cq.where('academicPeriodId', academicPeriodId)
        })
        query.whereHas('teacherHasClass', (thcq) => {
          thcq.whereIn('classId', classIds)
        })
      })
      .preload('calendarSlot', (query) => {
        query.preload('teacherHasClass', (thcq) => {
          thcq.preload('class')
          thcq.preload('subject')
        })
      })
      .orderBy('createdAt', 'desc')
      .limit(limit)

    for (const attendance of recentAttendance) {
      const className =
        attendance.calendarSlot?.teacherHasClass?.class?.name ||
        classMap.get(attendance.calendarSlot?.teacherHasClass?.classId || '') ||
        'Turma'
      const subjectName = attendance.calendarSlot?.teacherHasClass?.subject?.name

      activities.push({
        id: attendance.id,
        type: 'ATTENDANCE',
        timestamp: attendance.createdAt.toJSDate(),
        description: `Chamada realizada em ${className}`,
        className,
        subjectName,
      })
    }

    // Sort by timestamp (most recent first) and limit
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    const limitedActivities = activities.slice(0, limit)

    return response.ok(limitedActivities)
  }
}
