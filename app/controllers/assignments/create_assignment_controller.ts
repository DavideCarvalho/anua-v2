import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Assignment from '#models/assignment'
import TeacherHasClass from '#models/teacher_has_class'
import AcademicPeriod from '#models/academic_period'
import Class_ from '#models/class'
import { createAssignmentValidator } from '#validators/assignment'
import AppException from '#exceptions/app_exception'

export default class CreateAssignmentController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createAssignmentValidator)

    // Find the TeacherHasClass record that links teacher, class, and subject
    const teacherHasClass = await TeacherHasClass.query()
      .where('teacherId', payload.teacherId)
      .where('classId', payload.classId)
      .where('subjectId', payload.subjectId)
      .first()

    if (!teacherHasClass) {
      throw AppException.notFound('Vínculo professor-turma-disciplina não encontrado')
    }

    // Use provided academicPeriodId or fall back to active period
    let academicPeriodId = payload.academicPeriodId

    if (!academicPeriodId) {
      // Get the school from the class to find the active academic period
      const classRecord = await Class_.find(payload.classId)
      if (!classRecord) {
        throw AppException.notFound('Turma não encontrada')
      }

      // Find active academic period for this school
      const academicPeriod = await AcademicPeriod.query()
        .where('schoolId', classRecord.schoolId)
        .where('isActive', true)
        .first()

      if (!academicPeriod) {
        throw AppException.notFound('Nenhum período letivo ativo encontrado')
      }

      academicPeriodId = academicPeriod.id
    }

    const assignment = await Assignment.create({
      name: payload.title,
      description: payload.description,
      grade: payload.maxScore ?? 100,
      dueDate: DateTime.fromJSDate(payload.dueDate),
      teacherHasClassId: teacherHasClass.id,
      academicPeriodId,
    })

    await assignment.load('teacherHasClass', (query) => {
      query.preload('class')
      query.preload('subject')
      query.preload('teacher')
    })

    return response.created(assignment)
  }
}
