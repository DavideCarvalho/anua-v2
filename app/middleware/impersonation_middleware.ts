import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '#models/user'
import UserHasSchool from '#models/user_has_school'

/**
 * Middleware de Impersonation
 *
 * Permite que SUPER_ADMINs e ADMINs visualizem o sistema como outro usuário.
 * Quando impersonation está ativo:
 * - `ctx.impersonation.originalUser`: usuário admin original
 * - `ctx.impersonation.isImpersonating`: true
 * - `ctx.impersonation.impersonatedUser`: usuário sendo personificado
 * - `ctx.effectiveUser`: retorna o usuário impersonado ou o usuário real
 * - `ctx.userSchools`: array de escolas que o usuário tem acesso
 * - `ctx.selectedSchoolIds`: array de IDs das escolas selecionadas (por padrão, todas)
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
      const extendedCtx = ctx as ExtendedHttpContext
      extendedCtx.impersonation = {
        isImpersonating: false,
        originalUser: null,
        impersonatedUser: null,
      }
      extendedCtx.effectiveUser = auth.user

      // Carregar escolas do usuário
      await this.loadUserSchools(extendedCtx, auth.user, session)

      return next()
    }

    // Verificar se usuário original é SUPER_ADMIN ou ADMIN
    const originalUser = auth.user
    if (originalUser.roleId) {
      await originalUser.load('role')
    }

    const canImpersonate = ['SUPER_ADMIN', 'ADMIN'].includes(originalUser.role?.name || '')
    if (!canImpersonate) {
      // Não deveria acontecer, mas por segurança limpar a sessão
      session.forget('impersonatingUserId')
      session.forget('originalUserId')
      const extendedCtx = ctx as ExtendedHttpContext
      extendedCtx.impersonation = {
        isImpersonating: false,
        originalUser: null,
        impersonatedUser: null,
      }
      extendedCtx.effectiveUser = auth.user
      await this.loadUserSchools(extendedCtx, auth.user, session)
      return next()
    }

    // Buscar usuário sendo personificado
    const impersonatedUser = await User.find(impersonatingUserId)

    if (!impersonatedUser) {
      // Usuário não existe mais, limpar sessão
      session.forget('impersonatingUserId')
      session.forget('originalUserId')
      const extendedCtx = ctx as ExtendedHttpContext
      extendedCtx.impersonation = {
        isImpersonating: false,
        originalUser: null,
        impersonatedUser: null,
      }
      extendedCtx.effectiveUser = auth.user
      await this.loadUserSchools(extendedCtx, auth.user, session)
      return next()
    }

    // Carregar relacionamentos necessários
    if (impersonatedUser.roleId) {
      await impersonatedUser.load('role')
    }
    if (impersonatedUser.schoolId) {
      await impersonatedUser.load('school')
    }

    // Configurar contexto de impersonation
    const extendedCtx = ctx as ExtendedHttpContext
    extendedCtx.impersonation = {
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
    extendedCtx.effectiveUser = impersonatedUser

    // Carregar escolas do usuário impersonado
    await this.loadUserSchools(extendedCtx, impersonatedUser, session)

    console.log(
      `[IMPERSONATION] Request from ${originalUser.name} as ${impersonatedUser.name}: ${ctx.request.method()} ${ctx.request.url()}`
    )

    return next()
  }

  /**
   * Carrega as escolas do usuário (via schoolId direto ou UserHasSchool)
   * e define as escolas selecionadas (da sessão ou todas por padrão)
   */
  private async loadUserSchools(
    ctx: ExtendedHttpContext,
    user: User,
    session: HttpContext['session']
  ) {
    const schools: UserSchool[] = []

    // 1. Verificar schoolId direto no usuário
    if (user.schoolId) {
      if (!user.$preloaded.school) {
        await user.load('school')
      }
      if (user.school) {
        schools.push({
          id: user.school.id,
          name: user.school.name,
          slug: user.school.slug,
          isDefault: true,
        })
      }
    }

    // 2. Buscar escolas via UserHasSchool
    const userSchools = await UserHasSchool.query().where('userId', user.id).preload('school')

    for (const us of userSchools) {
      if (us.school && !schools.find((s) => s.id === us.school.id)) {
        schools.push({
          id: us.school.id,
          name: us.school.name,
          slug: us.school.slug,
          isDefault: us.isDefault,
        })
      }
    }

    ctx.userSchools = schools

    // Obter escolas selecionadas da sessão ou usar todas as disponíveis
    const sessionSelectedIds = session.get('selectedSchoolIds') as string[] | undefined
    if (sessionSelectedIds && sessionSelectedIds.length > 0) {
      // Filtrar para garantir que só inclui escolas que o usuário tem acesso
      const filteredSelectedIds = sessionSelectedIds.filter((id) =>
        schools.some((s) => s.id === id)
      )

      // Se nenhuma seleção da sessão for válida para o usuário efetivo,
      // voltar para todas as escolas disponíveis e atualizar a sessão.
      if (filteredSelectedIds.length > 0) {
        ctx.selectedSchoolIds = filteredSelectedIds
      } else {
        ctx.selectedSchoolIds = schools.map((s) => s.id)
        session.put('selectedSchoolIds', ctx.selectedSchoolIds)
      }
    } else {
      // Por padrão, seleciona todas as escolas do usuário
      ctx.selectedSchoolIds = schools.map((s) => s.id)
    }
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

interface UserSchool {
  id: string
  name: string
  slug: string
  isDefault: boolean
}

type ExtendedHttpContext = HttpContext & {
  impersonation: ImpersonationContext
  effectiveUser: User
  userSchools: UserSchool[]
  selectedSchoolIds: string[]
}

/**
 * Declaração de tipo para o contexto com impersonation
 */
declare module '@adonisjs/core/http' {
  interface HttpContext {
    impersonation?: ImpersonationContext
    effectiveUser?: User
    /** Escolas que o usuário tem acesso (via schoolId direto ou UserHasSchool) */
    userSchools?: UserSchool[]
    /** IDs das escolas atualmente selecionadas pelo usuário */
    selectedSchoolIds?: string[]
  }
}
