import type { HttpContext } from '@adonisjs/core/http'
import Occurrence from '#models/occurrence'
import StudentHasResponsible from '#models/student_has_responsible'
import AppException from '#exceptions/app_exception'
import OccurrenceSchoolListItemTransformer from '#transformers/occurrence_school_list_item_transformer'

export default class ShowOccurrenceController {
  async handle({ params, response, selectedSchoolIds, serialize }: HttpContext) {
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

    occurrence.$extras.total_responsibles = Number(
      pedagogicalResponsibleCount[0]?.$extras.total || 0
    )

    return response.ok(await serialize(OccurrenceSchoolListItemTransformer.transform(occurrence)))
  }
}
