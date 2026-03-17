import type { HttpContext } from '@adonisjs/core/http'
import Occurrence from '#models/occurrence'
import StudentHasResponsible from '#models/student_has_responsible'
import ResponsibleUserAcceptedOccurence from '#models/responsible_user_accepted_occurence'
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
      .preload('acknowledgements', (ackQuery) => ackQuery.preload('responsibleUser'))
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

    const pedagogicalResponsibles = await StudentHasResponsible.query()
      .where('studentId', occurrence.studentId)
      .where('isPedagogical', true)
      .preload('responsible')

    const acknowledgedUserIds = new Set(
      occurrence.acknowledgements?.map((a) => a.responsibleUserId) ?? []
    )

    const responsibleAcknowledgements = pedagogicalResponsibles.map((shr) => ({
      name: shr.responsible?.name ?? 'Responsável',
      acknowledged: acknowledgedUserIds.has(shr.responsibleId),
    }))

    occurrence.$extras.total_responsibles = pedagogicalResponsibles.length
    occurrence.$extras.acknowledgements_count = occurrence.acknowledgements?.length ?? 0
    occurrence.$extras.responsible_acknowledgements = responsibleAcknowledgements

    return response.ok(await serialize(OccurrenceSchoolListItemTransformer.transform(occurrence)))
  }
}
