import type { HttpContext } from '@adonisjs/core/http'

/**
 * Controller para desativar impersonation
 * Retorna o admin ao seu próprio contexto
 */
export default class ClearImpersonationController {
  async handle({ auth, response, session }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Não autenticado' })
    }

    // Verificar se está personificando
    const impersonatingUserId = session.get('impersonatingUserId')
    if (!impersonatingUserId) {
      return response.badRequest({ message: 'Você não está personificando nenhum usuário' })
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
