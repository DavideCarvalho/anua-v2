import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import mail from '@adonisjs/mail/services/main'
import Occurrence from '#models/occurrence'
import Student from '#models/student'
import User from '#models/user'
import StudentHasResponsible from '#models/student_has_responsible'
import Notification from '#models/notification'
import TeacherHasClass from '#models/teacher_has_class'
import OccurrenceDto from '#models/dto/occurrence.dto'
import OccurrenceAckRequiredMail from '#mails/occurrence_ack_required_mail'
import { createOccurrenceValidator } from '#validators/occurrence'
import AppException from '#exceptions/app_exception'

export default class CreateOccurrenceController {
  async handle({ request, response, selectedSchoolIds }: HttpContext) {
    const scopedSchoolIds = selectedSchoolIds ?? []

    const payload = await request.validateUsing(createOccurrenceValidator)

    const teacherHasClass = await TeacherHasClass.query()
      .where('id', payload.teacherHasClassId)
      .preload('class')
      .first()

    if (!teacherHasClass || !teacherHasClass.classId || !teacherHasClass.class) {
      throw AppException.badRequest('Vínculo professor/turma inválido')
    }

    if (!scopedSchoolIds.includes(teacherHasClass.class.schoolId)) {
      throw AppException.forbidden('Sem permissão para registrar registro diário nesta escola')
    }

    const student = await Student.query().where('id', payload.studentId).preload('user').first()

    if (!student) {
      throw AppException.notFound('Aluno não encontrado')
    }

    if (!student.classId || student.classId !== teacherHasClass.classId) {
      throw AppException.badRequest('Aluno não pertence à turma selecionada para o registro diário')
    }

    const pedagogicalResponsibles = await StudentHasResponsible.query()
      .where('studentId', payload.studentId)
      .where('isPedagogical', true)

    const recipientUserIds = student.isSelfResponsible
      ? [student.id]
      : [...new Set(pedagogicalResponsibles.map((relation) => relation.responsibleId))]

    const recipientUsers = await User.query()
      .whereIn('id', recipientUserIds)
      .select(['id', 'name', 'email'])

    const recipientUserById = new Map(recipientUsers.map((recipient) => [recipient.id, recipient]))
    const requiresAcknowledgement = payload.type !== 'PRAISE'

    const typeLabels: Record<string, string> = {
      BEHAVIOR: 'Comportamento',
      PERFORMANCE: 'Desempenho',
      ABSENCE: 'Falta',
      LATE: 'Atraso',
      PRAISE: 'Elogio ao aluno',
      OTHER: 'Outro',
    }

    const actionUrl = `/responsavel/registro-diario?aluno=${payload.studentId}`

    const { occurrence, notifications } = await db.transaction(async (trx) => {
      const createdOccurrence = await Occurrence.create(
        {
          studentId: payload.studentId,
          teacherHasClassId: payload.teacherHasClassId,
          type: payload.type,
          text: payload.text,
          date: DateTime.fromJSDate(payload.date),
        },
        { client: trx }
      )

      const createdNotifications = await Promise.all(
        recipientUserIds.map((responsibleId) =>
          Notification.create(
            {
              userId: responsibleId,
              type: 'SYSTEM_ANNOUNCEMENT',
              title: 'Novo registro diário',
              message: `Foi feito um registro diário para ${student.user?.name || 'o aluno'}.`,
              data: {
                occurrenceId: createdOccurrence.id,
                studentId: payload.studentId,
                type: payload.type,
                kind: 'occurrence_created',
                requiresAcknowledgement,
              },
              isRead: false,
              sentViaInApp: true,
              sentViaEmail: false,
              sentViaPush: false,
              sentViaSms: false,
              sentViaWhatsApp: false,
              actionUrl,
            },
            { client: trx }
          )
        )
      )

      return { occurrence: createdOccurrence, notifications: createdNotifications }
    })

    if (requiresAcknowledgement) {
      const occurrenceDate = DateTime.fromJSDate(payload.date).toFormat('dd/MM/yyyy')
      const occurrenceTypeLabel = typeLabels[payload.type] ?? payload.type

      await Promise.all(
        notifications.map(async (notification) => {
          const recipient = recipientUserById.get(notification.userId)
          const recipientEmail = recipient?.email?.trim()

          if (!recipientEmail) {
            await Notification.query().where('id', notification.id).update({
              emailError: 'Destinatario sem email',
            })
            return
          }

          try {
            await mail.send(
              new OccurrenceAckRequiredMail({
                to: recipientEmail,
                responsibleName: recipient?.name || 'Responsavel',
                studentName: student.user?.name || 'Aluno',
                occurrenceTypeLabel,
                occurrenceText: payload.text,
                occurrenceDate,
                actionUrl,
              })
            )

            await Notification.query().where('id', notification.id).update({
              sentViaEmail: true,
              emailSentAt: DateTime.now().toSQL(),
              emailError: null,
            })
          } catch (error) {
            await Notification.query()
              .where('id', notification.id)
              .update({
                sentViaEmail: false,
                emailError: error instanceof Error ? error.message : 'Falha ao enviar email',
              })
          }
        })
      )
    }

    return response.created(new OccurrenceDto(occurrence))
  }
}
