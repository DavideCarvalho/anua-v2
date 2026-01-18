import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import PrintRequest from '#models/print_request'
import { reviewPrintRequestValidator } from '#validators/print_request'

export default class ReviewPrintRequestController {
  async handle({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(reviewPrintRequestValidator)

    const printRequest = await PrintRequest.find(params.id)
    if (!printRequest) {
      return response.notFound({ message: 'Solicitação não encontrada' })
    }

    printRequest.merge({
      name: payload.name,
      path: payload.fileUrl,
      quantity: payload.quantity,
      dueDate: DateTime.fromJSDate(payload.dueDate),
      frontAndBack: payload.frontAndBack ?? false,
      status: 'REQUESTED',
    })

    await printRequest.save()

    return response.ok(printRequest)
  }
}
