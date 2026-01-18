import type { HttpContext } from '@adonisjs/core/http'
import Class_ from '#models/class'

export default class DeleteClassController {
  async handle({ params, response }: HttpContext) {
    const class_ = await Class_.find(params.id)

    if (!class_) {
      return response.notFound({ message: 'Turma não encontrada' })
    }

    await class_.delete()

    return response.noContent()
  }
}
