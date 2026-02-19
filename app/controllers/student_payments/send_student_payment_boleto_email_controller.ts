import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import Contract from '#models/contract'
import Student from '#models/student'
import StudentPayment from '#models/student_payment'
import AsaasService from '#services/asaas_service'
import { sendAsaasBoletoEmailValidator } from '#validators/asaas'
import AppException from '#exceptions/app_exception'

@inject()
export default class SendStudentPaymentBoletoEmailController {
  constructor(private asaasService: AsaasService) {}

  async handle({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(sendAsaasBoletoEmailValidator)

    const payment = await StudentPayment.find(params.id)
    if (!payment) {
      throw AppException.notFound('Pagamento não encontrado')
    }

    if (!payment.paymentGatewayId) {
      throw AppException.badRequest('Pagamento não possui cobrança no Asaas')
    }

    const student = await Student.query().where('id', payment.studentId).preload('user').first()
    if (!student?.user) {
      throw AppException.notFound('Aluno não encontrado')
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

    const email = payload.email ?? student.user.email
    if (!email) {
      throw AppException.notFound('E-mail do destinatário não encontrado')
    }

    await this.asaasService.sendAsaasPaymentEmail(config.apiKey, payment.paymentGatewayId, email)

    payment.emailSentAt = DateTime.now()
    await payment.save()

    return response.ok({ message: 'Boleto enviado por email', email })
  }
}
