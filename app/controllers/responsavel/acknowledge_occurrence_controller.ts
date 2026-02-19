import type { HttpContext } from '@adonisjs/core/http'
import Occurrence from '#models/occurrence'
import Notification from '#models/notification'
import TeacherHasClass from '#models/teacher_has_class'
import ResponsibleUserAcceptedOccurence from '#models/responsible_user_accepted_occurence'
import StudentHasResponsible from '#models/student_has_responsible'
import AppException from '#exceptions/app_exception'

export default class AcknowledgeOccurrenceController {
  async handle({ params, response, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const { studentId, occurrenceId } = params

    // Verify that the user is a responsible for this student
    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      throw AppException.forbidden('Você não tem permissão para reconhecer esta ocorrência')
    }

    // Find the occurrence
    const occurrence = await Occurrence.query()
      .where('id', occurrenceId)
      .where('studentId', studentId)
      .first()

    if (!occurrence) {
      throw AppException.notFound('Ocorrência não encontrada')
    }

    const existingAcknowledgement = await ResponsibleUserAcceptedOccurence.query()
      .where('responsibleUserId', effectiveUser.id)
      .where('occurenceId', occurrence.id)
      .first()

    if (!existingAcknowledgement) {
      await ResponsibleUserAcceptedOccurence.create({
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
        userId: teacherHasClass.teacherId,
        type: 'SYSTEM_ANNOUNCEMENT',
        title: 'Ocorrência reconhecida por responsável',
        message: 'Um responsável confirmou a leitura de uma ocorrência registrada.',
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
        actionUrl: '/escola/pedagogico/registro-diario',
      })
    }

    return response.ok({
      message: 'Ocorrência reconhecida com sucesso',
      occurrence: {
        id: occurrence.id,
        type: occurrence.type,
        text: occurrence.text,
        date: occurrence.date?.toISO(),
      },
    })
  }
}
