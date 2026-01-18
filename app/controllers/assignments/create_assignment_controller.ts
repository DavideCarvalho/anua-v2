import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Assignment from '#models/assignment'
import { createAssignmentValidator } from '#validators/assignment'

export default class CreateAssignmentController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createAssignmentValidator)

    const assignment = await Assignment.create({
      title: payload.title,
      description: payload.description,
      instructions: payload.instructions,
      maxScore: payload.maxScore,
      status: payload.status || 'DRAFT',
      dueDate: DateTime.fromJSDate(payload.dueDate),
      classId: payload.classId,
      subjectId: payload.subjectId,
      teacherId: payload.teacherId,
    })

    await assignment.load('class')
    await assignment.load('subject')
    await assignment.load('teacher')

    return response.created(assignment)
  }
}
