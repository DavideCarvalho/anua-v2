import type { HttpContext } from '@adonisjs/core/http'
import Class_ from '#models/class'

export default class ShowClassBySlugController {
  async handle({ params, response }: HttpContext) {
    const classEntity = await Class_.query()
      .where('slug', params.slug)
      .preload('level')
      .preload('students')
      .preload('teachers')
      .first()

    if (!classEntity) {
      return response.notFound({ message: 'Turma não encontrada' })
    }

    return response.ok(classEntity)
  }
}
