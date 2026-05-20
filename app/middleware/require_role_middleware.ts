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

    // Resolução de qual role validar quando há impersonação ativa:
    // - Rotas admin (allowlist inclui SUPER_ADMIN/ADMIN): usa a role do admin
    //   ORIGINAL. Sem isso, admin impersonando perderia acesso ao /admin.
    // - Demais rotas: usa a role do usuário IMPERSONADO (effectiveUser). Sem
    //   isso, admin impersonando responsavel seria rejeitado em /responsavel
    //   porque auth.user.role continua sendo "SUPER_ADMIN".
    // Sem impersonação, os dois caminhos colapsam pra auth.user.role.
    let roleName: string | undefined = user.role?.name

    if (impersonation?.isImpersonating && impersonation.originalUser) {
      const isAdminRoute = roles.some((r) => ['SUPER_ADMIN', 'ADMIN'].includes(r))
      if (isAdminRoute) {
        roleName = impersonation.originalUser.role ?? undefined
      } else if (ctx.effectiveUser) {
        if (!ctx.effectiveUser.$preloaded.role) {
          await ctx.effectiveUser.load('role')
        }
        roleName = ctx.effectiveUser.role?.name
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
