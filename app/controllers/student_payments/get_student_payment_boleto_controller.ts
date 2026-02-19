import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import Contract from '#models/contract'
import StudentPayment from '#models/student_payment'
import AsaasService from '#services/asaas_service'
import AppException from '#exceptions/app_exception'

@inject()
export default class GetStudentPaymentBoletoController {
  constructor(private asaasService: AsaasService) {}

  async handle({ params, response }: HttpContext) {
    const payment = await StudentPayment.find(params.id)
    if (!payment) {
      throw AppException.notFound('Pagamento não encontrado')
    }

    if (!payment.paymentGatewayId) {
      throw AppException.badRequest('Pagamento não possui cobrança no Asaas')
    }

    const contract = await Contract.query()
      .where('id', payment.contractId)
      .preload('school', (schoolQuery) => schoolQuery.preload('schoolChain'))
      .first()

    if (!contract?.school) {
      throw AppException.notFound('Contrato ou escola não encontrados')
    }

    const config = this.asaasService.resolveAsaasConfig(contract.school)
    if (!config) {
      throw AppException.badRequest('Configuração do Asaas não encontrada para esta escola')
    }

    const details = await this.asaasService.fetchAsaasPayment(
      config.apiKey,
      payment.paymentGatewayId
    )

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
