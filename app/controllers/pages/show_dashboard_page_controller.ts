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
    const hasSchoolAccess = (ctx.userSchools?.length ?? 0) > 0

    // Determine redirect based on role
    let redirectTo = '/escola' // Default

    if (roleName === 'SUPER_ADMIN' || roleName === 'ADMIN') {
      redirectTo = '/admin'
    } else if (roleName === 'RESPONSIBLE' || roleName === 'STUDENT_RESPONSIBLE') {
      redirectTo = '/responsavel'
    } else if (roleName === 'STUDENT') {
      redirectTo = '/aluno'
    } else if (!hasSchoolAccess) {
      const originalRole = ctx.impersonation?.originalUser?.role
      if (
        ctx.impersonation?.isImpersonating &&
        (originalRole === 'SUPER_ADMIN' || originalRole === 'ADMIN')
      ) {
        redirectTo = '/admin'
      }
    }

    return inertia.render('dashboard', { redirectTo })
  }
}
