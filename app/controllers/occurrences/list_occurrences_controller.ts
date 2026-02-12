import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Occurrence from '#models/occurrence'
import StudentHasResponsible from '#models/student_has_responsible'
import OccurrenceSchoolListItemDto from '#models/dto/occurrence_school_list_item.dto'
import { listOccurrencesValidator } from '#validators/occurrence'

export default class ListOccurrencesController {
  async handle({ request, response, selectedSchoolIds }: HttpContext) {
    const scopedSchoolIds = selectedSchoolIds ?? []

    const payload = await request.validateUsing(listOccurrencesValidator)
    const page = payload.page ?? 1
    const limit = Math.min(payload.limit ?? 20, 100)
    const orderBy = payload.orderBy ?? 'date'
    const direction = payload.direction ?? 'desc'

    const query = Occurrence.query()
      .select('Occurence.*')
      .leftJoin('Student as sort_student', 'sort_student.id', 'Occurence.studentId')
      .leftJoin('User as sort_student_user', 'sort_student_user.id', 'sort_student.id')
      .leftJoin('TeacherHasClass as sort_thc', 'sort_thc.id', 'Occurence.teacherHasClassId')
      .leftJoin('Class as sort_class', 'sort_class.id', 'sort_thc.classId')
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

    if (scopedSchoolIds.length > 0) {
      query.whereIn('sort_class.schoolId', scopedSchoolIds)
    } else {
      query.whereRaw('1 = 0')
    }

    if (payload.type) {
      query.where('type', payload.type)
    }

    if (payload.classId) {
      query.where('sort_thc.classId', payload.classId)
    }

    if (payload.academicPeriodId) {
      query.whereExists((periodQuery) => {
        periodQuery
          .from('ClassHasAcademicPeriod as chap')
          .whereRaw('chap."classId" = sort_class.id')
          .where('chap.academicPeriodId', payload.academicPeriodId!)
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
          .whereILike('Occurence.text', `%${payload.search}%`)
          .orWhereILike('sort_student_user.name', `%${payload.search}%`)
      })
    }

    if (payload.startDate) {
      query.where('date', '>=', DateTime.fromJSDate(payload.startDate).toISODate()!)
    }

    if (payload.endDate) {
      query.where('date', '<=', DateTime.fromJSDate(payload.endDate).toISODate()!)
    }

    if (orderBy === 'student') {
      query.orderBy('sort_student_user.name', direction)
    } else if (orderBy === 'class') {
      query.orderBy('sort_class.name', direction)
    } else if (orderBy === 'type') {
      query.orderBy('Occurence.type', direction)
    } else {
      query.orderBy('Occurence.date', direction)
    }

    query.orderBy('Occurence.createdAt', 'desc')

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
