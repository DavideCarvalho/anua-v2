import { z } from 'zod'
import { defineActionTool } from '../tool.js'
import { toolRegistry, type ToolContext } from '../tool_registry.js'

export const sendCommunicationInputSchema = z.object({
  title: z.string().min(3).max(120).describe('Título curto do comunicado'),
  body: z
    .string()
    .min(10)
    .max(4000)
    .describe('Corpo do comunicado em texto. Aceita Markdown simples (negrito, listas)'),
  audience: z
    .object({
      scopeType: z
        .enum(['SCHOOL', 'CLASS', 'LEVEL'])
        .describe('Público-alvo: SCHOOL = todos da escola, CLASS = uma turma, LEVEL = um nível'),
      scopeId: z
        .string()
        .optional()
        .describe(
          'UUID da turma ou nível. Obrigatório quando scopeType=CLASS ou LEVEL. Omita pra SCHOOL.'
        ),
    })
    .describe('Quem vai receber o comunicado'),
  requiresAcknowledgement: z
    .boolean()
    .optional()
    .describe(
      'Se true, responsáveis precisam confirmar leitura. Use pra avisos importantes (mudança de data, evento obrigatório, etc).'
    ),
})

export type SendCommunicationInput = z.infer<typeof sendCommunicationInputSchema>

const DESCRIPTION = `Envia um comunicado oficial da escola para responsáveis. Cria um SchoolAnnouncement em PUBLISHED e endereça aos destinatários conforme o público escolhido.

Use quando o usuário pedir explicitamente pra ENVIAR/MANDAR/COMUNICAR algo aos pais — não use só pra explicar ou descrever um comunicado em texto.

Parâmetros:
- title: título curto (3-120 chars)
- body: corpo do texto (10-4000 chars). Markdown simples ok.
- audience.scopeType: 'SCHOOL' (escola toda), 'CLASS' (uma turma — passe o classId em scopeId), 'LEVEL' (um nível — passe o levelId)
- requiresAcknowledgement: opcional, true marca como "exige confirmação de leitura"

ATENÇÃO: esta ferramenta NÃO executa imediatamente. Ela cria uma solicitação pendente que precisa ser aprovada manualmente por um admin antes do comunicado ser de fato disparado. Quando você chamar esta tool, avise o usuário no texto que o comunicado foi REGISTRADO pra aprovação e está aguardando confirmação na área de auditoria de IA.`

export function createSendCommunication(_ctx: ToolContext) {
  return defineActionTool({
    name: 'sendCommunication',
    description: DESCRIPTION,
    parameters: sendCommunicationInputSchema,
  })
}

toolRegistry.register('gestor', createSendCommunication)
toolRegistry.register('comunicador', createSendCommunication)
