import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '#models/user'

/**
 * Middleware de Impersonation
 *
 * Permite que SUPER_ADMINs e ADMINs visualizem o sistema como outro usuário.
 * Quando impersonation está ativo:
 * - `ctx.impersonation.originalUser`: usuário admin original
 * - `ctx.impersonation.isImpersonating`: true
 * - `ctx.impersonation.impersonatedUser`: usuário sendo personificado
 * - `ctx.effectiveUser`: retorna o usuário impersonado ou o usuário real
 *
 * IMPORTANTE: Este middleware deve vir APÓS o middleware de autenticação
 */
export default class ImpersonationMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { auth, session } = ctx

    // Se não está autenticado, pular
    if (!auth.user) {
      return next()
    }

    // Verificar status de impersonation na sessão do AdonisJS
    const impersonatingUserId = session.get('impersonatingUserId')

    if (!impersonatingUserId) {
      // Sem impersonation ativo
      const impersonationCtx = ctx as HttpContext & { impersonation: ImpersonationContext; effectiveUser: User }
      impersonationCtx.impersonation = {
        isImpersonating: false,
        originalUser: null,
        impersonatedUser: null,
      }
      impersonationCtx.effectiveUser = auth.user
      return next()
    }

    // Verificar se usuário original é SUPER_ADMIN ou ADMIN
    const originalUser = auth.user
    await originalUser.load('role')

    const canImpersonate = ['SUPER_ADMIN', 'ADMIN'].includes(originalUser.role?.name || '')
    if (!canImpersonate) {
      // Não deveria acontecer, mas por segurança limpar a sessão
      session.forget('impersonatingUserId')
      session.forget('originalUserId')
      const impersonationCtx = ctx as HttpContext & { impersonation: ImpersonationContext; effectiveUser: User }
      impersonationCtx.impersonation = {
        isImpersonating: false,
        originalUser: null,
        impersonatedUser: null,
      }
      impersonationCtx.effectiveUser = auth.user
      return next()
    }

    // Buscar usuário sendo personificado
    const impersonatedUser = await User.find(impersonatingUserId)

    if (!impersonatedUser) {
      // Usuário não existe mais, limpar sessão
      session.forget('impersonatingUserId')
      session.forget('originalUserId')
      const impersonationCtx = ctx as HttpContext & { impersonation: ImpersonationContext; effectiveUser: User }
      impersonationCtx.impersonation = {
        isImpersonating: false,
        originalUser: null,
        impersonatedUser: null,
      }
      impersonationCtx.effectiveUser = auth.user
      return next()
    }

    // Carregar relacionamentos necessários
    await impersonatedUser.load('role')
    await impersonatedUser.load('school')

    // Configurar contexto de impersonation
    const impersonationCtx = ctx as HttpContext & { impersonation: ImpersonationContext; effectiveUser: User }
    impersonationCtx.impersonation = {
      isImpersonating: true,
      originalUser: {
        id: originalUser.id,
        name: originalUser.name,
        email: originalUser.email,
        role: originalUser.role?.name,
      },
      impersonatedUser: impersonatedUser,
    }

    // effectiveUser é o usuário que o sistema deve "ver"
    impersonationCtx.effectiveUser = impersonatedUser

    console.log(
      `[IMPERSONATION] Request from ${originalUser.name} as ${impersonatedUser.name}: ${ctx.request.method()} ${ctx.request.url()}`
    )

    return next()
  }
}

interface ImpersonationContext {
  isImpersonating: boolean
  originalUser: {
    id: string
    name: string
    email: string | null
    role: string | undefined
  } | null
  impersonatedUser: User | null
}

/**
 * Declaração de tipo para o contexto com impersonation
 */
declare module '@adonisjs/core/http' {
  interface HttpContext {
    impersonation?: ImpersonationContext
    effectiveUser?: User
  }
}
