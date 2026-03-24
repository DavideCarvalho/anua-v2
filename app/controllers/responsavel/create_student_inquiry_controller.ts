import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryMessage from '#models/parent_inquiry_message'
import ParentInquiryRecipient from '#models/parent_inquiry_recipient'
import ParentInquiryAttachment from '#models/parent_inquiry_attachment'
import ParentInquiryTransformer from '#transformers/parent_inquiry_transformer'
import AppException from '#exceptions/app_exception'
import StudentHasResponsible from '#models/student_has_responsible'
import StudentHasLevel from '#models/student_has_level'
import { createInquiryValidator } from '#validators/parent_inquiry'
import { resolveInquiryRecipients } from '#services/inquiries/inquiry_recipient_service'
import { notifyInquiryCreated } from '#services/inquiries/inquiry_notification_service'

export default class CreateStudentInquiryController {
  async handle({ request, response, auth, effectiveUser, params, serialize }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const { studentId } = params

    const responsibleLink = await StudentHasResponsible.query()
      .where('studentId', studentId)
      .where('responsibleId', user.id)
      .first()

    if (!responsibleLink) {
      throw AppException.forbidden('Você não é responsável por este aluno')
    }

    const payload = await request.validateUsing(createInquiryValidator)

    const activeEnrollment = await StudentHasLevel.query()
      .where('studentId', studentId)
      .whereNull('deletedAt')
      .preload('student', (sq) => sq.preload('user'))
      .first()

    if (!activeEnrollment) {
      throw AppException.badRequest('Aluno não possui matrícula ativa')
    }

    const schoolId = activeEnrollment.student?.user?.schoolId
    if (!schoolId) {
      throw AppException.badRequest('Aluno não possui escola vinculada')
    }

    const recipients = await resolveInquiryRecipients(studentId, schoolId)

    const inquiry = await db.transaction(async (trx) => {
      const created = await ParentInquiry.create(
        {
          studentId,
          createdByResponsibleId: user.id,
          schoolId,
          subject: payload.subject,
          status: 'OPEN',
        },
        { client: trx }
      )

      const message = await ParentInquiryMessage.create(
        {
          inquiryId: created.id,
          authorId: user.id,
          authorType: 'RESPONSIBLE',
          body: payload.body,
        },
        { client: trx }
      )

      if (payload.attachments && payload.attachments.length > 0) {
        await Promise.all(
          payload.attachments.map((att) =>
            ParentInquiryAttachment.create(
              {
                messageId: message.id,
                fileName: att.fileName,
                filePath: att.filePath,
                fileSize: att.fileSize,
                mimeType: att.mimeType,
              },
              { client: trx }
            )
          )
        )
      }

      await Promise.all(
        recipients.map((r) =>
          ParentInquiryRecipient.create(
            {
              inquiryId: created.id,
              userId: r.userId,
              userType: r.userType,
            },
            { client: trx }
          )
        )
      )

      return created
    })

    await inquiry.load('createdByResponsible')
    await inquiry.load('messages', (mq) => {
      mq.preload('author').preload('attachments').orderBy('createdAt', 'asc')
    })
    await inquiry.load('recipients', (rq) => rq.preload('user'))

    // Send notifications to recipients (school staff)
    const recipientIds = recipients.map((r) => r.userId)
    if (recipientIds.length > 0) {
      await notifyInquiryCreated({ inquiry, recipientIds })
    }

    return response.created(await serialize(ParentInquiryTransformer.transform(inquiry)))
  }
}
