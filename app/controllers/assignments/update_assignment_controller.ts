import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Assignment from '#models/assignment'
import { updateAssignmentValidator } from '#validators/assignment'
import AppException from '#exceptions/app_exception'

export default class UpdateAssignmentController {
  async handle({ params, request, response }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(updateAssignmentValidator)

    const assignment = await Assignment.find(id)

    if (!assignment) {
      throw AppException.notFound('Atividade não encontrada')
    }

    const updateData: Record<string, unknown> = {}

    if (payload.title !== undefined) {
      updateData.name = payload.title
    }
    if (payload.description !== undefined) {
      updateData.description = payload.description
    }
    if (payload.maxScore !== undefined) {
      updateData.grade = payload.maxScore
    }
    if (payload.dueDate !== undefined) {
      updateData.dueDate = DateTime.fromJSDate(payload.dueDate)
    }

    assignment.merge(updateData)
    await assignment.save()

    await assignment.load('teacherHasClass', (query) => {
      query.preload('class')
      query.preload('subject')
      query.preload('teacher')
    })

    return response.ok(assignment)
  }
}
