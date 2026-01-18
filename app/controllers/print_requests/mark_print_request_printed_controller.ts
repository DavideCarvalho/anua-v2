import type { HttpContext } from '@adonisjs/core/http'
import PrintRequest from '#models/print_request'

export default class MarkPrintRequestPrintedController {
  async handle({ params, response }: HttpContext) {
    const printRequest = await PrintRequest.find(params.id)
    if (!printRequest) {
      return response.notFound({ message: 'Solicitação não encontrada' })
    }

    printRequest.status = 'PRINTED'
    await printRequest.save()

    return response.ok(printRequest)
  }
}
