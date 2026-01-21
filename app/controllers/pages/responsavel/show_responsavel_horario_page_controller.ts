import type { HttpContext } from '@adonisjs/core/http'

export default class ShowResponsavelHorarioPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('responsavel/horario')
  }
}
