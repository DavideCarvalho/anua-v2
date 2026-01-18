import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import PrintRequest from '#models/print_request'
import { createPrintRequestValidator } from '#validators/print_request'

export default class CreatePrintRequestController {
  async handle({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createPrintRequestValidator)

    const userId = auth.user?.id
    if (!userId) {
      return response.unauthorized({ message: 'Usuário não autenticado' })
    }

    const printRequest = await PrintRequest.create({
      userId,
      name: payload.name,
      path: payload.fileUrl,
      quantity: payload.quantity,
      dueDate: DateTime.fromJSDate(payload.dueDate),
      frontAndBack: payload.frontAndBack ?? false,
      status: 'REQUESTED',
    })

    await printRequest.load('user')

    return response.created(printRequest)
  }
}
