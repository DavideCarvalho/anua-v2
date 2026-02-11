import type { HttpContext } from '@adonisjs/core/http'
import TeacherHasClass from '#models/teacher_has_class'
import OccurrenceTeacherClassDto from '#models/dto/occurrence_teacher_class.dto'

export default class ListOccurrenceTeacherClassesController {
  async handle({ response, selectedSchoolIds }: HttpContext) {
    if (!selectedSchoolIds || selectedSchoolIds.length === 0) {
      return response.badRequest({ message: 'Usuario sem escola selecionada' })
    }

    const teacherClasses = await TeacherHasClass.query()
      .where('isActive', true)
      .whereHas('class', (classQuery) => {
        classQuery.whereIn('schoolId', selectedSchoolIds)
      })
      .preload('class')
      .preload('subject')
      .preload('teacher', (teacherQuery) => teacherQuery.preload('user'))
      .orderBy('classId', 'asc')

    return response.ok({
      data: teacherClasses.map((teacherClass) => new OccurrenceTeacherClassDto(teacherClass)),
    })
  }
}
