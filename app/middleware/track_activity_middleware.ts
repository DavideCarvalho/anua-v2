import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { DateTime } from 'luxon'

export default class TrackActivityMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (ctx.auth.isAuthenticated) {
      const user = ctx.auth.user!
      const now = DateTime.now()

      if (!user.lastLoggedInAt || now.diff(user.lastLoggedInAt, 'minutes').minutes >= 5) {
        user.lastLoggedInAt = now
        user.save().catch(() => {}) // fire-and-forget, don't block the response
      }
    }

    return next()
  }
}
