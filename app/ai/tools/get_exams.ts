import { z } from 'zod'
import db from '@adonisjs/lucid/services/db'
import { defineTool } from '../tool.js'
import { toolRegistry, type ToolContext } from '../tool_registry.js'
import { denyIfClassOutOfScope } from '../scope_check.js'

type ExamRow = {
  id: string
  title: string
  description: string | null
  examDate: string | null
  maxScore: number | null
  weight: number | null
  type: string | null
  status: string | null
  subjectName: string | null
}

const DESCRIPTION = `Lista as provas (exams) de uma turma específica.

Parâmetros:
- classId (UUID): id da turma. Use getMyClasses antes.
- onlyUpcoming (boolean, opcional): se true, traz só provas com examDate no futuro.

Retorna { exams: [{ id, title, description, examDate, maxScore, weight, type, status, subjectName }] }, ordenadas por examDate desc.

type/status são enums internos — se for exibir pro usuário, mapeie pra PT-BR via formatRows.

Se você não tem acesso à turma, retorna { error: '...' }.`

export function createGetExams(ctx: ToolContext) {
  return defineTool({
    name: 'getExams',
    description: DESCRIPTION,
    parameters: z.object({
      classId: z.string().uuid().describe('UUID da turma'),
      onlyUpcoming: z.boolean().optional().describe('Filtrar só provas com data no futuro'),
    }),
    execute: async ({ classId, onlyUpcoming }) => {
      const denial = denyIfClassOutOfScope(ctx.scope, classId)
      if (denial) return { error: denial }

      const { rows } = await db.rawQuery<{ rows: ExamRow[] }>(
        `
          SELECT e.id, e.title, e.description,
            e."examDate"::text AS "examDate",
            e."maxScore" AS "maxScore",
            e.weight,
            e.type,
            e.status,
            sub.name AS "subjectName"
          FROM exams e
          LEFT JOIN "Subject" sub ON sub.id = e."subjectId"
          WHERE e."classId" = :classId
            ${onlyUpcoming ? `AND e."examDate" >= CURRENT_DATE` : ''}
          ORDER BY e."examDate" DESC NULLS LAST
        `,
        { classId }
      )
      return { exams: rows }
    },
  })
}

toolRegistry.register('gestor', createGetExams)
toolRegistry.register('coordenador', createGetExams)
toolRegistry.register('professor', createGetExams)
toolRegistry.register('responsavel', createGetExams)
