import type { HttpContext } from '@adonisjs/core/http'
import LevelAssignedToCourseHasAcademicPeriod from '#models/level_assigned_to_course_has_academic_period'
import { createLevelAssignmentValidator } from '#validators/level_assignment'

export default class CreateLevelAssignmentController {
  async handle({ request, response }: HttpContext) {
    let data
    try {
      data = await request.validateUsing(createLevelAssignmentValidator)
    } catch (error) {
      return response.badRequest({ message: 'Erro de validação', errors: error.messages })
    }

    const levelAssignment = await LevelAssignedToCourseHasAcademicPeriod.create({
      ...data,
      isActive: data.isActive ?? true,
    })

    return response.created(levelAssignment)
  }
}
