import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class EscolaTeacherScopeMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { auth, request, response } = ctx
    const user = ctx.effectiveUser ?? auth.user

    if (!user) {
      return next()
    }

    if (user.roleId && !user.$preloaded.role) {
      await user.load('role')
    }

    if (user.role?.name !== 'SCHOOL_TEACHER') {
      return next()
    }

    const pathname = request.url().split('?')[0]

    const allowedPrefixes = ['/escola/pedagogico', '/escola/eventos', '/escola/notificacoes']
    const isPrefixAllowed = allowedPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )

    const isAllowedPeriodoPath =
      /^\/escola\/periodos-letivos\/[^/]+\/cursos\/[^/]+\/(visao-geral|turmas)$/.test(pathname) ||
      /^\/escola\/periodos-letivos\/[^/]+\/cursos\/[^/]+\/turmas\/[^/]+\/(atividades|provas|presencas|notas|situacao)$/.test(
        pathname
      )

    if (pathname === '/escola' || isPrefixAllowed || isAllowedPeriodoPath) {
      return next()
    }

    if (request.accepts(['html', 'json']) === 'html') {
      return response.redirect('/escola/pedagogico/turmas')
    }

    return response.forbidden({ message: 'Acesso permitido apenas para páginas pedagógicas' })
  }
}
