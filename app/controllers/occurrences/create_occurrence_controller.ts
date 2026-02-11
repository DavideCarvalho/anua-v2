import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import Occurrence from '#models/occurrence'
import Student from '#models/student'
import StudentHasResponsible from '#models/student_has_responsible'
import Notification from '#models/notification'
import TeacherHasClass from '#models/teacher_has_class'
import OccurrenceDto from '#models/dto/occurrence.dto'
import { createOccurrenceValidator } from '#validators/occurrence'

export default class CreateOccurrenceController {
  async handle({ request, response, selectedSchoolIds }: HttpContext) {
    if (!selectedSchoolIds || selectedSchoolIds.length === 0) {
      return response.badRequest({ message: 'Usuario sem escola selecionada' })
    }

    const payload = await request.validateUsing(createOccurrenceValidator)

    const teacherHasClass = await TeacherHasClass.query()
      .where('id', payload.teacherHasClassId)
      .preload('class')
      .first()

    if (!teacherHasClass || !teacherHasClass.classId || !teacherHasClass.class) {
      return response.badRequest({ message: 'Vinculo professor/turma invalido' })
    }

    if (!selectedSchoolIds.includes(teacherHasClass.class.schoolId)) {
      return response.forbidden({ message: 'Sem permissao para registrar ocorrencia nesta escola' })
    }

    const student = await Student.query().where('id', payload.studentId).preload('user').first()

    if (!student) {
      return response.notFound({ message: 'Aluno nao encontrado' })
    }

    if (!student.classId || student.classId !== teacherHasClass.classId) {
      return response.badRequest({
        message: 'Aluno nao pertence a turma selecionada para a ocorrencia',
      })
    }

    const occurrence = await Occurrence.create({
      id: randomUUID(),
      studentId: payload.studentId,
      teacherHasClassId: payload.teacherHasClassId,
      type: payload.type,
      text: payload.text,
      date: DateTime.fromJSDate(payload.date),
    })

    const pedagogicalResponsibles = await StudentHasResponsible.query()
      .where('studentId', payload.studentId)
      .where('isPedagogical', true)

    const responsibles =
      pedagogicalResponsibles.length > 0
        ? pedagogicalResponsibles
        : await StudentHasResponsible.query().where('studentId', payload.studentId)

    await Promise.all(
      responsibles.map((relation) =>
        Notification.create({
          id: randomUUID(),
          userId: relation.responsibleId,
          type: 'SYSTEM_ANNOUNCEMENT',
          title: 'Nova ocorrencia registrada',
          message: `Foi registrada uma ocorrencia para ${student.user?.name || 'o aluno'}.`,
          data: {
            occurrenceId: occurrence.id,
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
        })
      )
    )

    return response.created(new OccurrenceDto(occurrence))
  }
}
