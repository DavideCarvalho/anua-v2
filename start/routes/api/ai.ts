import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const Chat = () => import('#controllers/ai/chat_controller')
const ListThreads = () => import('#controllers/ai/list_threads_controller')
const ShowThread = () => import('#controllers/ai/show_thread_controller')
const DeleteThread = () => import('#controllers/ai/delete_thread_controller')

export function registerAiApiRoutes() {
  router
    .group(() => {
      router.post('/chat', [Chat]).as('ai.chat')
      router.get('/threads', [ListThreads]).as('ai.threads.list')
      router.get('/threads/:id', [ShowThread]).as('ai.threads.show')
      router.delete('/threads/:id', [DeleteThread]).as('ai.threads.delete')
    })
    .prefix('/ai')
    .use([middleware.auth(), middleware.impersonation()])
}
