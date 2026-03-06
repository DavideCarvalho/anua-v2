import type { HttpContext } from '@adonisjs/core/http'
import SchoolAnnouncement from '#models/school_announcement'
import SchoolAnnouncementTransformer from '#transformers/school_announcement_transformer'
import AppException from '#exceptions/app_exception'
import { getRecipientAcknowledgementStatus } from '#services/school_announcements/school_announcement_acknowledgement_service'

export default class ListComunicadosController {
  async handle({ request, response, auth, effectiveUser, serialize }: HttpContext) {
    const user = effectiveUser ?? auth.user
    if (!user) {
      throw AppException.forbidden('Usuário não autenticado')
    }

    const page = Number(request.input('page', 1)) || 1
    const limit = Number(request.input('limit', 20)) || 20

    const query = SchoolAnnouncement.query()
      .where('status', 'PUBLISHED')
      .whereHas('recipients', (recipientQuery) => {
        recipientQuery.where('responsibleId', user.id)
      })
      .preload('creator')
      .preload('recipients', (recipientQuery) => {
        recipientQuery.where('responsibleId', user.id)
      })

    const list = await query.orderBy('publishedAt', 'desc').paginate(page, Math.min(limit, 100))
    const data = list.all()
    const metadata = list.getMeta()

    const transformed = await serialize(SchoolAnnouncementTransformer.paginate(data, metadata))

    return response.ok({
      ...transformed,
      data: transformed.data.map((item) => {
        const model = data.find((announcement) => announcement.id === item.id)
        const recipient = model?.recipients?.[0] ?? null

        return {
          ...item,
          acknowledgementStatus: getRecipientAcknowledgementStatus({
            requiresAcknowledgement: model?.requiresAcknowledgement ?? false,
            acknowledgedAt: recipient?.acknowledgedAt ?? null,
            acknowledgementDueAt: model?.acknowledgementDueAt ?? null,
          }),
        }
      }),
    })
  }
}
