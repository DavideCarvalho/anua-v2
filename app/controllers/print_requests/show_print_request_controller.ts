import type { HttpContext } from '@adonisjs/core/http'
import PrintRequest from '#models/print_request'
import AppException from '#exceptions/app_exception'
import PrintRequestTransformer from '#transformers/print_request_transformer'

export default class ShowPrintRequestController {
  async handle({ params, response, serialize }: HttpContext) {
    const printRequest = await PrintRequest.query().where('id', params.id).preload('user').first()

    if (!printRequest) {
      throw AppException.notFound('Solicitação não encontrada')
    }

    return response.ok(await serialize(PrintRequestTransformer.transform(printRequest)))
  }
}
