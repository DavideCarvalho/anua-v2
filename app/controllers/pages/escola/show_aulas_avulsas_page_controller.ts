import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAulasAvulsasPageController {
  async handle({ inertia, params }: HttpContext) {
    const { schoolSlug } = params

    return inertia.render('escola/pedagogico/aulas-avulsas', {
      schoolId: schoolSlug,
    })
  }
}
