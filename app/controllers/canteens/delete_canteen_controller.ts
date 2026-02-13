import type { HttpContext } from '@adonisjs/core/http'
import Canteen from '#models/canteen'
import AppException from '#exceptions/app_exception'

export default class DeleteCanteenController {
  async handle({ params, response }: HttpContext) {
    const canteen = await Canteen.find(params.id)

    if (!canteen) {
      throw AppException.notFound('Cantina não encontrada')
    }

    await canteen.delete()

    return response.noContent()
  }
}
