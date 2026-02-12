import type { HttpContext } from '@adonisjs/core/http'
import StudentHasResponsible from '#models/student_has_responsible'
import Class from '#models/class'
import StudentGamification from '#models/student_gamification'
import Notification from '#models/notification'
import AppException from '#exceptions/app_exception'

export default class GetResponsavelStatsController {
  async handle({ auth, effectiveUser }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.invalidCredentials()
    }

    const studentRelations = await StudentHasResponsible.query()
      .where('responsibleId', user.id)
      .preload('student', (studentQuery) => {
        studentQuery.preload('user')
      })

    const students = await Promise.all(
      studentRelations.map(async (relation) => {
        const student = relation.student

        let className = '-'
        let levelName = '-'
        if (student.classId) {
          const classInfo = await Class.query()
            .where('id', student.classId)
            .preload('level')
            .first()
          if (classInfo) {
            className = classInfo.name
            levelName = classInfo.level?.name || '-'
          }
        }

        const gamification = await StudentGamification.query()
          .where('studentId', student.id)
          .first()

        return {
          id: student.id,
          slug: student.user?.slug || student.id,
          name: student.user?.name || 'Aluno',
          className,
          levelName,
          averageGrade: null,
          attendanceRate: null,
          pendingPayments: 0,
          points: gamification?.totalPoints || 0,
          permissions: {
            pedagogical: relation.isPedagogical,
            financial: relation.isFinancial,
          },
        }
      })
    )

    // Count unread notifications for all students this responsible has access to
    const studentIds = studentRelations.map((r) => r.studentId)
    let unreadCount = 0
    if (studentIds.length > 0) {
      const notificationsCount = await Notification.query()
        .whereIn('userId', studentIds)
        .where('isRead', false)
        .count('* as total')
      unreadCount = Number(notificationsCount[0]?.$extras.total || 0)
    }

    return {
      students,
      notifications: unreadCount,
    }
  }
}
