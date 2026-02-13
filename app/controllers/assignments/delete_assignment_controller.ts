import type { HttpContext } from '@adonisjs/core/http'
import Assignment from '#models/assignment'
import AppException from '#exceptions/app_exception'

export default class DeleteAssignmentController {
  async handle({ params, response }: HttpContext) {
    const { id } = params

    const assignment = await Assignment.find(id)

    if (!assignment) {
      throw AppException.notFound('Atividade não encontrada')
    }

    await assignment.delete()

    return response.noContent()
  }
}
