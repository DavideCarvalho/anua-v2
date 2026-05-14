import { z } from 'zod'
import db from '@adonisjs/lucid/services/db'
import { defineTool } from '../tool.js'
import { toolRegistry, type ToolContext } from '../tool_registry.js'
import { denyIfStudentOutOfScope } from '../scope_check.js'

type AttendanceDetail = {
  date: string
  status: string
  justification: string | null
  subjectName: string | null
}

type AttendanceSummary = {
  totalSessions: number
  present: number
  absent: number
  late: number
  excused: number
  attendanceRate: number
}

const DESCRIPTION = `Frequência (presença em aula) de um aluno. Retorna um resumo + a lista detalhada.

Parâmetros:
- studentId (UUID): id do aluno.
- dateFrom (YYYY-MM-DD, opcional): data inicial inclusive. Default: 90 dias atrás.
- dateTo (YYYY-MM-DD, opcional): data final inclusive. Default: hoje.

Retorna { summary: { totalSessions, present, absent, late, excused, attendanceRate }, sessions: [...] }.

attendanceRate é 0..1 (multiplique por 100 pra %). Status: PRESENT/ABSENT/LATE/EXCUSED — traduza pra "Presente/Faltou/Atrasado/Justificado" antes de exibir.

Se você não tem acesso ao aluno, retorna { error: '...' }.`

export function createGetStudentAttendance(ctx: ToolContext) {
  return defineTool({
    name: 'getStudentAttendance',
    description: DESCRIPTION,
    parameters: z.object({
      studentId: z.string().uuid().describe('UUID do aluno'),
      dateFrom: z.string().optional().describe('Data inicial YYYY-MM-DD'),
      dateTo: z.string().optional().describe('Data final YYYY-MM-DD'),
    }),
    execute: async ({ studentId, dateFrom, dateTo }) => {
      const denial = denyIfStudentOutOfScope(ctx.scope, studentId)
      if (denial) return { error: denial }

      const { rows } = await db.rawQuery<{ rows: AttendanceDetail[] }>(
        `
          SELECT a.date::text AS date,
            sha.status,
            sha.justification,
            sub.name AS "subjectName"
          FROM "StudentHasAttendance" sha
          JOIN "Attendance" a ON a.id = sha."attendanceId"
          LEFT JOIN "CalendarSlot" cs ON cs.id = a."calendarSlotId"
          LEFT JOIN "TeacherHasClass" thc ON thc.id = cs."teacherHasClassId"
          LEFT JOIN "Subject" sub ON sub.id = thc."subjectId"
          WHERE sha."studentId" = :studentId
            AND a.date >= COALESCE(:dateFrom::date, CURRENT_DATE - INTERVAL '90 days')
            AND a.date <= COALESCE(:dateTo::date, CURRENT_DATE)
          ORDER BY a.date DESC
        `,
        { studentId, dateFrom: dateFrom ?? null, dateTo: dateTo ?? null }
      )

      const summary: AttendanceSummary = {
        totalSessions: rows.length,
        present: rows.filter((r) => r.status === 'PRESENT').length,
        absent: rows.filter((r) => r.status === 'ABSENT').length,
        late: rows.filter((r) => r.status === 'LATE').length,
        excused: rows.filter((r) => r.status === 'EXCUSED').length,
        attendanceRate: 0,
      }
      if (summary.totalSessions > 0) {
        // Conta presente + atrasado como "esteve em aula"; justificado não
        // entra como presença mas também não como falta — convenção pedagógica
        // comum no Brasil. Se a escola usar outro critério, refinar.
        summary.attendanceRate = (summary.present + summary.late) / summary.totalSessions
      }

      return { summary, sessions: rows }
    },
  })
}

toolRegistry.register('gestor', createGetStudentAttendance)
toolRegistry.register('coordenador', createGetStudentAttendance)
toolRegistry.register('professor', createGetStudentAttendance)
toolRegistry.register('responsavel', createGetStudentAttendance)
