import type { HttpContext } from '@adonisjs/core/http'

export default class ShowAdminDashboardPageController {
  async handle({ inertia, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.redirect('/sign-in')
    }

    await user.load('role')

    const roleName = user.role?.name
    if (roleName !== 'SUPER_ADMIN' && roleName !== 'ADMIN') {
      return response.redirect('/dashboard')
    }

    return inertia.render('admin/index')
  }
}
