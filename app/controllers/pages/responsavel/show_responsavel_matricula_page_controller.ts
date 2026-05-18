import type { HttpContext } from '@adonisjs/core/http'

export default class ShowResponsavelMatriculaPageController {
  async handle({ inertia, params }: HttpContext) {
    return inertia.render('responsavel/matricula', { matriculaId: params.id })
  }
}
