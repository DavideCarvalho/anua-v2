import { z } from 'zod'
import { defineActionTool } from '../tool.js'
import { toolRegistry, type ToolContext } from '../tool_registry.js'

export const registerAttendanceInputSchema = z.object({
  classId: z.string().uuid().describe('UUID da turma. Use getMyClasses pra descobrir.'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date deve ser YYYY-MM-DD')
    .describe('Dia da aula (YYYY-MM-DD). Resolva sempre data absoluta, nunca "hoje"/"ontem".'),
  absentStudentIds: z
    .array(z.string().uuid())
    .describe('Lista dos alunos que faltaram. Quem NÃO está nessa lista é marcado como presente.'),
  lateStudentIds: z
    .array(z.string().uuid())
    .optional()
    .describe(
      'Lista dos alunos que chegaram atrasados (opcional). Sobrescreve "presente" pra eles.'
    ),
})

export type RegisterAttendanceInput = z.infer<typeof registerAttendanceInputSchema>

const DESCRIPTION = `Registra a presença da turma inteira em UMA aula. Marca cada aluno como PRESENT (default), ABSENT (lista absentStudentIds) ou LATE (lista lateStudentIds).

Parâmetros:
- classId (UUID): a turma. Use getMyClasses.
- date (YYYY-MM-DD): a data da aula. Resolva sempre absoluta a partir da data atual.
- absentStudentIds: lista de UUIDs dos faltantes. Pode ser vazia (ninguém faltou).
- lateStudentIds (opcional): lista de UUIDs dos atrasados.

Comportamento:
- O dispatcher escolhe automaticamente qual aula da sua grade (você pode dar mais de uma aula nessa turma no dia). Pega a primeira ainda não registrada.
- Se TODAS as suas aulas dessa turma nesse dia já estão registradas, retorna erro pedindo pra usar a página de presença pra corrigir.
- Se o professor não dá aula nessa turma (TeacherHasClass.teacherId ≠ você), retorna acesso negado.
- Tool de ESCRITA — card de aprovação com a contagem (X presentes, Y faltas, Z atrasados) aparece antes de executar.

UX recomendado: SEMPRE chame getStudentsInClass primeiro pra mostrar a lista pro professor, e confirme "Marquei [Aluno A] e [Aluno B] como faltas — ninguém mais faltou, correto?" antes de chamar a tool. Evita engano em batch.`

export function createRegisterAttendance(_ctx: ToolContext) {
  return defineActionTool({
    name: 'registerAttendance',
    description: DESCRIPTION,
    parameters: registerAttendanceInputSchema,
  })
}

toolRegistry.register('professor', createRegisterAttendance)
