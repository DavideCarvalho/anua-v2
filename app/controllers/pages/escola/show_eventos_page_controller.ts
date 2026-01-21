import type { HttpContext } from '@adonisjs/core/http'

export default class ShowEventosPageController {
  async handle({ inertia, params }: HttpContext) {
    const { schoolSlug } = params

    return inertia.render('escola/eventos', {
      schoolId: schoolSlug,
    })
  }
}
