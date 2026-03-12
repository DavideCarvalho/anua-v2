import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { updateExamValidator } from '#validators/exam'
import AuditLog from '#models/audit_log'
import Exam from '#models/exam'
import ExamHistory from '#models/exam_history'
import AppException from '#exceptions/app_exception'
import ExamDto from '#models/dto/exam.dto'
import { buildFieldDiff } from '#services/history/build_field_diff'

export default class UpdateExamController {
  async handle({ auth, params, request, response }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(updateExamValidator)

    const trx = await db.transaction()

    try {
      const exam = await Exam.query({ client: trx }).where('id', id).first()

      if (!exam) {
        throw AppException.notFound('Prova não encontrada')
      }

      const updateData: Record<string, unknown> = { ...payload }

      if (payload.scheduledDate) {
        updateData.examDate = DateTime.fromJSDate(payload.scheduledDate)
        delete updateData.scheduledDate
      }

      const beforeSnapshot = {
        title: exam.title,
        description: exam.description,
        maxScore: exam.maxScore,
        type: exam.type,
        status: exam.status,
        scheduledDate: exam.examDate?.toISO() ?? null,
      }

      exam.useTransaction(trx)
      exam.merge(updateData)
      await exam.save()

      const afterSnapshot = {
        title: exam.title,
        description: exam.description,
        maxScore: exam.maxScore,
        type: exam.type,
        status: exam.status,
        scheduledDate: exam.examDate?.toISO() ?? null,
      }

      const changes = buildFieldDiff(beforeSnapshot, afterSnapshot, Object.keys(afterSnapshot))

      if (changes.length > 0 && auth.user) {
        await ExamHistory.create(
          {
            examId: exam.id,
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
            entity: 'EXAM',
            entityId: exam.id,
            details: { changes },
          },
          { client: trx }
        )
      }

      await trx.commit()

      await exam.load('class')
      await exam.load('subject')
      await exam.load('teacher')

      return response.ok(new ExamDto(exam))
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
