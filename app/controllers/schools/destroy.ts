import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'

export default class DestroySchoolController {
  async handle({ params, response }: HttpContext) {
    const school = await School.find(params.id)

    if (!school) {
      return response.notFound({ message: 'Escola não encontrada' })
    }

    await school.delete()

    return response.noContent()
  }
}
