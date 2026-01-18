import type { HttpContext } from '@adonisjs/core/http'

export default class ShowResponsavelDashboardPageController {
  async handle({ inertia, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.redirect('/sign-in')
    }

    return inertia.render('responsavel/index')
  }
}
