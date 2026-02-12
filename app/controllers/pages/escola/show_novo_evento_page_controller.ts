import type { HttpContext } from '@adonisjs/core/http'

export default class ShowNovoEventoPageController {
  async handle({ inertia, params }: HttpContext) {
    const { schoolSlug } = params

    return inertia.render('escola/eventos/novo', {
      schoolId: schoolSlug,
    })
  }
}
