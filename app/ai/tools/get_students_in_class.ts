import { z } from 'zod'
import db from '@adonisjs/lucid/services/db'
import { defineTool } from '../tool.js'
import { toolRegistry, type ToolContext } from '../tool_registry.js'
import { denyIfClassOutOfScope } from '../scope_check.js'

type StudentRow = {
  id: string
  name: string
  enrollmentStatus: string | null
  monthlyPaymentAmount: number | null
}

const DESCRIPTION = `Lista os alunos de uma turma específica.

Parâmetros:
- classId (UUID): id da turma. Use getMyClasses antes pra descobrir os ids disponíveis.

Retorna { students: [{ id, name, enrollmentStatus, monthlyPaymentAmount }] }.

monthlyPaymentAmount está em CENTAVOS — use formatRows com moneyColumns: ['monthlyPaymentAmount'] antes de renderResult.

Se você não tem acesso à turma, retorna { error: '...' }.`

export function createGetStudentsInClass(ctx: ToolContext) {
  return defineTool({
    name: 'getStudentsInClass',
    description: DESCRIPTION,
    parameters: z.object({
      classId: z.string().uuid().describe('UUID da turma'),
    }),
    execute: async ({ classId }) => {
      const denial = denyIfClassOutOfScope(ctx.scope, classId)
      if (denial) return { error: denial }

      const { rows } = await db.rawQuery<{ rows: StudentRow[] }>(
        `
          SELECT s.id, u.name,
            s."enrollmentStatus" AS "enrollmentStatus",
            s."monthlyPaymentAmount" AS "monthlyPaymentAmount"
          FROM "Student" s
          JOIN "User" u ON u.id = s.id
          WHERE s."classId" = :classId
            AND u."deletedAt" IS NULL
          ORDER BY u.name
        `,
        { classId }
      )
      return { students: rows }
    },
  })
}

toolRegistry.register('gestor', createGetStudentsInClass)
toolRegistry.register('coordenador', createGetStudentsInClass)
toolRegistry.register('professor', createGetStudentsInClass)
