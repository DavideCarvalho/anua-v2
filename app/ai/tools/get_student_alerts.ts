import { z } from 'zod'
import { defineTool } from '../tool.js'
import { toolRegistry } from '../tool_registry.js'
import db from '@adonisjs/lucid/services/db'

type ToolCtx = { schoolId: string; userId: string }

export function createGetStudentAlerts(ctx: ToolCtx) {
  return defineTool({
    name: 'getStudentAlerts',
    description:
      'Obtém alertas: alunos com inadimplência. Retorna lista com nome, tipo e descrição.',
    parameters: z.object({
      limit: z.number().default(10).describe('Máximo de alertas'),
    }),
    execute: async ({ limit }) => {
      const overduePayments = await db
        .from('StudentPayment')
        .join('Student', 'Student.id', 'StudentPayment.studentId')
        .join('User', 'User.id', 'Student.id')
        .where('User.schoolId', ctx.schoolId)
        .where('StudentPayment.status', 'OVERDUE')
        .whereNull('User.deletedAt')
        .limit(limit ?? 10)
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
}

toolRegistry.register('gestor', createGetStudentAlerts)
toolRegistry.register('comunicador', createGetStudentAlerts)
