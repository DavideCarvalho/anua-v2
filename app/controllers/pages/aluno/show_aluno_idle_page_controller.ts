import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAlunoIdlePageController {
  async handle({ inertia, auth, effectiveUser }: HttpContext) {
    const user = effectiveUser ?? auth.user

    return inertia.render('aluno/idle', {
      studentName: user?.name?.split(' ')[0] ?? 'Aluno',
    })
  }
}
