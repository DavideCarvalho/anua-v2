import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Assignment from '#models/assignment'
import AuditLog from '#models/audit_log'
import TeacherHasClass from '#models/teacher_has_class'
import Class_ from '#models/class'
import { createAssignmentValidator } from '#validators/assignment'
import AppException from '#exceptions/app_exception'
import AssignmentTransformer from '#transformers/assignment_transformer'
import { resolveActiveClassAcademicPeriodId } from '#services/academic_periods/resolve_active_class_academic_period_service'

export default class CreateAssignmentController {
  async handle({ auth, request, response, serialize }: HttpContext) {
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

    const classRecord = await Class_.find(payload.classId)
    if (!classRecord) {
      throw AppException.notFound('Turma não encontrada')
    }

    const activeClassAcademicPeriodId = await resolveActiveClassAcademicPeriodId(payload.classId)

    if (payload.academicPeriodId && payload.academicPeriodId !== activeClassAcademicPeriodId) {
      throw AppException.badRequest('A turma não está vinculada ao período letivo informado')
    }

    const assignment = await Assignment.create({
      name: payload.title,
      description: payload.description,
      grade: payload.maxScore,
      dueDate: DateTime.fromJSDate(payload.dueDate),
      teacherHasClassId: teacherHasClass.id,
      academicPeriodId: activeClassAcademicPeriodId,
    })

    await assignment.load('teacherHasClass', (query) => {
      query.preload('class')
      query.preload('subject')
      query.preload('teacher')
    })

    if (auth.user) {
      await AuditLog.create({
        userId: auth.user.id,
        action: 'CREATE',
        entity: 'ASSIGNMENT',
        entityId: assignment.id,
        details: {
          title: assignment.name,
          classId: payload.classId,
          subjectId: payload.subjectId,
          academicPeriodId: assignment.academicPeriodId,
        },
      })
    }

    return response.created(await serialize(AssignmentTransformer.transform(assignment)))
  }
}
