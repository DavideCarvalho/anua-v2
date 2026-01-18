import type { HttpContext } from '@adonisjs/core/http'
import Subject from '#models/subject'
import TeacherHasClass from '#models/teacher_has_class'
import TeacherHasSubject from '#models/teacher_has_subject'

export default class ListSubjectsForClassController {
  async handle({ params, response }: HttpContext) {
    const classId = params.classId

    const teacherAssignments = await TeacherHasClass.query()
      .where('classId', classId)
      .select('teacherId')

    const teacherIds = teacherAssignments.map((assignment) => assignment.teacherId)

    if (teacherIds.length === 0) {
      return response.ok([])
    }

    const teacherSubjects = await TeacherHasSubject.query()
      .whereIn('teacherId', teacherIds)
      .select('subjectId')
      .distinct('subjectId')

    const subjectIds = teacherSubjects.map((ts) => ts.subjectId)

    if (subjectIds.length === 0) {
      return response.ok([])
    }

    const subjects = await Subject.query()
      .whereIn('id', subjectIds)
      .preload('school')
      .orderBy('name', 'asc')

    return response.ok(subjects)
  }
}
