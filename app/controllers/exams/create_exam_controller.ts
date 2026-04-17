import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { createExamValidator } from '#validators/exam'
import AuditLog from '#models/audit_log'
import Exam from '#models/exam'
import Class_ from '#models/class'
import AppException from '#exceptions/app_exception'
import ExamTransformer from '#transformers/exam_transformer'
import { resolveActiveClassAcademicPeriodId } from '#services/academic_periods/resolve_active_class_academic_period_service'

export default class CreateExamController {
  async handle({ auth, request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(createExamValidator)

    // Get the school from the class
    const classRecord = await Class_.find(payload.classId)
    if (!classRecord) {
      throw AppException.notFound('Turma não encontrada')
    }

    const activeClassAcademicPeriodId = await resolveActiveClassAcademicPeriodId(payload.classId)

    if (payload.academicPeriodId && payload.academicPeriodId !== activeClassAcademicPeriodId) {
      throw AppException.badRequest('A turma não está vinculada ao período letivo informado')
    }

    const exam = await Exam.create({
      title: payload.title,
      description: payload.description,
      instructions: payload.instructions,
      maxScore: payload.maxScore,
      type: payload.type,
      status: payload.status || 'SCHEDULED',
      // Validator provides scheduledDate, model expects examDate
      examDate: DateTime.fromJSDate(payload.scheduledDate),
      classId: payload.classId,
      subjectId: payload.subjectId,
      teacherId: payload.teacherId,
      // Use derived values for fields not in validator
      schoolId: classRecord.schoolId,
      academicPeriodId: activeClassAcademicPeriodId,
      weight: 1,
    })

    await exam.load('class')
    await exam.load('subject')
    await exam.load('teacher')

    if (auth.user) {
      await AuditLog.create({
        userId: auth.user.id,
        action: 'CREATE',
        entity: 'EXAM',
        entityId: exam.id,
        details: {
          title: exam.title,
          classId: exam.classId,
          subjectId: exam.subjectId,
          academicPeriodId: exam.academicPeriodId,
          status: exam.status,
        },
      })
    }

    return response.created(await serialize(ExamTransformer.transform(exam)))
  }
}
