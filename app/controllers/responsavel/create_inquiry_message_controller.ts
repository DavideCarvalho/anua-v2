import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryMessage from '#models/parent_inquiry_message'
import ParentInquiryAttachment from '#models/parent_inquiry_attachment'
import ParentInquiryTransformer from '#transformers/parent_inquiry_transformer'
import AppException from '#exceptions/app_exception'
import StudentHasResponsible from '#models/student_has_responsible'
import { createMessageValidator } from '#validators/parent_inquiry'
import { notifyInquiryMessage } from '#services/inquiries/inquiry_notification_service'

export default class CreateInquiryMessageController {
  async handle({ request, response, auth, effectiveUser, params, serialize }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const { inquiryId } = params

    const inquiry = await ParentInquiry.query().where('id', inquiryId).preload('student').first()

    if (!inquiry) {
      throw AppException.notFound('Pergunta não encontrada')
    }

    const responsibleLink = await StudentHasResponsible.query()
      .where('studentId', inquiry.studentId)
      .where('responsibleId', user.id)
      .first()

    if (!responsibleLink) {
      throw AppException.forbidden('Você não tem permissão para responder esta pergunta')
    }

    const payload = await request.validateUsing(createMessageValidator)

    await db.transaction(async (trx) => {
      if (inquiry.status === 'RESOLVED' || inquiry.status === 'CLOSED') {
        inquiry.status = 'OPEN'
        inquiry.resolvedAt = null
        inquiry.resolvedBy = null
        await inquiry.useTransaction(trx).save()
      }

      const created = await ParentInquiryMessage.create(
        {
          inquiryId: inquiry.id,
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
                messageId: created.id,
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
    })

    await inquiry.load('createdByResponsible')
    await inquiry.load('messages', (mq) => {
      mq.preload('author').preload('attachments').orderBy('createdAt', 'asc')
    })
    await inquiry.load('recipients', (rq) => rq.preload('user'))

    // Notify school staff (recipients) about the new message from responsible
    const recipientUserIds = inquiry.recipients.map((r) => r.userId)
    if (recipientUserIds.length > 0) {
      await notifyInquiryMessage({
        inquiry,
        messageAuthorId: user.id,
        messageAuthorName: user.name,
        messageBody: payload.body,
        notifyUserIds: recipientUserIds,
      })
    }

    return response.ok(await serialize(ParentInquiryTransformer.transform(inquiry)))
  }
}
