import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

/**
 * Controller para verificar status de impersonation
 * Retorna informações sobre quem está sendo personificado
 */
export default class GetImpersonationStatusController {
  async handle({ auth, response, session }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Não autenticado' })
    }

    // Verificar se está personificando usando a sessão do AdonisJS
    const impersonatingUserId = session.get('impersonatingUserId')

    if (!impersonatingUserId) {
      return {
        isImpersonating: false,
        impersonatingUser: null,
      }
    }

    // Buscar dados do usuário sendo personificado
    const impersonatingUser = await User.find(impersonatingUserId)

    if (!impersonatingUser) {
      // Limpar sessão inválida
      session.forget('impersonatingUserId')
      session.forget('originalUserId')

      return {
        isImpersonating: false,
        impersonatingUser: null,
      }
    }

    await impersonatingUser.load('role')
    await impersonatingUser.load('userHasSchools', (query) => {
      query.preload('school')
    })

    // Pegar a primeira escola do usuário via UserHasSchool
    const firstSchool = impersonatingUser.userHasSchools?.[0]?.school

    return {
      isImpersonating: true,
      impersonatingUser: {
        id: impersonatingUser.id,
        name: impersonatingUser.name,
        email: impersonatingUser.email,
        role: impersonatingUser.role?.name,
        school: firstSchool
          ? {
              id: firstSchool.id,
              name: firstSchool.name,
            }
          : null,
      },
    }
  }
}
