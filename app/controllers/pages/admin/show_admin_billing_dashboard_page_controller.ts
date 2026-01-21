import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAdminBillingDashboardPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('admin/billing/dashboard')
  }
}
