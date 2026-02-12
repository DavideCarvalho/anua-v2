import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import StudentHasResponsible from '#models/student_has_responsible'
import {
  StudentOccurrencesResponseDto,
  OccurrenceDto,
  OccurrencesSummaryDto,
} from '#models/dto/student_occurrences_response.dto'
import AppException from '#exceptions/app_exception'

interface OccurrenceRow {
  id: string
  type: string
  text: string
  date: string
  created_at: string
  teacher_name: string | null
  subject_name: string | null
  acknowledged_at: string | null
}

interface SummaryRow {
  total: string | number
  behavior: string | number
  performance: string | number
  absence: string | number
  late: string | number
  other: string | number
}

interface UnacknowledgedRow {
  count: string | number
}

export default class GetStudentOccurrencesController {
  async handle({ params, request, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const { studentId } = params
    const { type } = request.qs()

    // Verify that the user is a responsible for this student
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      throw AppException.forbidden('Você não tem permissão para ver as ocorrências deste aluno')
    }

    // Build filters
    let typeFilter = ''
    const queryParams: Record<string, string> = { studentId, responsibleId: effectiveUser.id }

    if (type) {
      typeFilter = `AND o.type = :type`
      queryParams.type = type
    }

    // Get student's occurrences
    const occurrences = await db.rawQuery(
      `
      SELECT
        o.id,
        o.type,
        o.text,
        o.date,
        o."createdAt" as created_at,
        u.name as teacher_name,
        s.name as subject_name,
        ack."createdAt" as acknowledged_at
      FROM "Occurence" o
      LEFT JOIN "TeacherHasClass" thc ON o."teacherHasClassId" = thc.id
      LEFT JOIN "User" u ON thc."teacherId" = u.id
      LEFT JOIN "Subject" s ON thc."subjectId" = s.id
      LEFT JOIN "ResponsibleUserAcceptedOccurence" ack
        ON ack."occurenceId" = o.id
        AND ack."responsibleUserId" = :responsibleId
      WHERE o."studentId" = :studentId
        ${typeFilter}
      ORDER BY o.date DESC, o."createdAt" DESC
      `,
      queryParams
    )

    // Get summary stats by type
    const summary = await db.rawQuery(
      `
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN type = 'BEHAVIOR' THEN 1 END) as behavior,
        COUNT(CASE WHEN type = 'PERFORMANCE' THEN 1 END) as performance,
        COUNT(CASE WHEN type = 'ABSENCE' THEN 1 END) as absence,
        COUNT(CASE WHEN type = 'LATE' THEN 1 END) as late,
        COUNT(CASE WHEN type = 'OTHER' THEN 1 END) as other
      FROM "Occurence"
      WHERE "studentId" = :studentId
      `,
      { studentId }
    )

    // Get unacknowledged count for this responsible
    const unacknowledged = await db.rawQuery(
      `
      SELECT COUNT(*) as count
      FROM "Occurence" o
      WHERE o."studentId" = :studentId
        AND NOT EXISTS (
          SELECT 1 FROM "ResponsibleUserAcceptedOccurence" ack
          WHERE ack."occurenceId" = o.id
            AND ack."responsibleUserId" = :responsibleId
        )
      `,
      { studentId, responsibleId: effectiveUser.id }
    )

    const occurrencesList = (occurrences.rows as OccurrenceRow[]).map(
      (row) =>
        new OccurrenceDto({
          id: row.id,
          type: row.type,
          severity: 'MEDIUM', // Default since table doesn't have severity
          status: row.acknowledged_at ? 'RESOLVED' : 'OPEN',
          title: getOccurrenceTitle(row.type),
          description: row.text,
          resolutionNotes: null,
          occurrenceDate: row.date,
          resolvedAt: null,
          responsibleNotified: true,
          responsibleNotifiedAt: row.created_at,
          responsibleAcknowledged: !!row.acknowledged_at,
          responsibleAcknowledgedAt: row.acknowledged_at,
          createdAt: row.created_at,
          reporterName: row.teacher_name || 'Professor',
          resolverName: null,
        })
    )

    const summaryRow = summary.rows[0] as SummaryRow | undefined
    const unacknowledgedRow = unacknowledged.rows[0] as UnacknowledgedRow | undefined

    const summaryData = new OccurrencesSummaryDto({
      total: Number(summaryRow?.total || 0),
      open: Number(unacknowledgedRow?.count || 0),
      inProgress: 0,
      resolved: Number(summaryRow?.total || 0) - Number(unacknowledgedRow?.count || 0),
      dismissed: 0,
      critical: 0,
      high: 0,
      medium: Number(summaryRow?.total || 0),
      low: 0,
      unacknowledged: Number(unacknowledgedRow?.count || 0),
    })

    return new StudentOccurrencesResponseDto({
      occurrences: occurrencesList,
      summary: summaryData,
    })
  }
}

function getOccurrenceTitle(type: string): string {
  const titles: Record<string, string> = {
    BEHAVIOR: 'Ocorrência de comportamento',
    PERFORMANCE: 'Ocorrência de desempenho',
    ABSENCE: 'Falta',
    LATE: 'Atraso',
    OTHER: 'Outra ocorrência',
  }
  return titles[type] || 'Ocorrência'
}
