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

export const decideAiToolCallValidator = vine.compile(
  vine.object({
    decision: vine.string().in(['approve', 'reject']),
    reason: vine.string().optional(),
  })
)

// Resolver de nomes pra cards de aprovação. Cada lista tem teto pra evitar
// fan-out absurdo (50 ids por kind é mais que suficiente pro UX).
export const resolveNamesValidator = vine.compile(
  vine.object({
    studentIds: vine.array(vine.string().uuid()).maxLength(50).optional(),
    examIds: vine.array(vine.string().uuid()).maxLength(50).optional(),
    classIds: vine.array(vine.string().uuid()).maxLength(50).optional(),
  })
)

// Submit do canvas: validamos a casca (threadId + toolName + fields é
// objeto). O conteúdo de `fields` é validado de novo no dispatcher com o
// zod schema da action específica (source of truth). Aqui usamos
// vine.any().nullable().optional() pra aceitar todo shape — vine.any()
// puro rejeita null como "não definido".
export const submitCanvasValidator = vine.compile(
  vine.object({
    threadId: vine.string().uuid(),
    toolName: vine.string().minLength(1).maxLength(100),
    fields: vine.record(vine.any().nullable().optional()),
  })
)
