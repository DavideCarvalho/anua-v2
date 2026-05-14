import type { HttpContext } from '@adonisjs/core/http'
import { personaFromRole } from '#ai/chat_role'

export default class ShowIaPageController {
  async handle({ inertia, params, auth, effectiveUser }: HttpContext) {
    const threadId = typeof params.threadId === 'string' ? params.threadId : null
    const user = effectiveUser ?? auth.user
    if (user && !user.$preloaded.role) {
      await user.load('role')
    }
    const persona = personaFromRole(user?.role?.name)
    return inertia.render('escola/ia', { initialThreadId: threadId, persona })
  }
}
