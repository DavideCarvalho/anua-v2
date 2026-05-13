import { z } from 'zod'
import { defineTool } from '../tool.js'
import { toolRegistry } from '../tool_registry.js'
import db from '@adonisjs/lucid/services/db'

export const getSchoolStats = defineTool({
  name: 'getSchoolStats',
  description: 'Obtém estatísticas gerais da escola: total de alunos, professores, inadimplência.',
  parameters: z.object({
    schoolId: z.string().describe('ID da escola'),
  }),
  execute: async ({ schoolId }) => {
    const studentCount = await db
      .from('Student')
      .join('User', 'User.id', 'Student.id')
      .where('User.schoolId', schoolId)
      .whereNull('User.deletedAt')
      .count('* as total')
      .first()

    const overdueTotal = await db
      .from('StudentPayment')
      .join('Student', 'Student.id', 'StudentPayment.studentId')
      .join('User', 'User.id', 'Student.id')
      .where('User.schoolId', schoolId)
      .where('StudentPayment.status', 'OVERDUE')
      .sum('StudentPayment.totalAmount as total')
      .first()

    return {
      totalStudents: Number(studentCount?.$extras?.total ?? studentCount?.total ?? 0),
      overdueAmountCents: Number(overdueTotal?.$extras?.total ?? overdueTotal?.total ?? 0),
    }
  },
})

toolRegistry.register('gestor', getSchoolStats)
