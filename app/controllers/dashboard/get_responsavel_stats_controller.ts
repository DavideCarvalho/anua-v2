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

    return {
      students,
      notifications: 0,
    }
  }
}
