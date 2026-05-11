import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

const NON_SCHOOL_STAFF_ROLES = ['STUDENT_RESPONSIBLE', 'RESPONSIBLE', 'STUDENT']

/**
 * Ensures the authenticated user belongs to at least one school
 * AND has a school-staff role (not student, parent, etc.).
 *
 * Use for routes under `/escola` that require school access.
 * Uses `selectedSchoolIds` set by impersonation middleware.
 *
 * IMPORTANTE: Este middleware deve vir APÓS o middleware de impersonation
 */
export default class RequireSchoolMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { auth, response, selectedSchoolIds } = ctx

    if (!selectedSchoolIds || selectedSchoolIds.length === 0) {
      const originalRole = ctx.impersonation?.originalUser?.role
      if (
        ctx.impersonation?.isImpersonating &&
        (originalRole === 'SUPER_ADMIN' || originalRole === 'ADMIN')
      ) {
        return response.redirect('/admin')
      }

      return response.redirect('/dashboard')
    }

    const user = ctx.effectiveUser ?? auth.user
    if (user) {
      if (user.roleId && !user.$preloaded.role) {
        await user.load('role')
      }

      const roleName = user.role?.name

      if (roleName && NON_SCHOOL_STAFF_ROLES.includes(roleName)) {
        if (roleName === 'STUDENT') {
          return response.redirect('/aluno')
        }

        return response.redirect('/responsavel')
      }
    }

    return next()
  }
}
