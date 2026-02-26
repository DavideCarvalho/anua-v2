import type { HttpContext } from '@adonisjs/core/http'
import Class_ from '#models/class'
import ClassDetailDto from '#models/dto/class_detail.dto'
import AppException from '#exceptions/app_exception'

export default class ShowClassBySlugController {
  async handle({ params, response }: HttpContext) {
    const classEntity = await Class_.query()
      .where('slug', params.slug)
      .preload('level')
      .preload('students')
      .preload('teachers')
      .first()

    if (!classEntity) {
      throw AppException.notFound('Turma não encontrada')
    }

    return response.ok(new ClassDetailDto(classEntity))
  }
}
