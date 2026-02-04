import type { HttpContext } from '@adonisjs/core/http'
import GenerateMissingPayments from '#start/jobs/generate_missing_payments'

export default class TriggerMissingPaymentsController {
  async handle({ request, response }: HttpContext) {
    const schoolId = request.input('schoolId') as string | undefined

    const result = await GenerateMissingPayments.handle({ schoolId, inline: true })

    return response.ok({
      message: 'Geração de mensalidades executada',
      ...result,
    })
  }
}
