import vine from '@vinejs/vine'

// persona aqui é só uma sugestão. O chat_controller deriva a persona efetiva
// da role do usuário e só honra esse override se ele for permitido pra aquele
// papel (atualmente: gestor pode alternar pra "comunicador"). Qualquer outro
// valor é silenciosamente ignorado, sem retornar erro de validação.
export const chatValidator = vine.compile(
  vine.object({
    threadId: vine.string().uuid(),
    persona: vine
      .string()
      .in(['gestor', 'comunicador', 'coordenador', 'professor', 'responsavel'])
      .optional(),
  })
)
