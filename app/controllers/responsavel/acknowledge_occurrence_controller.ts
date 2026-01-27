import type { HttpContext } from '@adonisjs/core/http'
import Occurrence from '#models/occurrence'
import StudentHasResponsible from '#models/student_has_responsible'

export default class AcknowledgeOccurrenceController {
  async handle({ params, response, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      return response.unauthorized({ message: 'Nao autenticado' })
    }

    const { studentId, occurrenceId } = params

    // Verify that the user is a responsible for this student
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
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

    // Note: The Occurrence model doesn't have acknowledgment fields
    // This controller returns the occurrence data for viewing purposes
    // Acknowledgment tracking would need to be implemented via a separate table
    // or by adding fields to the Occurrence model

    return response.ok({
      message: 'Ocorrencia visualizada com sucesso',
      occurrence: {
        id: occurrence.id,
        type: occurrence.type,
        text: occurrence.text,
        date: occurrence.date?.toISO(),
      },
    })
  }
}
