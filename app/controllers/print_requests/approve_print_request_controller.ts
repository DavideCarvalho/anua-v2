import type { HttpContext } from '@adonisjs/core/http'
import PrintRequest from '#models/print_request'
import AppException from '#exceptions/app_exception'
import PrintRequestTransformer from '#transformers/print_request_transformer'

export default class ApprovePrintRequestController {
  async handle({ params, response, serialize }: HttpContext) {
    const printRequest = await PrintRequest.find(params.id)
    if (!printRequest) {
      throw AppException.notFound('Solicitação não encontrada')
    }

    printRequest.status = 'APPROVED'
    await printRequest.save()

    return response.ok(await serialize(PrintRequestTransformer.transform(printRequest)))
  }
}
