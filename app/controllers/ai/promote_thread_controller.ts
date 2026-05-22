import type { HttpContext } from '@adonisjs/core/http'
import AiThread from '#models/ai_thread'
import AiThreadTransformer from '#transformers/ai_thread_transformer'

/**
 * Promove uma thread `surface='sheet'` para `surface='page'`, fazendo com
 * que ela passe a aparecer na lista do chat fullscreen (`/escola/ia`).
 * Idempotente: chamar com uma thread já 'page' retorna sucesso sem mudança.
 */
export default class PromoteThreadController {
  async handle({ params, response, auth, effectiveUser, serialize }: HttpContext) {
    const user = effectiveUser ?? auth.user!

    const thread = await AiThread.query().where('id', params.id).where('userId', user.id).first()

    if (!thread) {
      return response.notFound({ message: 'Thread não encontrada' })
    }

    if (thread.surface !== 'page') {
      thread.surface = 'page'
      await thread.save()
    }

    return serialize(AiThreadTransformer.transform(thread))
  }
}
