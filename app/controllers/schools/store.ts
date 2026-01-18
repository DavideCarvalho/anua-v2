import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'
import { createSchoolValidator } from '#validators/school'

export default class StoreSchoolController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createSchoolValidator)

    const existingSchool = await School.findBy('slug', data.slug)
    if (existingSchool) {
      return response.conflict({ message: 'Já existe uma escola com este slug' })
    }

    const school = await School.create(data)

    return response.created(school)
  }
}
