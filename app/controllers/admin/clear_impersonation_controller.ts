import type { HttpContext } from '@adonisjs/core/http'
import AppException from '#exceptions/app_exception'

/**
 * Controller para desativar impersonation
 * Retorna o admin ao seu próprio contexto
 */
export default class ClearImpersonationController {
  async handle({ auth, session }: HttpContext) {
    const user = auth.user
    if (!user) {
      throw AppException.invalidCredentials()
    }

    // Verificar se está personificando
    const impersonatingUserId = session.get('impersonatingUserId')
    if (!impersonatingUserId) {
      throw AppException.badRequest('Você não está personificando nenhum usuário')
    }

    // Limpar dados de impersonation da sessão
    session.forget('impersonatingUserId')
    session.forget('originalUserId')

    console.log(`[IMPERSONATION] Admin ${user.id} (${user.name}) stopped impersonating`)

    return {
      success: true,
      message: 'Personificação desativada. Você voltou ao seu contexto original.',
    }
  }
}
