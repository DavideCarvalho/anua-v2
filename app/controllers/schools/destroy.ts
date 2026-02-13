import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'
import AppException from '#exceptions/app_exception'

export default class DestroySchoolController {
  async handle({ params, response }: HttpContext) {
    const school = await School.find(params.id)

    if (!school) {
      throw AppException.notFound('Escola não encontrada')
    }

    await school.delete()

    return response.noContent()
  }
}
