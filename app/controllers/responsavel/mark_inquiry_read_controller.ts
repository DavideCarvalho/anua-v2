import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

import AppException from '#exceptions/app_exception'
import ParentInquiry from '#models/parent_inquiry'
import ParentInquiryReadStatus from '#models/parent_inquiry_read_status'
import StudentHasResponsible from '#models/student_has_responsible'

export default class MarkInquiryReadController {
  async handle({ params, auth, effectiveUser, response }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const { inquiryId } = params

    const inquiry = await ParentInquiry.query().where('id', inquiryId).first()

    if (!inquiry) {
      throw AppException.notFound('Pergunta não encontrada')
    }

    const responsibleLink = await StudentHasResponsible.query()
      .where('studentId', inquiry.studentId)
      .where('responsibleId', user.id)
      .first()

    if (!responsibleLink) {
      throw AppException.forbidden('Você não tem permissão para visualizar esta pergunta')
    }

    await ParentInquiryReadStatus.updateOrCreate(
      { userId: user.id, inquiryId: inquiry.id },
      { lastReadAt: DateTime.now() }
    )

    return response.noContent()
  }
}
