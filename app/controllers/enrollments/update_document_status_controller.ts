import type { HttpContext } from '@adonisjs/core/http'
import StudentDocument from '#models/student_document'
import Student from '#models/student'
import { DateTime } from 'luxon'
import { updateDocumentStatusValidator } from '#validators/enrollment'
import AppException from '#exceptions/app_exception'

export default class UpdateDocumentStatusController {
  async handle({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const { id } = params
    const { status, rejectionReason } = await request.validateUsing(updateDocumentStatusValidator)

    const document = await StudentDocument.find(id)

    if (!document) {
      throw AppException.notFound('Documento não encontrado')
    }

    if (status === 'REJECTED' && !rejectionReason) {
      throw AppException.badRequest('Motivo da rejeição é obrigatório')
    }

    document.status = status
    document.reviewedBy = user.id
    document.reviewedAt = DateTime.now()
    document.rejectionReason = status === 'REJECTED' ? rejectionReason || null : null

    await document.save()

    // Check if all documents are approved to update student status
    if (status === 'APPROVED') {
      const student = await Student.find(document.studentId)
      if (student) {
        const pendingDocs = await StudentDocument.query()
          .where('studentId', student.id)
          .where('status', 'PENDING')
          .count('* as count')

        const pendingCount = Number(pendingDocs[0].$extras.count || 0)

        if (pendingCount === 0) {
          // All documents approved, check if there are any rejected
          const rejectedDocs = await StudentDocument.query()
            .where('studentId', student.id)
            .where('status', 'REJECTED')
            .count('* as count')

          const rejectedCount = Number(rejectedDocs[0].$extras.count || 0)

          if (rejectedCount === 0) {
            // All documents approved, update student status
            student.enrollmentStatus = 'REGISTERED'
            await student.save()
          }
        }
      }
    }

    return response.ok({
      id: document.id,
      status: document.status,
      reviewedAt: document.reviewedAt?.toISO(),
      rejectionReason: document.rejectionReason,
    })
  }
}
