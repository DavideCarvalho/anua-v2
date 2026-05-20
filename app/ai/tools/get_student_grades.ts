import { z } from 'zod'
import db from '@adonisjs/lucid/services/db'
import { defineTool } from '../tool.js'
import { toolRegistry, type ToolContext } from '../tool_registry.js'
import { denyIfResponsavelLacksPedagogicalAccess } from '../scope_check.js'

type ExamGradeRow = {
  type: 'exam'
  examOrAssignmentId: string
  title: string
  subjectName: string | null
  date: string | null
  score: number | null
  maxScore: number | null
  weight: number | null
}

type AssignmentGradeRow = {
  type: 'assignment'
  examOrAssignmentId: string
  title: string
  subjectName: string | null
  date: string | null
  score: number | null
  maxScore: number | null
  weight: number | null
}

type GradeRow = ExamGradeRow | AssignmentGradeRow

const DESCRIPTION = `Notas de um aluno específico — provas + atividades, ordenadas por data desc.

Parâmetros:
- studentId (UUID): id do aluno. Use getMyChildren (responsável) ou getStudentsInClass (coord/professor) antes pra descobrir os ids.

Retorna { grades: [{ type, examOrAssignmentId, title, subjectName, date, score, maxScore, weight }] }.

type é 'exam' ou 'assignment'. score é a nota tirada, maxScore o teto, weight o peso. Para usuário final, mostre como "Nota / Máximo" (ex: "7.5 / 10").

Se você não tem acesso ao aluno, retorna { error: '...' }.`

export function createGetStudentGrades(ctx: ToolContext) {
  return defineTool({
    name: 'getStudentGrades',
    description: DESCRIPTION,
    parameters: z.object({
      studentId: z.string().uuid().describe('UUID do aluno'),
    }),
    execute: async ({ studentId }) => {
      const denial = denyIfResponsavelLacksPedagogicalAccess(ctx.scope, studentId)
      if (denial) return { error: denial }

      const { rows: examRows } = await db.rawQuery<{ rows: ExamGradeRow[] }>(
        `
          SELECT 'exam'::text AS type,
            eg.id AS "examOrAssignmentId",
            e.title AS title,
            sub.name AS "subjectName",
            e."examDate"::text AS date,
            eg.score AS score,
            e."maxScore" AS "maxScore",
            e.weight AS weight
          FROM exam_grades eg
          JOIN exams e ON e.id = eg."examId"
          LEFT JOIN "Subject" sub ON sub.id = e."subjectId"
          WHERE eg."studentId" = :studentId
        `,
        { studentId }
      )

      const { rows: assignmentRows } = await db.rawQuery<{ rows: AssignmentGradeRow[] }>(
        `
          SELECT 'assignment'::text AS type,
            sha.id AS "examOrAssignmentId",
            a.name AS title,
            sub.name AS "subjectName",
            a."dueDate"::text AS date,
            sha.grade AS score,
            a.grade AS "maxScore",
            NULL::numeric AS weight
          FROM "StudentHasAssignment" sha
          JOIN "Assignment" a ON a.id = sha."assignmentId"
          LEFT JOIN "TeacherHasClass" thc ON thc.id = a."teacherHasClassId"
          LEFT JOIN "Subject" sub ON sub.id = thc."subjectId"
          WHERE sha."studentId" = :studentId
        `,
        { studentId }
      )

      const grades: GradeRow[] = [...examRows, ...assignmentRows].sort((a, b) => {
        if (!a.date && !b.date) return 0
        if (!a.date) return 1
        if (!b.date) return -1
        return b.date.localeCompare(a.date)
      })

      return { grades }
    },
  })
}

toolRegistry.register('gestor', createGetStudentGrades)
toolRegistry.register('coordenador', createGetStudentGrades)
toolRegistry.register('professor', createGetStudentGrades)
toolRegistry.register('responsavel', createGetStudentGrades)
