import type { HttpContext } from '@adonisjs/core/http'
import ContractPaymentDay from '#models/contract_payment_day'
import AppException from '#exceptions/app_exception'

export default class RemoveContractPaymentDayController {
  async handle({ params }: HttpContext) {
    const { contractId, id } = params

    const paymentDay = await ContractPaymentDay.query()
      .where('id', id)
      .where('contractId', contractId)
      .first()

    if (!paymentDay) {
      throw AppException.notFound('Dia de pagamento não encontrado')
    }

    await paymentDay.delete()
  }
}
