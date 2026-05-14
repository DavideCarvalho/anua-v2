import { z } from 'zod'
import db from '@adonisjs/lucid/services/db'
import { defineTool } from '../tool.js'
import { toolRegistry, type ToolContext } from '../tool_registry.js'
import { denyIfClassOutOfScope } from '../scope_check.js'

type AssignmentRow = {
  id: string
  name: string
  description: string | null
  dueDate: string | null
  maxGrade: number | null
  subjectName: string | null
  teacherName: string | null
}

const DESCRIPTION = `Lista as atividades (assignments) de uma turma específica.

Parâmetros:
- classId (UUID): id da turma. Use getMyClasses antes pra descobrir os ids.
- onlyOpen (boolean, opcional): se true, traz só as atividades com prazo no futuro (dueDate >= hoje).

Retorna { assignments: [{ id, name, description, dueDate, maxGrade, subjectName, teacherName }] }, ordenadas por dueDate desc.

Se você não tem acesso à turma, retorna { error: '...' }.`

export function createGetAssignments(ctx: ToolContext) {
  return defineTool({
    name: 'getAssignments',
    description: DESCRIPTION,
    parameters: z.object({
      classId: z.string().uuid().describe('UUID da turma'),
      onlyOpen: z.boolean().optional().describe('Filtrar só atividades com prazo no futuro'),
    }),
    execute: async ({ classId, onlyOpen }) => {
      const denial = denyIfClassOutOfScope(ctx.scope, classId)
      if (denial) return { error: denial }

      const { rows } = await db.rawQuery<{ rows: AssignmentRow[] }>(
        `
          SELECT a.id, a.name, a.description,
            a."dueDate"::text AS "dueDate",
            a.grade AS "maxGrade",
            sub.name AS "subjectName",
            tu.name AS "teacherName"
          FROM "Assignment" a
          JOIN "TeacherHasClass" thc ON thc.id = a."teacherHasClassId"
          LEFT JOIN "Subject" sub ON sub.id = thc."subjectId"
          LEFT JOIN "Teacher" t ON t.id = thc."teacherId"
          LEFT JOIN "User" tu ON tu.id = t.id
          WHERE thc."classId" = :classId
            ${onlyOpen ? `AND a."dueDate" >= CURRENT_DATE` : ''}
          ORDER BY a."dueDate" DESC NULLS LAST
        `,
        { classId }
      )
      return { assignments: rows }
    },
  })
}

toolRegistry.register('gestor', createGetAssignments)
toolRegistry.register('coordenador', createGetAssignments)
toolRegistry.register('professor', createGetAssignments)
toolRegistry.register('responsavel', createGetAssignments)
