import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import StudentHasResponsible from '#models/student_has_responsible'

export default class GetStudentOccurrencesController {
  async handle({ params, auth, response, request }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Nao autenticado' })
    }

    const { studentId } = params
    const { type, status, severity } = request.qs()

    // Verify that the user is a responsible for this student
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', user.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      return response.forbidden({
        message: 'Voce nao tem permissao para ver as ocorrencias deste aluno',
      })
    }

    // Build filters
    let typeFilter = ''
    let statusFilter = ''
    let severityFilter = ''
    const queryParams: Record<string, any> = { studentId }

    if (type) {
      typeFilter = `AND o.type = :type`
      queryParams.type = type
    }

    if (status) {
      statusFilter = `AND o.status = :status`
      queryParams.status = status
    }

    if (severity) {
      severityFilter = `AND o.severity = :severity`
      queryParams.severity = severity
    }

    // Get student's occurrences
    const occurrences = await db.rawQuery(
      `
      SELECT
        o.id,
        o.type,
        o.severity,
        o.status,
        o.title,
        o.description,
        o.resolution_notes,
        o.occurrence_date,
        o.resolved_at,
        o.responsible_notified,
        o.responsible_notified_at,
        o.responsible_acknowledged,
        o.responsible_acknowledged_at,
        o.created_at,
        reporter.name as reporter_name,
        resolver.name as resolver_name
      FROM occurrences o
      JOIN users reporter ON o.reported_by = reporter.id
      LEFT JOIN users resolver ON o.resolved_by = resolver.id
      WHERE o.student_id = :studentId
        ${typeFilter}
        ${statusFilter}
        ${severityFilter}
      ORDER BY o.occurrence_date DESC, o.created_at DESC
      `,
      queryParams
    )

    // Get summary stats
    const summary = await db.rawQuery(
      `
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'OPEN' THEN 1 END) as open,
        COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'RESOLVED' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'DISMISSED' THEN 1 END) as dismissed,
        COUNT(CASE WHEN severity = 'CRITICAL' THEN 1 END) as critical,
        COUNT(CASE WHEN severity = 'HIGH' THEN 1 END) as high,
        COUNT(CASE WHEN severity = 'MEDIUM' THEN 1 END) as medium,
        COUNT(CASE WHEN severity = 'LOW' THEN 1 END) as low
      FROM occurrences
      WHERE student_id = :studentId
      `,
      { studentId }
    )

    // Get unacknowledged count
    const unacknowledged = await db.rawQuery(
      `
      SELECT COUNT(*) as count
      FROM occurrences
      WHERE student_id = :studentId
        AND responsible_notified = true
        AND responsible_acknowledged = false
      `,
      { studentId }
    )

    return response.ok({
      occurrences: occurrences.rows.map((row: any) => ({
        id: row.id,
        type: row.type,
        severity: row.severity,
        status: row.status,
        title: row.title,
        description: row.description,
        resolutionNotes: row.resolution_notes,
        occurrenceDate: row.occurrence_date,
        resolvedAt: row.resolved_at,
        responsibleNotified: row.responsible_notified,
        responsibleNotifiedAt: row.responsible_notified_at,
        responsibleAcknowledged: row.responsible_acknowledged,
        responsibleAcknowledgedAt: row.responsible_acknowledged_at,
        createdAt: row.created_at,
        reporterName: row.reporter_name,
        resolverName: row.resolver_name,
      })),
      summary: {
        total: Number(summary.rows[0]?.total || 0),
        open: Number(summary.rows[0]?.open || 0),
        inProgress: Number(summary.rows[0]?.in_progress || 0),
        resolved: Number(summary.rows[0]?.resolved || 0),
        dismissed: Number(summary.rows[0]?.dismissed || 0),
        critical: Number(summary.rows[0]?.critical || 0),
        high: Number(summary.rows[0]?.high || 0),
        medium: Number(summary.rows[0]?.medium || 0),
        low: Number(summary.rows[0]?.low || 0),
        unacknowledged: Number(unacknowledged.rows[0]?.count || 0),
      },
    })
  }
}
