import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAdminAnalyticsPageController {
  async academico({ inertia }: HttpContext) {
    return inertia.render('admin/analytics/academico')
  }

  async presenca({ inertia }: HttpContext) {
    return inertia.render('admin/analytics/presenca')
  }

  async cantina({ inertia }: HttpContext) {
    return inertia.render('admin/analytics/cantina')
  }

  async pagamentos({ inertia }: HttpContext) {
    return inertia.render('admin/analytics/pagamentos')
  }

  async matriculas({ inertia }: HttpContext) {
    return inertia.render('admin/analytics/matriculas')
  }

  async ocorrencias({ inertia }: HttpContext) {
    return inertia.render('admin/analytics/ocorrencias')
  }

  async gamificacao({ inertia }: HttpContext) {
    return inertia.render('admin/analytics/gamificacao')
  }

  async rh({ inertia }: HttpContext) {
    return inertia.render('admin/analytics/rh')
  }

  async index({ inertia }: HttpContext) {
    return inertia.render('admin/analytics/index')
  }
}
