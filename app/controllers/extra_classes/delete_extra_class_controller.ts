import type { HttpContext } from '@adonisjs/core/http'
import ExtraClass from '#models/extra_class'
import AppException from '#exceptions/app_exception'

export default class DeleteExtraClassController {
  async handle({ params, response }: HttpContext) {
    const extraClass = await ExtraClass.find(params.id)

    if (!extraClass) {
      throw AppException.notFound('Aula avulsa não encontrada')
    }

    extraClass.isActive = false
    await extraClass.save()

    return response.noContent()
  }
}
