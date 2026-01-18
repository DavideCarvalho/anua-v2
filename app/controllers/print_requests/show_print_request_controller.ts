import type { HttpContext } from '@adonisjs/core/http'
import PrintRequest from '#models/print_request'

export default class ShowPrintRequestController {
  async handle({ params, response }: HttpContext) {
    const printRequest = await PrintRequest.query().where('id', params.id).preload('user').first()

    if (!printRequest) {
      return response.notFound({ message: 'Solicitação não encontrada' })
    }

    return response.ok(printRequest)
  }
}
