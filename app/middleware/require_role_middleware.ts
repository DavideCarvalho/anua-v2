import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RequireRoleMiddleware {
  async handle({ auth, request, response }: HttpContext, next: NextFn, roles: string[]) {
    const user = auth.user

    if (!user) {
      return response.unauthorized({ message: 'Não autenticado' })
    }

    if (!user.$preloaded.role) {
      await user.load('role')
    }

    const roleName = user.role?.name
    const allowedRoles = roles ?? []

    if (!roleName || (allowedRoles.length > 0 && !allowedRoles.includes(roleName))) {
      if (request.accepts(['html', 'json']) === 'html') {
        return response.redirect('/dashboard')
      }

      return response.forbidden({ message: 'Acesso negado' })
    }

    return next()
  }
}
