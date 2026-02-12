import type { HttpContext } from '@adonisjs/core/http'
import Occurrence from '#models/occurrence'
import StudentHasResponsible from '#models/student_has_responsible'
import OccurrenceSchoolListItemDto from '#models/dto/occurrence_school_list_item.dto'
import AppException from '#exceptions/app_exception'

export default class ShowOccurrenceController {
  async handle({ params, response, selectedSchoolIds }: HttpContext) {
    const scopedSchoolIds = selectedSchoolIds ?? []

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
          if (scopedSchoolIds.length > 0) {
            classQuery.whereIn('schoolId', scopedSchoolIds)
          } else {
            classQuery.whereRaw('1 = 0')
          }
        })
      })
      .first()

    if (!occurrence) {
      throw AppException.notFound('Ocorrência não encontrada')
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
