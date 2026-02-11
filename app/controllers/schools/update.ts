import type { HttpContext } from '@adonisjs/core/http'
import School from '#models/school'
import { updateSchoolValidator } from '#validators/school'

export default class UpdateSchoolController {
  async handle({ params, request, response, selectedSchoolIds }: HttpContext) {
    const school = await School.query()
      .where('id', params.id)
      .whereIn('id', selectedSchoolIds ?? [])
      .first()

    if (!school) {
      return response.notFound({ message: 'Escola não encontrada' })
    }

    const data = await request.validateUsing(updateSchoolValidator)

    if (data.slug && data.slug !== school.slug) {
      const existingSchool = await School.findBy('slug', data.slug)
      if (existingSchool) {
        return response.conflict({ message: 'Já existe uma escola com este slug' })
      }
    }

    school.merge(data)
    await school.save()

    return response.ok(school)
  }
}
