import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { createExamValidator } from '#validators/exam'
import Exam from '#models/exam'
import Class_ from '#models/class'
import AcademicPeriod from '#models/academic_period'

export default class CreateExamController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createExamValidator)

    // Get the school from the class
    const classRecord = await Class_.find(payload.classId)
    if (!classRecord) {
      return response.notFound({ message: 'Class not found' })
    }

    // Use provided academicPeriodId or fall back to active period
    let academicPeriodId = payload.academicPeriodId

    if (!academicPeriodId) {
      // Find active academic period for this school
      const academicPeriod = await AcademicPeriod.query()
        .where('schoolId', classRecord.schoolId)
        .where('isActive', true)
        .first()

      if (!academicPeriod) {
        return response.notFound({ message: 'No active academic period found' })
      }

      academicPeriodId = academicPeriod.id
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
      academicPeriodId,
      weight: 1,
    })

    await exam.load('class')
    await exam.load('subject')
    await exam.load('teacher')

    return response.created(exam)
  }
}
