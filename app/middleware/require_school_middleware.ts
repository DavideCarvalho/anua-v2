import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Ensures the authenticated user belongs to a school.
 *
 * Use for routes under `/escola` that require `user.schoolId`.
 */
export default class RequireSchoolMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn) {
    const user = auth.user

    if (!user?.schoolId) {
      return response.redirect('/dashboard')
    }

    return next()
  }
}
