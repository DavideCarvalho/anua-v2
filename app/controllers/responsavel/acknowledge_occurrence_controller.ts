import type { HttpContext } from '@adonisjs/core/http'
import Occurrence from '#models/occurrence'
import Notification from '#models/notification'
import TeacherHasClass from '#models/teacher_has_class'
import ResponsibleUserAcceptedOccurence from '#models/responsible_user_accepted_occurence'
import StudentHasResponsible from '#models/student_has_responsible'
import { randomUUID } from 'node:crypto'

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

    const existingAcknowledgement = await ResponsibleUserAcceptedOccurence.query()
      .where('responsibleUserId', effectiveUser.id)
      .where('occurenceId', occurrence.id)
      .first()

    if (!existingAcknowledgement) {
      await ResponsibleUserAcceptedOccurence.create({
        id: randomUUID(),
        responsibleUserId: effectiveUser.id,
        occurenceId: occurrence.id,
      })
    }

    const teacherHasClass = await TeacherHasClass.query()
      .where('id', occurrence.teacherHasClassId)
      .first()

    if (
      !existingAcknowledgement &&
      teacherHasClass?.teacherId &&
      teacherHasClass.teacherId !== effectiveUser.id
    ) {
      await Notification.create({
        id: randomUUID(),
        userId: teacherHasClass.teacherId,
        type: 'SYSTEM_ANNOUNCEMENT' as Notification['type'],
        title: 'Ocorrencia reconhecida por responsavel',
        message: 'Um responsavel confirmou a leitura de uma ocorrencia registrada.',
        data: {
          occurrenceId: occurrence.id,
          studentId,
          kind: 'occurrence_acknowledged',
        },
        isRead: false,
        sentViaInApp: true,
        sentViaEmail: false,
        sentViaPush: false,
        sentViaSms: false,
        sentViaWhatsApp: false,
        actionUrl: '/escola/pedagogico/ocorrencias',
      })
    }

    return response.ok({
      message: 'Ocorrencia reconhecida com sucesso',
      occurrence: {
        id: occurrence.id,
        type: occurrence.type,
        text: occurrence.text,
        date: occurrence.date?.toISO(),
      },
    })
  }
}
