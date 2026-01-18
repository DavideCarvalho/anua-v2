import type { HttpContext } from '@adonisjs/core/http'
import Contract from '#models/contract'
import StudentPayment from '#models/student_payment'
import { fetchAsaasPayment, resolveAsaasConfig } from '#services/asaas_service'

export default class GetStudentPaymentBoletoController {
  async handle({ params, response }: HttpContext) {
    const payment = await StudentPayment.find(params.id)
    if (!payment) {
      return response.notFound({ message: 'Pagamento não encontrado' })
    }

    if (!payment.paymentGatewayId) {
      return response.badRequest({ message: 'Pagamento não possui cobrança no Asaas' })
    }

    const contract = await Contract.query()
      .where('id', payment.contractId)
      .preload('school', (schoolQuery) => schoolQuery.preload('schoolChain'))
      .first()

    if (!contract?.school) {
      return response.notFound({ message: 'Contrato ou escola não encontrados' })
    }

    const config = resolveAsaasConfig(contract.school)
    if (!config) {
      return response.badRequest({
        message: 'Configuração do Asaas não encontrada para esta escola',
      })
    }

    const details = await fetchAsaasPayment(config.apiKey, payment.paymentGatewayId)

    if (details.bankSlipUrl || details.invoiceUrl) {
      payment.invoiceUrl = details.bankSlipUrl ?? details.invoiceUrl ?? null
      await payment.save()
    }

    return response.ok({
      invoiceUrl: details.invoiceUrl ?? payment.invoiceUrl,
      bankSlipUrl: details.bankSlipUrl ?? null,
    })
  }
}
