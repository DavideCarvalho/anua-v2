import type { HttpContext } from '@adonisjs/core/http'

export default class ShowEditarAlunoPageController {
  async handle({ params, inertia }: HttpContext) {
    return inertia.render('escola/administrativo/alunos/editar', {
      studentId: params.id,
    })
  }
}
