import { z } from 'zod'
import { defineActionTool } from '../tool.js'
import { toolRegistry, type ToolContext } from '../tool_registry.js'

export const justifyAbsenceInputSchema = z.object({
  studentId: z.string().uuid().describe('UUID do aluno'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date deve ser YYYY-MM-DD')
    .describe('Dia da falta (YYYY-MM-DD)'),
  reason: z
    .string()
    .min(3)
    .max(500)
    .describe('Motivo da justificativa (consulta médica, viagem em família, etc)'),
})

export type JustifyAbsenceInput = z.infer<typeof justifyAbsenceInputSchema>

const DESCRIPTION = `Justifica a(s) falta(s) de um aluno em uma data específica. Marca a presença como EXCUSED e grava o motivo.

Parâmetros:
- studentId (UUID): id do aluno. Use getMyChildren primeiro pra descobrir.
- date (YYYY-MM-DD): dia da falta. Confirme com o usuário se ele falar "ontem", "segunda passada", etc — passe data absoluta, nunca relativa.
- reason: motivo. Ex: "Consulta médica", "Viagem em família", "Atestado anexado por e-mail".

Comportamento:
- Aplica a TODAS as faltas (status='ABSENT') do aluno no dia. Se o aluno teve 4 aulas e faltou em 3, justifica as 3 com o mesmo motivo. Se já estava EXCUSED, fica como estava (mantém o motivo anterior).
- Se não havia nenhuma falta no dia, retorna erro "Sem faltas pra justificar nessa data".
- Só responsável com isPedagogical=true pode justificar. Responsável só-financeiro recebe negação.`

export function createJustifyAbsence(_ctx: ToolContext) {
  return defineActionTool({
    name: 'justifyAbsence',
    description: DESCRIPTION,
    parameters: justifyAbsenceInputSchema,
  })
}

toolRegistry.register('responsavel', createJustifyAbsence)
