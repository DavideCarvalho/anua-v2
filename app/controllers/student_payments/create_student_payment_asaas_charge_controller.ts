import type { HttpContext } from '@adonisjs/core/http'
import Contract from '#models/contract'
import Student from '#models/student'
import StudentPayment from '#models/student_payment'
import {
  createAsaasPayment,
  fetchAsaasPayment,
  getOrCreateAsaasCustomer,
  resolveAsaasConfig,
} from '#services/asaas_service'
import { createAsaasChargeValidator } from '#validators/asaas'
import AppException from '#exceptions/app_exception'

export default class CreateStudentPaymentAsaasChargeController {
  async handle({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(createAsaasChargeValidator)

    const payment = await StudentPayment.find(params.id)
    if (!payment) {
      throw AppException.notFound('Pagamento não encontrado')
    }

    const student = await Student.query().where('id', payment.studentId).preload('user').first()
    if (!student || !student.user) {
      throw AppException.notFound('Aluno não encontrado')
    }

    const contract = await Contract.query()
      .where('id', payment.contractId)
      .preload('school', (schoolQuery) => schoolQuery.preload('schoolChain'))
      .first()

    if (!contract?.school) {
      throw AppException.notFound('Contrato ou escola não encontrados')
    }

    const config = resolveAsaasConfig(contract.school)
    if (!config) {
      throw AppException.badRequest('Configuração do Asaas não encontrada para esta escola')
    }

    if (payment.paymentGatewayId) {
      const existingPayment = await fetchAsaasPayment(config.apiKey, payment.paymentGatewayId)
      payment.invoiceUrl =
        existingPayment.bankSlipUrl ?? existingPayment.invoiceUrl ?? payment.invoiceUrl
      await payment.save()
      await payment.load('student')
      return response.ok(payment)
    }

    const customerId = await getOrCreateAsaasCustomer(config.apiKey, student.user)

    const dueDate = payment.dueDate?.toISODate()
    if (!dueDate) {
      throw AppException.badRequest('Data de vencimento inválida')
    }

    const totalAmount = payment.totalAmount ?? payment.amount
    const value = totalAmount / 100

    const charge = await createAsaasPayment(config.apiKey, {
      customer: customerId,
      billingType: payload.billingType ?? 'BOLETO',
      value,
      dueDate,
      description: `Pagamento ${payment.type} ${payment.month}/${payment.year}`,
      externalReference: payment.id,
    })

    payment.paymentGateway = 'ASAAS'
    payment.paymentGatewayId = charge.id
    payment.invoiceUrl = charge.bankSlipUrl ?? charge.invoiceUrl ?? null
    payment.status = 'PENDING'

    await payment.save()
    await payment.load('student')

    return response.created(payment)
  }
}
