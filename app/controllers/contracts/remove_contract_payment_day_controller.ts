import type { HttpContext } from '@adonisjs/core/http'
import ContractPaymentDay from '#models/contract_payment_day'

export default class RemoveContractPaymentDayController {
  async handle({ params, response }: HttpContext) {
    const { contractId, id } = params

    const paymentDay = await ContractPaymentDay.query()
      .where('id', id)
      .where('contractId', contractId)
      .first()

    if (!paymentDay) {
      return response.notFound({ message: 'Payment day not found' })
    }

    await paymentDay.delete()

    return response.noContent()
  }
}
