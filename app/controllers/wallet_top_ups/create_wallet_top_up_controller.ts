import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { v7 as uuidv7 } from 'uuid'
import StudentHasResponsible from '#models/student_has_responsible'
import StudentHasLevel from '#models/student_has_level'
import WalletTopUp from '#models/wallet_top_up'
import WalletTopUpDto from '#models/dto/wallet_top_up.dto'
import AsaasService from '#services/asaas_service'
import { createWalletTopUpValidator } from '#validators/wallet_top_up'
import { DateTime } from 'luxon'
import AppException from '#exceptions/app_exception'

@inject()
export default class CreateWalletTopUpController {
  constructor(private asaasService: AsaasService) {}

  async handle({ request, response, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const payload = await request.validateUsing(createWalletTopUpValidator)

    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', payload.studentId)
      .where('isFinancial', true)
      .first()

    if (!relation) {
      throw AppException.forbidden('Você não tem permissão financeira para este aluno')
    }

    const studentHasLevel = await StudentHasLevel.query()
      .where('studentId', payload.studentId)
      .whereNull('deletedAt')
      .preload('level', (q) => q.preload('school', (sq) => sq.preload('schoolChain')))
      .orderBy('createdAt', 'desc')
      .first()

    if (!studentHasLevel?.level?.school) {
      throw AppException.notFound('Matrícula ou escola não encontrada')
    }

    const school = studentHasLevel.level.school
    const config = this.asaasService.resolveAsaasConfig(school)
    if (!config) {
      throw AppException.badRequest('Configuração de pagamento não encontrada para esta escola')
    }

    const customerId = await this.asaasService.getOrCreateAsaasCustomer(
      config.apiKey,
      effectiveUser
    )
    const topUpId = uuidv7()
    const dueDate = DateTime.now().toISODate()!

    // Create DB record first to prevent orphaned Asaas payments
    const topUp = await WalletTopUp.create({
      id: topUpId,
      studentId: payload.studentId,
      responsibleUserId: effectiveUser.id,
      amount: payload.amount,
      status: 'PENDING',
      paymentGateway: 'ASAAS',
      paymentGatewayId: null,
      paymentMethod: payload.paymentMethod,
    })

    const charge = await this.asaasService.createAsaasPayment(config.apiKey, {
      customer: customerId,
      billingType: payload.paymentMethod,
      value: payload.amount / 100,
      dueDate,
      description: 'Recarga de saldo',
      externalReference: topUpId,
    })

    // Update with Asaas payment ID
    topUp.paymentGatewayId = charge.id
    await topUp.save()

    const paymentDetails: Record<string, string | null> = {
      invoiceUrl: charge.invoiceUrl ?? null,
      bankSlipUrl: charge.bankSlipUrl ?? null,
      pixQrCodeImage: null,
      pixCopyPaste: null,
    }

    if (payload.paymentMethod === 'PIX') {
      try {
        const pixData = await this.asaasService.fetchAsaasPixQrCode(config.apiKey, charge.id)
        paymentDetails.pixQrCodeImage = pixData.encodedImage
        paymentDetails.pixCopyPaste = pixData.payload
      } catch {
        const details = await this.asaasService.fetchAsaasPayment(config.apiKey, charge.id)
        paymentDetails.invoiceUrl = details.invoiceUrl ?? null
      }
    }

    return response.created({ topUp: new WalletTopUpDto(topUp), paymentDetails })
  }
}
