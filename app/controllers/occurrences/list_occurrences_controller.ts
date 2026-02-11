import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Occurrence from '#models/occurrence'
import StudentHasResponsible from '#models/student_has_responsible'
import OccurrenceSchoolListItemDto from '#models/dto/occurrence_school_list_item.dto'
import { listOccurrencesValidator } from '#validators/occurrence'

export default class ListOccurrencesController {
  async handle({ request, response, selectedSchoolIds }: HttpContext) {
    if (!selectedSchoolIds || selectedSchoolIds.length === 0) {
      return response.badRequest({ message: 'Usuario sem escola selecionada' })
    }

    const payload = await request.validateUsing(listOccurrencesValidator)
    const page = payload.page ?? 1
    const limit = Math.min(payload.limit ?? 20, 100)

    const query = Occurrence.query()
      .preload('student', (studentQuery) => {
        studentQuery.preload('user')
      })
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
      .orderBy('date', 'desc')
      .orderBy('createdAt', 'desc')

    if (payload.type) {
      query.where('type', payload.type)
    }

    if (payload.classId) {
      query.whereHas('teacherHasClass', (teacherClassQuery) => {
        teacherClassQuery.where('classId', payload.classId!)
      })
    }

    if (payload.studentId) {
      query.where('studentId', payload.studentId)
    }

    if (payload.teacherHasClassId) {
      query.where('teacherHasClassId', payload.teacherHasClassId)
    }

    if (payload.search) {
      query.where((whereQuery) => {
        whereQuery
          .whereILike('text', `%${payload.search}%`)
          .orWhereHas('student', (studentQuery) => {
            studentQuery.whereHas('user', (userQuery) => {
              userQuery.whereILike('name', `%${payload.search}%`)
            })
          })
      })
    }

    if (payload.startDate) {
      query.where('date', '>=', DateTime.fromJSDate(payload.startDate).toISODate()!)
    }

    if (payload.endDate) {
      query.where('date', '<=', DateTime.fromJSDate(payload.endDate).toISODate()!)
    }

    const occurrences = await query.paginate(page, limit)

    const studentIds = [...new Set(occurrences.all().map((occurrence) => occurrence.studentId))]

    const responsiblesPerStudent = new Map<string, number>()
    if (studentIds.length > 0) {
      const responsibleRows = await StudentHasResponsible.query()
        .whereIn('studentId', studentIds)
        .where('isPedagogical', true)
        .select('studentId')
        .count('* as total')
        .groupBy('studentId')

      for (const row of responsibleRows) {
        responsiblesPerStudent.set(row.studentId, Number(row.$extras.total || 0))
      }
    }

    return response.ok({
      data: occurrences.all().map(
        (occurrence) =>
          new OccurrenceSchoolListItemDto({
            occurrence,
            studentName: occurrence.student?.user?.name || 'Aluno',
            className: occurrence.teacherHasClass?.class?.name || '-',
            teacherName: occurrence.teacherHasClass?.teacher?.user?.name || null,
            subjectName: occurrence.teacherHasClass?.subject?.name || null,
            acknowledgedCount: Number(occurrence.$extras.acknowledgements_count || 0),
            totalResponsibles: responsiblesPerStudent.get(occurrence.studentId) || 0,
          })
      ),
      meta: occurrences.getMeta(),
    })
  }
}
