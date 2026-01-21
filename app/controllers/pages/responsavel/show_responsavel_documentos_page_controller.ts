import type { HttpContext } from '@adonisjs/core/http'

export default class ShowResponsavelDocumentosPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('responsavel/documentos')
  }
}
