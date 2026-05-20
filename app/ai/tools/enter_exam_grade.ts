import { z } from 'zod'

/**
 * Schema da ação CANÔNICA `enterExamGrade`. NÃO é uma tool exposta pra IA —
 * ela usa prepareEnterExamGrade (canvas opener) pra abrir o painel. Esse
 * schema é o contrato do dispatcher e do endpoint /api/v1/ai/canvas/submit:
 * quando o professor clica em "Lançar nota", o frontend envia os campos
 * deste schema, o validador re-checa, e o dispatcher persiste a nota.
 *
 * Aqui os obrigatórios são REALMENTE obrigatórios (diferente do schema do
 * canvas, onde tudo é opcional porque a IA preenche incremental).
 */
export const enterExamGradeInputSchema = z.object({
  examId: z.string().uuid(),
  studentId: z.string().uuid(),
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
