import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Assignment from '#models/assignment'
import AuditLog from '#models/audit_log'
import AssignmentHistory from '#models/assignment_history'
import AssignmentDto from '#models/dto/assignment.dto'
import { updateAssignmentValidator } from '#validators/assignment'
import AppException from '#exceptions/app_exception'
import { buildFieldDiff } from '#services/history/build_field_diff'

export default class UpdateAssignmentController {
  async handle({ auth, params, request, response }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(updateAssignmentValidator)

    const trx = await db.transaction()

    try {
      const assignment = await Assignment.query({ client: trx }).where('id', id).first()

      if (!assignment) {
        throw AppException.notFound('Atividade não encontrada')
      }

      const updateData: Record<string, unknown> = {}

      if (payload.title !== undefined) {
        updateData.name = payload.title
      }
      if (payload.description !== undefined) {
        updateData.description = payload.description
      }
      if (payload.maxScore !== undefined) {
        updateData.grade = payload.maxScore
      }
      if (payload.dueDate !== undefined) {
        updateData.dueDate = DateTime.fromJSDate(payload.dueDate)
      }

      const beforeSnapshot = {
        title: assignment.name,
        description: assignment.description,
        maxScore: assignment.grade,
        dueDate: assignment.dueDate?.toISO() ?? null,
      }

      assignment.useTransaction(trx)
      assignment.merge(updateData)
      await assignment.save()

      const afterSnapshot = {
        title: assignment.name,
        description: assignment.description,
        maxScore: assignment.grade,
        dueDate: assignment.dueDate?.toISO() ?? null,
      }

      const changes = buildFieldDiff(beforeSnapshot, afterSnapshot, Object.keys(afterSnapshot))

      if (changes.length > 0 && auth.user) {
        await AssignmentHistory.create(
          {
            assignmentId: assignment.id,
            actorUserId: auth.user.id,
            changedAt: DateTime.now(),
            changes,
          },
          { client: trx }
        )

        await AuditLog.create(
          {
            userId: auth.user.id,
            action: 'UPDATE',
            entity: 'ASSIGNMENT',
            entityId: assignment.id,
            details: { changes },
          },
          { client: trx }
        )
      }

      await trx.commit()

      await assignment.load('teacherHasClass', (query) => {
        query.preload('class')
        query.preload('subject')
        query.preload('teacher')
      })

      return response.ok(new AssignmentDto(assignment))
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
