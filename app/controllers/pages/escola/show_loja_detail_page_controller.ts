import type { HttpContext } from '@adonisjs/core/http'

export default class ShowLojaDetailPageController {
  async handle({ inertia, params }: HttpContext) {
    return inertia.render('escola/lojas/show', { storeId: params.id })
  }
}
