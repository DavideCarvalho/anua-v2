import type { HttpContext } from '@adonisjs/core/http'
import StudentHasLevel from '#models/student_has_level'
import AppException from '#exceptions/app_exception'

export default class ShowAlunoMatriculaPageController {
  async handle({ inertia, auth, effectiveUser }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.invalidCredentials()
    }

    const level = await StudentHasLevel.query()
      .where('studentId', user.id)
      .whereNull('deletedAt')
      .orderBy('createdAt', 'desc')
      .first()

    return inertia.render('aluno/matricula', { matriculaId: level?.id ?? null })
  }
}
