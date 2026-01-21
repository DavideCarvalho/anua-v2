import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAdminSegurosPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('admin/seguros/index')
  }

  async sinistros({ inertia }: HttpContext) {
    return inertia.render('admin/seguros/sinistros')
  }

  async faturamento({ inertia }: HttpContext) {
    return inertia.render('admin/seguros/faturamento')
  }

  async analytics({ inertia }: HttpContext) {
    return inertia.render('admin/seguros/analytics')
  }

  async configuracao({ inertia }: HttpContext) {
    return inertia.render('admin/seguros/configuracao')
  }
}
