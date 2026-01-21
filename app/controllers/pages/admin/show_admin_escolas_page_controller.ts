import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAdminEscolasPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('admin/escolas')
  }
}
