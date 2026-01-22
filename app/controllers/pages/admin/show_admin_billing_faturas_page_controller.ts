import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAdminBillingFaturasPageController {
  async handle({ inertia }: HttpContext) {
    return inertia.render('admin/billing/faturas')
  }
}
