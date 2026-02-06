import type { HttpContext } from '@adonisjs/core/http'
import ExtraClass from '#models/extra_class'

export default class DeleteExtraClassController {
  async handle({ params, response }: HttpContext) {
    const extraClass = await ExtraClass.find(params.id)

    if (!extraClass) {
      return response.notFound({ message: 'Aula avulsa não encontrada' })
    }

    extraClass.isActive = false
    await extraClass.save()

    return response.noContent()
  }
}
