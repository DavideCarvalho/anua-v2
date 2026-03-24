import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryMessage from '#models/parent_inquiry_message'
import ParentInquiryRecipient from '#models/parent_inquiry_recipient'
import ParentInquiryAttachment from '#models/parent_inquiry_attachment'
import ParentInquiryTransformer from '#transformers/parent_inquiry_transformer'
import AppException from '#exceptions/app_exception'
import { createMessageValidator } from '#validators/parent_inquiry'
import { notifyInquiryMessage } from '#services/inquiries/inquiry_notification_service'

export default class CreateInquiryMessageController {
  async handle({
    request,
    response,
    auth,
    effectiveUser,
    selectedSchoolIds,
    params,
    serialize,
  }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const scopedSchoolIds = selectedSchoolIds ?? []
    const { inquiryId } = params

    const inquiry = await ParentInquiry.query()
      .where('id', inquiryId)
      .whereIn('schoolId', scopedSchoolIds)
      .first()

    if (!inquiry) {
      throw AppException.notFound('Pergunta não encontrada')
    }

    const recipient = await ParentInquiryRecipient.query()
      .where('inquiryId', inquiry.id)
      .where('userId', user.id)
      .first()

    if (!recipient) {
      throw AppException.forbidden('Você não tem permissão para responder esta pergunta')
    }

    if (inquiry.status === 'RESOLVED' || inquiry.status === 'CLOSED') {
      throw AppException.badRequest('Esta pergunta já foi encerrada')
    }

    const payload = await request.validateUsing(createMessageValidator)

    await db.transaction(async (trx) => {
      const created = await ParentInquiryMessage.create(
        {
          inquiryId: inquiry.id,
          authorId: user.id,
          authorType: recipient.userType,
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
    await inquiry.load('resolvedByUser')
    await inquiry.load('messages', (mq) => {
      mq.preload('author').preload('attachments').orderBy('createdAt', 'asc')
    })
    await inquiry.load('recipients', (rq) => rq.preload('user'))

    // Notify the responsible who created the inquiry
    if (inquiry.createdByResponsibleId) {
      await notifyInquiryMessage({
        inquiry,
        messageAuthorId: user.id,
        messageAuthorName: user.name,
        messageBody: payload.body,
        notifyUserIds: [inquiry.createdByResponsibleId],
      })
    }

    return response.ok(await serialize(ParentInquiryTransformer.transform(inquiry)))
  }
}
