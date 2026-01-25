import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RequireRoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, roles: string[]) {
    const { auth, request, response, impersonation } = ctx
    const user = auth.user

    if (!user) {
      return response.unauthorized({ message: 'Não autenticado' })
    }

    if (!user.$preloaded.role) {
      await user.load('role')
    }

    // Se está impersonando, verificar a role do usuário original para rotas admin
    // Isso permite que o admin continue acessando /admin enquanto impersona
    let roleName: string | undefined = user.role?.name

    if (impersonation?.isImpersonating && impersonation.originalUser) {
      // Para rotas admin, usar a role do usuário original
      const isAdminRoute = roles.some((r) => ['SUPER_ADMIN', 'ADMIN'].includes(r))
      if (isAdminRoute) {
        roleName = impersonation.originalUser.role ?? undefined
      }
    }

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
