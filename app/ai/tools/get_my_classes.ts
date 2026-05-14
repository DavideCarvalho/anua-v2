import { z } from 'zod'
import db from '@adonisjs/lucid/services/db'
import { defineTool } from '../tool.js'
import { toolRegistry, type ToolContext } from '../tool_registry.js'

type ClassRow = {
  id: string
  name: string
  levelName: string | null
  studentCount: number
  // Só populado pra professor — array de matérias que ele leciona NESSA turma.
  // Quando length > 1, ações como prepareCreateAssignment exigem subjectId
  // pra desambiguar. Pros outros papéis vem undefined.
  subjects?: Array<{ id: string; name: string }>
}

const DESCRIPTION = `Lista as turmas que o usuário tem acesso no período letivo atual.

Para coordenador: turmas que ele coordena.
Para professor: turmas onde ele dá aula.
Para responsável: turmas dos filhos dele.
Para gestor: todas as turmas ativas da escola (limitado a 50 por chamada).

Retorna { classes: [{ id, name, levelName, studentCount }] }. Use o id em outras tools que precisam de classId.`

export function createGetMyClasses(ctx: ToolContext) {
  return defineTool({
    name: 'getMyClasses',
    description: DESCRIPTION,
    parameters: z.object({}),
    execute: async () => {
      const { scope, schoolId } = ctx

      if (scope.role === 'gestor') {
        const { rows } = await db.rawQuery<{ rows: ClassRow[] }>(
          `
            SELECT c.id, c.name,
              l.name AS "levelName",
              COUNT(DISTINCT s.id)::int AS "studentCount"
            FROM "Class" c
            LEFT JOIN "Level" l ON l.id = c."levelId"
            LEFT JOIN "Student" s ON s."classId" = c.id
            LEFT JOIN "User" su ON su.id = s.id AND su."deletedAt" IS NULL
            WHERE c."schoolId" = :schoolId
              AND c."isArchived" = false
            GROUP BY c.id, c.name, l.name
            ORDER BY l.name NULLS LAST, c.name
            LIMIT 50
          `,
          { schoolId }
        )
        return { classes: rows }
      }

      const classIds =
        scope.role === 'responsavel' ? await classIdsForStudents(scope.studentIds) : scope.classIds

      if (classIds.length === 0) return { classes: [] }

      const { rows } = await db.rawQuery<{ rows: ClassRow[] }>(
        `
          SELECT c.id, c.name,
            l.name AS "levelName",
            COUNT(DISTINCT s.id)::int AS "studentCount"
          FROM "Class" c
          LEFT JOIN "Level" l ON l.id = c."levelId"
          LEFT JOIN "Student" s ON s."classId" = c.id
          LEFT JOIN "User" su ON su.id = s.id AND su."deletedAt" IS NULL
          WHERE c.id = ANY(:classIds)
            AND c."isArchived" = false
          GROUP BY c.id, c.name, l.name
          ORDER BY l.name NULLS LAST, c.name
        `,
        { classIds }
      )

      // Pro professor, anexa as matérias que ele dá em cada turma. Sem isso
      // a IA não tem como saber quando desambiguar subjectId (ex: criar
      // atividade — se ele dá MAIS de uma matéria na turma, precisa escolher).
      if (scope.role === 'professor' && rows.length > 0) {
        type SubjectRow = { classId: string; subjectId: string; subjectName: string | null }
        const { rows: subRows } = await db.rawQuery<{ rows: SubjectRow[] }>(
          `
            SELECT thc."classId" AS "classId",
                   thc."subjectId" AS "subjectId",
                   sub.name AS "subjectName"
            FROM "TeacherHasClass" thc
            LEFT JOIN "Subject" sub ON sub.id = thc."subjectId"
            WHERE thc."teacherId" = :userId
              AND thc."isActive" = true
              AND thc."classId" = ANY(:classIds)
          `,
          { userId: ctx.userId, classIds }
        )
        const byClass = new Map<string, Array<{ id: string; name: string }>>()
        for (const r of subRows) {
          if (!r.subjectId) continue
          const list = byClass.get(r.classId) ?? []
          if (!list.some((s) => s.id === r.subjectId)) {
            list.push({ id: r.subjectId, name: r.subjectName ?? '(sem nome)' })
          }
          byClass.set(r.classId, list)
        }
        for (const cls of rows) {
          cls.subjects = byClass.get(cls.id) ?? []
        }
      }

      return { classes: rows }
    },
  })
}

async function classIdsForStudents(studentIds: string[]): Promise<string[]> {
  if (studentIds.length === 0) return []
  const { rows } = await db.rawQuery<{ rows: Array<{ classId: string }> }>(
    `
      SELECT DISTINCT s."classId"
      FROM "Student" s
      WHERE s.id = ANY(:studentIds)
        AND s."classId" IS NOT NULL
    `,
    { studentIds }
  )
  return rows.map((r) => r.classId)
}

toolRegistry.register('gestor', createGetMyClasses)
toolRegistry.register('coordenador', createGetMyClasses)
toolRegistry.register('professor', createGetMyClasses)
toolRegistry.register('responsavel', createGetMyClasses)
