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

Use o id como studentId em outras tools.

IMPORTANTE — flags isFinancial/isPedagogical:
- isPedagogical=true → o usuário pode ver notas, frequência, atividades, provas, comunicados desse aluno.
- isFinancial=true → o usuário pode ver boletos/pagamentos.
- Se o usuário pedir info que ele não tem direito (ex: notas de um filho com isPedagogical=false), o sistema bloqueia automaticamente — você deve explicar que essa informação fica com o outro responsável e orientar ele a procurar essa pessoa.

Quando o responsável tem múltiplos filhos com flags diferentes (ex: isPedagogical=true pra um, isFinancial=true pra outro), pergunte de qual filho ele quer falar antes de buscar dados.`

export function createGetMyChildren(ctx: ToolContext) {
  return defineTool({
    name: 'getMyChildren',
    description: DESCRIPTION,
    parameters: z.object({}),
    execute: async () => {
      if (ctx.scope.studentIds.length === 0) return { children: [] }

      // BOOL_OR agrega quando o vínculo tem mais de uma linha pro mesmo aluno
      // (raro mas o schema permite). Mesmo comportamento do computeChatScope.
      const { rows } = await db.rawQuery<{ rows: ChildRow[] }>(
        `
          SELECT s.id, u.name,
            s."classId" AS "classId",
            c.name AS "className",
            l.name AS "levelName",
            s."enrollmentStatus" AS "enrollmentStatus",
            BOOL_OR(shr."isFinancial")   AS "isFinancial",
            BOOL_OR(shr."isPedagogical") AS "isPedagogical"
          FROM "Student" s
          JOIN "User" u ON u.id = s.id
          JOIN "StudentHasResponsible" shr ON shr."studentId" = s.id
          LEFT JOIN "Class" c ON c.id = s."classId"
          LEFT JOIN "Level" l ON l.id = c."levelId"
          WHERE shr."responsibleId" = :userId
            AND u."deletedAt" IS NULL
          GROUP BY s.id, u.name, s."classId", c.name, l.name, s."enrollmentStatus"
          ORDER BY u.name
        `,
        { userId: ctx.userId }
      )
      return { children: rows }
    },
  })
}

toolRegistry.register('responsavel', createGetMyChildren)
