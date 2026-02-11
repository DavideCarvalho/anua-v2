import type { HttpContext } from '@adonisjs/core/http'
import TeacherHasClass from '#models/teacher_has_class'
import OccurrenceTeacherClassDto from '#models/dto/occurrence_teacher_class.dto'

export default class ListOccurrenceTeacherClassesController {
  async handle({ request, response, selectedSchoolIds }: HttpContext) {
    if (!selectedSchoolIds || selectedSchoolIds.length === 0) {
      return response.badRequest({ message: 'Usuario sem escola selecionada' })
    }

    const academicPeriodId = request.input('academicPeriodId') as string | undefined

    const query = TeacherHasClass.query()
      .where('isActive', true)
      .whereHas('class', (classQuery) => {
        classQuery.whereIn('schoolId', selectedSchoolIds).where('isArchived', false)

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
      data: teacherClasses.map((teacherClass) => new OccurrenceTeacherClassDto(teacherClass)),
    })
  }
}
