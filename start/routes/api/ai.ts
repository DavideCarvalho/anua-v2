import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

export function registerAiApiRoutes() {
  router
    .group(() => {
      router.post('/chat', [controllers.ai.Chat]).as('ai.chat')
      router.get('/chat/:threadId/stream', [controllers.ai.ResumeChatStream]).as('ai.chat.resume')
      router.post('/chat/:threadId/cancel', [controllers.ai.CancelChatStream]).as('ai.chat.cancel')
      router.get('/threads', [controllers.ai.ListThreads]).as('ai.threads.list')
      router.get('/threads/:id', [controllers.ai.ShowThread]).as('ai.threads.show')
      router.delete('/threads/:id', [controllers.ai.DeleteThread]).as('ai.threads.delete')
      // Aprovação/rejeição de action tools acontece no próprio chat. O
      // :toolCallId aqui é o identificador do Vercel AI SDK (não a PK do
      // row de auditoria), porque é isso que o cliente tem na UIMessage.
      router
        .post('/tool-calls/:toolCallId/decide', [controllers.ai.DecideToolCall])
        .as('ai.tool_calls.decide')
      // Resolve UUIDs em nomes pros cards de aprovação. Filtra por scope do user.
      router.post('/resolve-names', [controllers.ai.ResolveNames]).as('ai.resolve_names')
      // Submit do canvas: usuário preencheu o painel flutuante e clicou
      // em "Criar". Despacha a ação real e grava auditoria.
      router.post('/canvas/submit', [controllers.ai.SubmitCanvas]).as('ai.canvas.submit')
    })
    .prefix('/ai')
    .use([middleware.auth(), middleware.impersonation()])
}
