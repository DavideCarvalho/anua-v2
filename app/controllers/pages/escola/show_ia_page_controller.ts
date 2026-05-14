import type { HttpContext } from '@adonisjs/core/http'

export default class ShowIaPageController {
  async handle({ inertia, params }: HttpContext) {
    const threadId = typeof params.threadId === 'string' ? params.threadId : null
    return inertia.render('escola/ia', { initialThreadId: threadId })
  }
}
