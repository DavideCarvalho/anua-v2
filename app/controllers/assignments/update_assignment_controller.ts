import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Assignment from '#models/assignment'
import { updateAssignmentValidator } from '#validators/assignment'

export default class UpdateAssignmentController {
  async handle({ params, request, response }: HttpContext) {
    const { id } = params
    const payload = await request.validateUsing(updateAssignmentValidator)

    const assignment = await Assignment.find(id)

    if (!assignment) {
      return response.notFound({ message: 'Assignment not found' })
    }

    const updateData: Record<string, unknown> = {}

    if (payload.title !== undefined) {
      updateData.title = payload.title
    }
    if (payload.description !== undefined) {
      updateData.description = payload.description
    }
    if (payload.instructions !== undefined) {
      updateData.instructions = payload.instructions
    }
    if (payload.maxScore !== undefined) {
      updateData.maxScore = payload.maxScore
    }
    if (payload.status !== undefined) {
      updateData.status = payload.status
    }
    if (payload.dueDate !== undefined) {
      updateData.dueDate = DateTime.fromJSDate(payload.dueDate)
    }

    assignment.merge(updateData)
    await assignment.save()

    await assignment.load('class')
    await assignment.load('subject')
    await assignment.load('teacher')

    return response.ok(assignment)
  }
}
