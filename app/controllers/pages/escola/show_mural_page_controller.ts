import type { HttpContext } from '@adonisjs/core/http'

export default class ShowMuralPageController {
  async handle({ inertia, params, auth }: HttpContext) {
    const { schoolSlug } = params

    return inertia.render('escola/mural', {
      schoolId: schoolSlug,
      currentUserId: auth.user?.id,
    })
  }
}
