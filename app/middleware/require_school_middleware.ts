import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Ensures the authenticated user belongs to at least one school.
 *
 * Use for routes under `/escola` that require school access.
 * Uses `selectedSchoolIds` set by impersonation middleware.
 *
 * IMPORTANTE: Este middleware deve vir APÓS o middleware de impersonation
 */
export default class RequireSchoolMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { response, selectedSchoolIds } = ctx

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

    return next()
  }
}
