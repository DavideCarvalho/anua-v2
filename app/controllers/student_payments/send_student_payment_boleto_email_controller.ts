import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Contract from '#models/contract'
import Student from '#models/student'
import StudentPayment from '#models/student_payment'
import { resolveAsaasConfig, sendAsaasPaymentEmail } from '#services/asaas_service'
import { sendAsaasBoletoEmailValidator } from '#validators/asaas'
import AppException from '#exceptions/app_exception'

export default class SendStudentPaymentBoletoEmailController {
  async handle({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(sendAsaasBoletoEmailValidator)

    const payment = await StudentPayment.find(params.id)
    if (!payment) {
      throw AppException.notFound('Pagamento nao encontrado')
    }

    if (!payment.paymentGatewayId) {
      throw AppException.badRequest('Pagamento nao possui cobranca no Asaas')
    }

    const student = await Student.query().where('id', payment.studentId).preload('user').first()
    if (!student?.user) {
      throw AppException.notFound('Aluno nao encontrado')
    }

    const contract = await Contract.query()
      .where('id', payment.contractId)
      .preload('school', (schoolQuery) => schoolQuery.preload('schoolChain'))
      .first()

    if (!contract?.school) {
      throw AppException.notFound('Contrato ou escola nao encontrados')
    }

    const config = resolveAsaasConfig(contract.school)
    if (!config) {
      throw AppException.badRequest('Configuracao do Asaas nao encontrada para esta escola')
    }

    const email = payload.email ?? student.user.email
    if (!email) {
      throw AppException.notFound('Email do destinatario nao encontrado')
    }

    await sendAsaasPaymentEmail(config.apiKey, payment.paymentGatewayId, email)

    payment.emailSentAt = DateTime.now()
    await payment.save()

    return response.ok({ message: 'Boleto enviado por email', email })
  }
}
