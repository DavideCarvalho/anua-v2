import type { HttpContext } from '@adonisjs/core/http'
import Class_ from '#models/class'
import { updateClassValidator } from '#validators/class'

export default class UpdateClassController {
  async handle({ params, request, response }: HttpContext) {
    const classEntity = await Class_.find(params.id)

    if (!classEntity) {
      return response.notFound({ message: 'Turma não encontrada' })
    }

    const data = await request.validateUsing(updateClassValidator)

    classEntity.merge(data)
    await classEntity.save()

    return response.ok(classEntity)
  }
}
