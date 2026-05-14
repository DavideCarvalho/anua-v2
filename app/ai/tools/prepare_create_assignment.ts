import { z } from 'zod'
import { defineTool } from '../tool.js'
import { toolRegistry, type ToolContext } from '../tool_registry.js'

// Schema do FORM. Campos opcionais aqui porque a IA preenche incrementalmente
// — quando o user só falou "atividade de matemática pra 6A", a IA chama com
// só name e classId. O resto fica null e o usuário preenche no painel.
//
// Reusado pelo handler real (`create_assignment` no action_dispatcher) ao
// submit do canvas: lá o handler valida que os obrigatórios estão preenchidos.
export const createAssignmentFormSchema = z.object({
  name: z.string().min(3).max(200).nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
    .nullable()
    .optional(),
  maxGrade: z.number().min(0).max(100).nullable().optional(),
  classId: z.string().uuid().nullable().optional(),
  // teacherHasClassId é resolvido server-side a partir de (classId, teacherId
  // do user atual, subjectId opcional). A IA não precisa saber disso.
  subjectId: z.string().uuid().nullable().optional(),
})

export type CreateAssignmentForm = z.infer<typeof createAssignmentFormSchema>

const DESCRIPTION = `Abre (ou atualiza) o painel flutuante de criação de atividade na tela do professor. ESTA TOOL NÃO CRIA NADA NO BANCO — só preenche o form. O professor revisa, ajusta o que quiser e clica em "Criar atividade" pra disparar a ação real.

Chame essa tool sempre que o usuário pedir pra criar uma atividade. Você pode chamar quantas vezes quiser pra ajustar campos — cada call substitui o estado do form pelo que você mandou. Campos omitidos viram null (não preserva o anterior). Então, quando o usuário disser "muda só a nota pra 10", chame com TODOS os campos atuais + maxGrade=10.

Campos:
- name (obrigatório no fim): título da atividade.
- description (opcional): enunciado / instruções.
- dueDate (YYYY-MM-DD, obrigatório): prazo de entrega. Resolva pra data absoluta.
- maxGrade (0-100): nota máxima.
- classId (UUID): turma. Use getMyClasses pra descobrir.
- subjectId (UUID, opcional): só passe se você dá MAIS DE UMA matéria na turma — aí precisa especificar qual. Senão, omita.

Comportamento:
- Cada chamada substitui o estado do form no painel.
- O painel já está aberto pro usuário desde a primeira chamada — não chame essa tool e fique esperando confirmação, fala em texto "abri o formulário, dá uma olhada e clica em criar quando estiver ok".
- Se o usuário editou o painel manualmente e depois pedir alteração via chat, a SUA próxima chamada vai sobrescrever as edições manuais dele. Quando isso for risco, confirme antes ("Você editou alguma coisa no formulário? Vou passar valores novos e isso pode apagar suas mudanças").`

export function createPrepareCreateAssignment(_ctx: ToolContext) {
  return defineTool({
    name: 'prepareCreateAssignment',
    description: DESCRIPTION,
    parameters: createAssignmentFormSchema,
    execute: async (form: CreateAssignmentForm) => {
      // Não toca banco. Só ecoa o form de volta pra o frontend renderizar
      // no painel. record_tool_calls trata como kind='canvas' e marca como
      // auto_executed pra auditoria saber que aconteceu.
      return { kind: 'canvas-update', form }
    },
  })
}

toolRegistry.register('professor', createPrepareCreateAssignment)
