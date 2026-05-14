import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerAiApiRoutes() {
  router
    .group(() => {
      router.post('/chat', [controllers.ai.Chat]).as('ai.chat')
      router
        .get('/chat/:threadId/stream', [controllers.ai.ResumeChatStream])
        .as('ai.chat.resume')
      router
        .post('/chat/:threadId/cancel', [controllers.ai.CancelChatStream])
        .as('ai.chat.cancel')
      router.get('/threads', [controllers.ai.ListThreads]).as('ai.threads.list')
      router.get('/threads/:id', [controllers.ai.ShowThread]).as('ai.threads.show')
      router.delete('/threads/:id', [controllers.ai.DeleteThread]).as('ai.threads.delete')
    })
    .prefix('/ai')
    .use([middleware.auth(), middleware.impersonation()])
}
