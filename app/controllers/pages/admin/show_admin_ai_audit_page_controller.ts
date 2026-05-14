import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAdminAiAuditPageController {
  async audit({ inertia }: HttpContext) {
    return inertia.render('admin/ai/audit', {})
  }

  async tokens({ inertia }: HttpContext) {
    return inertia.render('admin/ai/tokens', {})
  }
}
