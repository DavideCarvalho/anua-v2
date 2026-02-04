import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Store from '#models/store'

/**
 * Store Owner Middleware
 *
 * Verifies that the authenticated user owns at least one active store.
 * Loads the first active store and attaches it to `ctx.storeOwnerStore`.
 *
 * Must come AFTER auth middleware.
 */
export default class StoreOwnerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { auth, request, response } = ctx
    const user = auth.user

    if (!user) {
      return response.unauthorized({ message: 'Não autenticado' })
    }

    const store = await Store.query()
      .where('ownerUserId', user.id)
      .whereNull('deletedAt')
      .where('isActive', true)
      .preload('school')
      .first()

    if (!store) {
      if (request.accepts(['html', 'json']) === 'html') {
        return response.redirect('/dashboard')
      }
      return response.forbidden({ message: 'Você não possui uma loja ativa' })
    }

    ctx.storeOwnerStore = store

    return next()
  }
}

declare module '@adonisjs/core/http' {
  interface HttpContext {
    storeOwnerStore?: Store
  }
}
