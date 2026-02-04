import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAlunoLojaStorePageController {
  async handle({ inertia, params }: HttpContext) {
    return inertia.render('aluno/loja/store', { storeId: params.id })
  }
}
