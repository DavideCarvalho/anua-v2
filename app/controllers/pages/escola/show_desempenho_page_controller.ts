import type { HttpContext } from '@adonisjs/core/http'

export default class ShowDesempenhoPageController {
  async handle({ inertia, params }: HttpContext) {
    const { schoolSlug } = params

    return inertia.render('escola/desempenho', {
      schoolId: schoolSlug,
    })
  }
}
