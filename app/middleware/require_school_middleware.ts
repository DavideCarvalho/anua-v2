import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Ensures the authenticated user belongs to a school.
 *
 * Use for routes under `/escola` that require `user.schoolId`.
 * Supports impersonation - uses effectiveUser if available.
 */
export default class RequireSchoolMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { auth, response, effectiveUser } = ctx

    // Usar effectiveUser se disponível (set pelo impersonation middleware)
    const user = effectiveUser ?? auth.user

    if (!user?.schoolId) {
      return response.redirect('/dashboard')
    }

    return next()
  }
}
