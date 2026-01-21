import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Occurrence from '#models/occurrence'
import StudentHasResponsible from '#models/student_has_responsible'

export default class AcknowledgeOccurrenceController {
  async handle({ params, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Nao autenticado' })
    }

    const { studentId, occurrenceId } = params

    // Verify that the user is a responsible for this student
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', user.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      return response.forbidden({
        message: 'Voce nao tem permissao para reconhecer esta ocorrencia',
      })
    }

    // Find the occurrence
    const occurrence = await Occurrence.query()
      .where('id', occurrenceId)
      .where('studentId', studentId)
      .first()

    if (!occurrence) {
      return response.notFound({ message: 'Ocorrencia nao encontrada' })
    }

    if (!occurrence.responsibleNotified) {
      return response.badRequest({ message: 'Esta ocorrencia ainda nao foi notificada' })
    }

    if (occurrence.responsibleAcknowledged) {
      return response.badRequest({ message: 'Esta ocorrencia ja foi reconhecida' })
    }

    // Mark as acknowledged
    occurrence.responsibleAcknowledged = true
    occurrence.responsibleAcknowledgedAt = DateTime.now()
    await occurrence.save()

    return response.ok({
      message: 'Ocorrencia reconhecida com sucesso',
      occurrence: {
        id: occurrence.id,
        responsibleAcknowledged: occurrence.responsibleAcknowledged,
        responsibleAcknowledgedAt: occurrence.responsibleAcknowledgedAt?.toISO(),
      },
    })
  }
}
