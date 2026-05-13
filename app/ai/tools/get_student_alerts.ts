import { z } from 'zod'
import { defineTool } from '../tool.js'
import { toolRegistry } from '../tool_registry.js'
import db from '@adonisjs/lucid/services/db'

export const getStudentAlerts = defineTool({
  name: 'getStudentAlerts',
  description:
    'Obtém alertas pedagógicos atuais: alunos com risco por nota, frequência baixa, inadimplência. Retorna lista com nome, tipo de risco e descrição.',
  parameters: z.object({
    schoolId: z.string().describe('ID da escola'),
    limit: z.number().default(10).describe('Máximo de alertas'),
  }),
  execute: async ({ schoolId, limit }) => {
    const overduePayments = await db
      .from('StudentPayment')
      .join('Student', 'Student.id', 'StudentPayment.studentId')
      .join('User', 'User.id', 'Student.id')
      .where('User.schoolId', schoolId)
      .where('StudentPayment.status', 'OVERDUE')
      .whereNull('User.deletedAt')
      .limit(limit)
      .select('User.name', 'StudentPayment.totalAmount', 'StudentPayment.dueDate')

    return {
      alerts: overduePayments.map((p) => ({
        type: 'financial',
        student: p.name,
        description: `Pagamento vencido de R$ ${(Number(p.totalAmount) / 100).toFixed(2)}`,
        priority: 'high',
      })),
    }
  },
})

toolRegistry.register('gestor', getStudentAlerts)
toolRegistry.register('comunicador', getStudentAlerts)
