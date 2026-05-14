import { z } from 'zod'
import db from '@adonisjs/lucid/services/db'
import { defineTool } from '../tool.js'
import { toolRegistry, type ToolContext } from '../tool_registry.js'

type ChildRow = {
  id: string
  name: string
  classId: string | null
  className: string | null
  levelName: string | null
  enrollmentStatus: string | null
  isFinancial: boolean
  isPedagogical: boolean
}

const DESCRIPTION = `Lista os filhos vinculados ao responsável atual.

Retorna { children: [{ id, name, classId, className, levelName, enrollmentStatus, isFinancial, isPedagogical }] }.

Use o id como studentId em outras tools. isFinancial/isPedagogical indicam quais responsabilidades o usuário tem sobre o aluno — usuário só vê o financeiro dos filhos com isFinancial=true.`

export function createGetMyChildren(ctx: ToolContext) {
  return defineTool({
    name: 'getMyChildren',
    description: DESCRIPTION,
    parameters: z.object({}),
    execute: async () => {
      if (ctx.scope.studentIds.length === 0) return { children: [] }

      const { rows } = await db.rawQuery<{ rows: ChildRow[] }>(
        `
          SELECT s.id, u.name,
            s."classId" AS "classId",
            c.name AS "className",
            l.name AS "levelName",
            s."enrollmentStatus" AS "enrollmentStatus",
            shr."isFinancial" AS "isFinancial",
            shr."isPedagogical" AS "isPedagogical"
          FROM "Student" s
          JOIN "User" u ON u.id = s.id
          JOIN "StudentHasResponsible" shr ON shr."studentId" = s.id
          LEFT JOIN "Class" c ON c.id = s."classId"
          LEFT JOIN "Level" l ON l.id = c."levelId"
          WHERE shr."responsibleId" = :userId
            AND u."deletedAt" IS NULL
          ORDER BY u.name
        `,
        { userId: ctx.userId }
      )
      return { children: rows }
    },
  })
}

toolRegistry.register('responsavel', createGetMyChildren)
