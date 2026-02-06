import type { HttpContext } from '@adonisjs/core/http'

export default class ShowResponsavelLojaStorePageController {
  async handle({ inertia, params }: HttpContext) {
    return inertia.render('responsavel/loja/store', { storeId: params.id })
  }
}
