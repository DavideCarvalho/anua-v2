import type { HttpContext } from '@adonisjs/core/http'
import Occurrence from '#models/occurrence'
import StudentHasResponsible from '#models/student_has_responsible'
import OccurrenceSchoolListItemDto from '#models/dto/occurrence_school_list_item.dto'

export default class ShowOccurrenceController {
  async handle({ params, response, selectedSchoolIds }: HttpContext) {
    if (!selectedSchoolIds || selectedSchoolIds.length === 0) {
      return response.badRequest({ message: 'Usuario sem escola selecionada' })
    }

    const occurrence = await Occurrence.query()
      .where('id', params.id)
      .preload('student', (studentQuery) => studentQuery.preload('user'))
      .preload('teacherHasClass', (teacherClassQuery) => {
        teacherClassQuery
          .preload('class')
          .preload('subject')
          .preload('teacher', (teacherQuery) => teacherQuery.preload('user'))
      })
      .withCount('acknowledgements')
      .whereHas('teacherHasClass', (teacherClassQuery) => {
        teacherClassQuery.whereHas('class', (classQuery) => {
          classQuery.whereIn('schoolId', selectedSchoolIds)
        })
      })
      .first()

    if (!occurrence) {
      return response.notFound({ message: 'Ocorrencia nao encontrada' })
    }

    const pedagogicalResponsibleCount = await StudentHasResponsible.query()
      .where('studentId', occurrence.studentId)
      .where('isPedagogical', true)
      .count('* as total')

    return response.ok(
      new OccurrenceSchoolListItemDto({
        occurrence,
        studentName: occurrence.student?.user?.name || 'Aluno',
        className: occurrence.teacherHasClass?.class?.name || '-',
        teacherName: occurrence.teacherHasClass?.teacher?.user?.name || null,
        subjectName: occurrence.teacherHasClass?.subject?.name || null,
        acknowledgedCount: Number(occurrence.$extras.acknowledgements_count || 0),
        totalResponsibles: Number(pedagogicalResponsibleCount[0]?.$extras.total || 0),
      })
    )
  }
}
