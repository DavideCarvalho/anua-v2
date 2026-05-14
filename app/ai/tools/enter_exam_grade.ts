import { z } from 'zod'
import { defineActionTool } from '../tool.js'
import { toolRegistry, type ToolContext } from '../tool_registry.js'

export const enterExamGradeInputSchema = z.object({
  examId: z.string().uuid().describe('UUID da prova'),
  studentId: z.string().uuid().describe('UUID do aluno'),
  score: z
    .number()
    .min(0)
    .max(100)
    .nullable()
    .describe(
      'Nota tirada pelo aluno. Use null quando o aluno faltou na prova (passe absent=true também).'
    ),
  absent: z
    .boolean()
    .optional()
    .describe(
      'true quando o aluno faltou à prova. Default false. Score deve ser null se absent=true.'
    ),
  feedback: z.string().max(2000).optional().describe('Comentário opcional pro aluno/responsável'),
})

export type EnterExamGradeInput = z.infer<typeof enterExamGradeInputSchema>

const DESCRIPTION = `Lança a nota de UM aluno numa prova. Substitui qualquer nota existente.

Parâmetros:
- examId (UUID): id da prova. Use getExams pra descobrir o id da prova da turma.
- studentId (UUID): id do aluno. Use getStudentsInClass.
- score (number 0-100, ou null): nota tirada. null quando o aluno faltou.
- absent (boolean, opcional): true se o aluno faltou (score deve ser null).
- feedback (texto, opcional): comentário do professor.

Comportamento:
- É uma tool de ESCRITA — aparece card de aprovação inline. Mostre a nota e o nome do aluno antes de chamar (confirme com o professor pra evitar engano).
- Lança UMA prova de UM aluno por vez. Pra batch (a turma inteira), chame a tool em sequência — o card de aprovação aparece pra cada uma.
- Só o professor que ministra essa prova (TeacherHasClass.teacherId = você) pode lançar. Coordenador NÃO usa essa tool.
- Substitui nota existente sem aviso. Se já havia nota e o professor quer corrigir, confirme antes de chamar (ex: "Vou trocar a nota antiga 6.5 pela nova 7.0, confirma?").`

export function createEnterExamGrade(_ctx: ToolContext) {
  return defineActionTool({
    name: 'enterExamGrade',
    description: DESCRIPTION,
    parameters: enterExamGradeInputSchema,
  })
}

toolRegistry.register('professor', createEnterExamGrade)
