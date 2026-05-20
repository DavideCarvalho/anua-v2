import { z } from 'zod'
import { defineTool } from '../tool.js'
import { toolRegistry, type ToolContext } from '../tool_registry.js'

// Schema do FORM. Todos nullable/optional porque a IA preenche incrementalmente
// — se o user só falou "lança nota 9 pra Anna", a IA chama com studentId+score
// e o resto fica null. O painel mostra os campos como estão; o professor
// completa/ajusta o que faltar antes de clicar em "Lançar nota".
//
// Reusado pelo handler real (`enterExamGrade` no action_dispatcher) no submit
// do canvas — lá os obrigatórios são validados com schema mais rígido.
export const enterExamGradeFormSchema = z.object({
  examId: z.string().uuid().nullable().optional(),
  studentId: z.string().uuid().nullable().optional(),
  score: z.number().min(0).max(100).nullable().optional(),
  absent: z.boolean().nullable().optional(),
  feedback: z.string().max(2000).nullable().optional(),
})

export type EnterExamGradeForm = z.infer<typeof enterExamGradeFormSchema>

const DESCRIPTION = `Abre (ou atualiza) o painel flutuante de lançamento de nota na tela do professor. ESTA TOOL NÃO ESCREVE NADA NO BANCO — só preenche o form. O professor revisa, ajusta o que quiser (nota, comentário) e clica em "Lançar nota" pra disparar a ação real.

Chame essa tool sempre que o usuário pedir pra lançar uma nota. Pode chamar quantas vezes quiser pra ajustar campos — cada call substitui o estado do form. Campos omitidos viram null (não preserva o anterior). Então quando o usuário disser "muda só o score pra 8,5", chame com TODOS os campos atuais + score=8,5.

Parâmetros:
- examId (UUID, obrigatório no fim): id da prova. Use getExams pra descobrir.
- studentId (UUID, obrigatório no fim): id do aluno. Use getStudentsInClass.
- score (0-100, obrigatório se absent != true): nota tirada.
- absent (boolean, opcional): true se o aluno faltou. Score deve ser null/omitido.
- feedback (texto, opcional): comentário do professor.

Comportamento:
- Cada chamada substitui o estado do form no painel.
- O painel já está aberto pro usuário desde a primeira chamada — não chame essa tool e fique esperando confirmação por texto, fala em texto curto "abri o formulário, dá uma olhada e clica em lançar quando estiver ok".
- Só o professor que ministra essa prova pode lançar. Coordenador NÃO usa essa tool.
- Substitui nota existente sem aviso. Se já havia nota e o professor quer corrigir, mencione no chat antes de abrir o painel.`

export function createPrepareEnterExamGrade(_ctx: ToolContext) {
  return defineTool({
    name: 'prepareEnterExamGrade',
    description: DESCRIPTION,
    parameters: enterExamGradeFormSchema,
    execute: async (form: EnterExamGradeForm) => {
      // Não toca banco. Só ecoa o form de volta pra o frontend renderizar
      // no painel. record_tool_calls trata como kind='canvas' e marca como
      // auto_executed na auditoria.
      return { kind: 'canvas-update', form }
    },
  })
}

toolRegistry.register('professor', createPrepareEnterExamGrade)
