import type { HttpContext } from '@adonisjs/core/http'
import PrintRequest from '#models/print_request'
import { rejectPrintRequestValidator } from '#validators/print_request'
import AppException from '#exceptions/app_exception'

export default class RejectPrintRequestController {
  async handle({ params, request, response }: HttpContext) {
    const { reason } = await request.validateUsing(rejectPrintRequestValidator)

    const printRequest = await PrintRequest.find(params.id)
    if (!printRequest) {
      throw AppException.notFound('Solicitação não encontrada')
    }

    printRequest.status = 'REJECTED'
    printRequest.rejectedFeedback = reason
    await printRequest.save()

    return response.ok(printRequest)
  }
}
