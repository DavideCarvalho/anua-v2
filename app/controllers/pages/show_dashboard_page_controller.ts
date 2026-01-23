import type { HttpContext } from '@adonisjs/core/http'

export default class ShowDashboardPageController {
  async handle(ctx: HttpContext) {
    const { inertia, auth, response, effectiveUser } = ctx

    if (!auth.user) {
      return response.redirect('/sign-in')
    }

    // Use effectiveUser if impersonating, otherwise use auth.user
    const user = effectiveUser || auth.user
    if (user.roleId) {
      await user.load('role')
    }

    const roleName = user.role?.name

    // Determine redirect based on role
    let redirectTo = '/escola' // Default

    if (roleName === 'SUPER_ADMIN' || roleName === 'ADMIN') {
      redirectTo = '/admin'
    } else if (roleName === 'RESPONSIBLE' || roleName === 'STUDENT_RESPONSIBLE') {
      redirectTo = '/responsavel'
    } else if (roleName === 'STUDENT') {
      redirectTo = '/escola' // Students see the escola dashboard for now
    }

    return inertia.render('dashboard', { redirectTo })
  }
}
