import { z } from 'zod'

/**
 * Schema da ação CANÔNICA `createAssignment`. NÃO é uma tool exposta pra IA
 * — ela usa prepareCreateAssignment (canvas opener) pra abrir o painel. Esse
 * schema é o contrato do dispatcher e do endpoint /api/v1/ai/canvas/submit:
 * quando o professor clica em "Criar atividade", o frontend envia os campos
 * deste schema, o validador re-checa, e o dispatcher cria o Assignment.
 *
 * Aqui os obrigatórios são REALMENTE obrigatórios (diferente do schema do
 * canvas, onde tudo é opcional porque a IA preenche incremental).
 */
export const createAssignmentInputSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().max(5000).nullable().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dueDate deve estar em YYYY-MM-DD'),
  maxGrade: z.number().min(0).max(100).nullable().optional(),
  classId: z.string().uuid(),
  // Quando o professor dá mais de uma matéria pra mesma turma, precisa
  // especificar. Quando dá só uma, pode omitir e o dispatcher resolve sozinho.
  subjectId: z.string().uuid().nullable().optional(),
})

export type CreateAssignmentInput = z.infer<typeof createAssignmentInputSchema>
