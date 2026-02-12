import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import AppException from '#exceptions/app_exception'

/**
 * Controller para ativar impersonation
 * Permite que SUPER_ADMIN personifique outros usuários
 */
export default class SetImpersonationController {
  async handle({ auth, request, session }: HttpContext) {
    const user = auth.user
    if (!user) {
      throw AppException.invalidCredentials()
    }

    await user.load('role')
    const roleName = user.role?.name

    // Apenas SUPER_ADMIN pode personificar
    if (roleName !== 'SUPER_ADMIN') {
      throw AppException.forbidden('Apenas SUPER_ADMIN pode personificar usuários')
    }

    const { userId } = request.only(['userId'])

    if (!userId) {
      throw AppException.badRequest('userId é obrigatório')
    }

    // Verificar se usuário alvo existe
    const targetUser = await User.find(userId)
    if (!targetUser) {
      throw AppException.notFound('Usuário não encontrado')
    }

    // Não permitir auto-personificação
    if (userId === user.id) {
      throw AppException.badRequest('Não é possível personificar a si mesmo')
    }

    // Armazenar impersonation na sessão do AdonisJS
    session.put('impersonatingUserId', userId)
    session.put('originalUserId', user.id)

    await targetUser.load('role')
    await targetUser.load('userHasSchools', (query) => {
      query.preload('school')
    })

    // Pegar a primeira escola do usuário via UserHasSchool
    const firstSchool = targetUser.userHasSchools?.[0]?.school

    console.log(
      `[IMPERSONATION] Admin ${user.id} (${user.name}) now impersonating ${targetUser.id} (${targetUser.name})`
    )

    return {
      success: true,
      message: `Agora você está visualizando como ${targetUser.name}`,
      impersonating: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role?.name,
        school: firstSchool ? { id: firstSchool.id, name: firstSchool.name } : null,
      },
    }
  }
}
