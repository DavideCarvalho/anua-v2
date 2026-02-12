import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Occurrence from '#models/occurrence'
import Student from '#models/student'
import StudentHasResponsible from '#models/student_has_responsible'
import Notification from '#models/notification'
import TeacherHasClass from '#models/teacher_has_class'
import OccurrenceDto from '#models/dto/occurrence.dto'
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
      throw AppException.forbidden('Sem permissão para registrar ocorrência nesta escola')
    }

    const student = await Student.query().where('id', payload.studentId).preload('user').first()

    if (!student) {
      throw AppException.notFound('Aluno não encontrado')
    }

    if (!student.classId || student.classId !== teacherHasClass.classId) {
      throw AppException.badRequest('Aluno não pertence à turma selecionada para a ocorrência')
    }

    const pedagogicalResponsibles = await StudentHasResponsible.query()
      .where('studentId', payload.studentId)
      .where('isPedagogical', true)

    const recipientUserIds = student.isSelfResponsible
      ? [student.id]
      : [...new Set(pedagogicalResponsibles.map((relation) => relation.responsibleId))]

    const occurrence = await db.transaction(async (trx) => {
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

      await Promise.all(
        recipientUserIds.map((responsibleId) =>
          Notification.create(
            {
              userId: responsibleId,
              type: 'SYSTEM_ANNOUNCEMENT',
              title: 'Nova ocorrência registrada',
              message: `Foi registrada uma ocorrência para ${student.user?.name || 'o aluno'}.`,
              data: {
                occurrenceId: createdOccurrence.id,
                studentId: payload.studentId,
                type: payload.type,
                kind: 'occurrence_created',
              },
              isRead: false,
              sentViaInApp: true,
              sentViaEmail: false,
              sentViaPush: false,
              sentViaSms: false,
              sentViaWhatsApp: false,
              actionUrl: `/responsavel/ocorrencias?aluno=${payload.studentId}`,
            },
            { client: trx }
          )
        )
      )

      return createdOccurrence
    })

    return response.created(new OccurrenceDto(occurrence))
  }
}
