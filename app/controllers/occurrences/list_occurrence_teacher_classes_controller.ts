import type { HttpContext } from '@adonisjs/core/http'
import TeacherHasClass from '#models/teacher_has_class'
import OccurrenceTeacherClassTransformer from '#transformers/occurrence_teacher_class_transformer'

export default class ListOccurrenceTeacherClassesController {
  async handle({ request, response, selectedSchoolIds, serialize }: HttpContext) {
    const scopedSchoolIds = selectedSchoolIds ?? []

    const academicPeriodId = request.input('academicPeriodId') as string | undefined

    const query = TeacherHasClass.query()
      .where('isActive', true)
      .whereHas('class', (classQuery) => {
        if (scopedSchoolIds.length > 0) {
          classQuery.whereIn('schoolId', scopedSchoolIds)
        } else {
          classQuery.whereRaw('1 = 0')
        }

        classQuery.where('isArchived', false)

        if (academicPeriodId) {
          classQuery.whereHas('academicPeriods', (periodQuery) => {
            periodQuery
              .where('AcademicPeriod.id', academicPeriodId)
              .whereNull('AcademicPeriod.deletedAt')
          })
        }
      })
      .preload('class')
      .preload('subject')
      .preload('teacher', (teacherQuery) => teacherQuery.preload('user'))
      .orderBy('classId', 'asc')

    const teacherClasses = await query

    return response.ok({
      data: await serialize(OccurrenceTeacherClassTransformer.transform(teacherClasses)),
    })
  }
}
