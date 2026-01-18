import type { HttpContext } from '@adonisjs/core/http'
import StudentHasResponsible from '#models/student_has_responsible'
import Class from '#models/class'
import StudentGamification from '#models/student_gamification'

export default class GetResponsavelStatsController {
  async handle({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Não autenticado' })
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
        let courseName = '-'
        if (student.classId) {
          const classInfo = await Class.query()
            .where('id', student.classId)
            .preload('level', (levelQ) => {
              levelQ.preload('course')
            })
            .first()
          if (classInfo) {
            className = classInfo.name
            courseName = classInfo.level?.course?.name || '-'
          }
        }

        const gamification = await StudentGamification.query()
          .where('studentId', student.id)
          .first()

        return {
          id: student.id,
          name: student.user?.name || 'Aluno',
          className,
          courseName,
          averageGrade: null,
          attendanceRate: null,
          pendingPayments: 0,
          points: gamification?.points || 0,
        }
      })
    )

    return {
      students,
      notifications: 0,
    }
  }
}
