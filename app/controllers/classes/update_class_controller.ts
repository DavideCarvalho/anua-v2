import type { HttpContext } from '@adonisjs/core/http'
import Class_ from '#models/class'
import { updateClassValidator } from '#validators/class'

export default class UpdateClassController {
  async handle({ params, request, response }: HttpContext) {
    const class_ = await Class_.find(params.id)

    if (!class_) {
      return response.notFound({ message: 'Turma não encontrada' })
    }

    const data = await request.validateUsing(updateClassValidator)

    class_.merge(data)
    await class_.save()

    return response.ok(class_)
  }
}
