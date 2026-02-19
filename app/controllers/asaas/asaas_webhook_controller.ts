import type { HttpContext } from '@adonisjs/core/http'
import type { Request } from '@adonisjs/core/http'
import { timingSafeEqual } from 'node:crypto'
import Contract from '#models/contract'
import School from '#models/school'
import StudentHasLevel from '#models/student_has_level'
import StudentPayment from '#models/student_payment'
import WalletTopUp from '#models/wallet_top_up'
import WebhookEvent from '#models/webhook_event'
import AppException from '#exceptions/app_exception'
import ProcessAsaasPaymentWebhookJob from '#jobs/asaas/process_asaas_payment_webhook_job'
import ProcessAsaasWalletTopUpWebhookJob from '#jobs/asaas/process_asaas_wallet_topup_webhook_job'
import ProcessAsaasAccountStatusWebhookJob from '#jobs/asaas/process_asaas_account_status_webhook_job'
import ProcessAsaasInvoiceWebhookJob from '#jobs/asaas/process_asaas_invoice_webhook_job'
import ProcessAsaasNfseWebhookJob from '#jobs/asaas/process_asaas_nfse_webhook_job'
import Invoice from '#models/invoice'
import WebhookEventDto from '#models/dto/webhook_event.dto'

type AsaasPaymentEvent =
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_OVERDUE'
  | 'PAYMENT_DELETED'
  | 'PAYMENT_CREATED'
  | 'PAYMENT_UPDATED'
  | 'PAYMENT_REFUNDED'
  | 'PAYMENT_CHARGEBACK_REQUESTED'

type AsaasAccountStatusEvent =
  | 'ACCOUNT_STATUS_BANK_ACCOUNT_INFO_APPROVED'
  | 'ACCOUNT_STATUS_BANK_ACCOUNT_INFO_AWAITING_APPROVAL'
  | 'ACCOUNT_STATUS_BANK_ACCOUNT_INFO_PENDING'
  | 'ACCOUNT_STATUS_BANK_ACCOUNT_INFO_REJECTED'
  | 'ACCOUNT_STATUS_COMMERCIAL_INFO_APPROVED'
  | 'ACCOUNT_STATUS_COMMERCIAL_INFO_AWAITING_APPROVAL'
  | 'ACCOUNT_STATUS_COMMERCIAL_INFO_PENDING'
  | 'ACCOUNT_STATUS_COMMERCIAL_INFO_REJECTED'
  | 'ACCOUNT_STATUS_COMMERCIAL_INFO_EXPIRING_SOON'
  | 'ACCOUNT_STATUS_COMMERCIAL_INFO_EXPIRED'
  | 'ACCOUNT_STATUS_DOCUMENT_APPROVED'
  | 'ACCOUNT_STATUS_DOCUMENT_AWAITING_APPROVAL'
  | 'ACCOUNT_STATUS_DOCUMENT_PENDING'
  | 'ACCOUNT_STATUS_DOCUMENT_REJECTED'
  | 'ACCOUNT_STATUS_GENERAL_APPROVAL_APPROVED'
  | 'ACCOUNT_STATUS_GENERAL_APPROVAL_AWAITING_APPROVAL'
  | 'ACCOUNT_STATUS_GENERAL_APPROVAL_PENDING'
  | 'ACCOUNT_STATUS_GENERAL_APPROVAL_REJECTED'

type AsaasNfseEvent =
  | 'INVOICE_AUTHORIZED'
  | 'INVOICE_PROCESSING_CANCELLATION'
  | 'INVOICE_CANCELED'
  | 'INVOICE_CANCELLATION_DENIED'
  | 'INVOICE_ERROR'

type AsaasWebhookEvent = AsaasPaymentEvent | AsaasAccountStatusEvent | AsaasNfseEvent

interface AsaasWebhookPayload {
  event: AsaasWebhookEvent
  payment?: {
    id: string
    status: string
    billingType: string
    externalReference?: string
    paymentDate?: string
    confirmedDate?: string
    dueDate?: string
    invoiceUrl?: string
    bankSlipUrl?: string
  }
  invoice?: {
    id: string
    payment?: string
    status?: string
    number?: string
    rpsSerie?: string
    rpsNumber?: string
    pdfUrl?: string
    xmlUrl?: string
    effectiveDate?: string
    error?: string
  }
  account?: {
    id: string
  }
}

const ACCOUNT_STATUS_EVENTS: AsaasAccountStatusEvent[] = [
  'ACCOUNT_STATUS_BANK_ACCOUNT_INFO_APPROVED',
  'ACCOUNT_STATUS_BANK_ACCOUNT_INFO_AWAITING_APPROVAL',
  'ACCOUNT_STATUS_BANK_ACCOUNT_INFO_PENDING',
  'ACCOUNT_STATUS_BANK_ACCOUNT_INFO_REJECTED',
  'ACCOUNT_STATUS_COMMERCIAL_INFO_APPROVED',
  'ACCOUNT_STATUS_COMMERCIAL_INFO_AWAITING_APPROVAL',
  'ACCOUNT_STATUS_COMMERCIAL_INFO_PENDING',
  'ACCOUNT_STATUS_COMMERCIAL_INFO_REJECTED',
  'ACCOUNT_STATUS_COMMERCIAL_INFO_EXPIRING_SOON',
  'ACCOUNT_STATUS_COMMERCIAL_INFO_EXPIRED',
  'ACCOUNT_STATUS_DOCUMENT_APPROVED',
  'ACCOUNT_STATUS_DOCUMENT_AWAITING_APPROVAL',
  'ACCOUNT_STATUS_DOCUMENT_PENDING',
  'ACCOUNT_STATUS_DOCUMENT_REJECTED',
  'ACCOUNT_STATUS_GENERAL_APPROVAL_APPROVED',
  'ACCOUNT_STATUS_GENERAL_APPROVAL_AWAITING_APPROVAL',
  'ACCOUNT_STATUS_GENERAL_APPROVAL_PENDING',
  'ACCOUNT_STATUS_GENERAL_APPROVAL_REJECTED',
]

const NFSE_EVENTS: AsaasNfseEvent[] = [
  'INVOICE_AUTHORIZED',
  'INVOICE_PROCESSING_CANCELLATION',
  'INVOICE_CANCELED',
  'INVOICE_CANCELLATION_DENIED',
  'INVOICE_ERROR',
]

export default class AsaasWebhookController {
  async handle({ request, response }: HttpContext) {
    const payload = request.body() as AsaasWebhookPayload
    const webhookToken = this.getWebhookToken(request)

    if (!webhookToken) {
      throw AppException.invalidWebhookToken()
    }

    if (!payload?.event) {
      throw AppException.invalidWebhookPayload()
    }

    // Route account status events
    if (ACCOUNT_STATUS_EVENTS.includes(payload.event as AsaasAccountStatusEvent)) {
      return this.enqueueAccountStatus(payload, webhookToken, response)
    }

    // Route NFS-e (invoice) events
    if (NFSE_EVENTS.includes(payload.event as AsaasNfseEvent)) {
      return this.enqueueNfseEvent(payload, webhookToken, response)
    }

    // Payment events require payment data
    if (!payload?.payment?.id) {
      throw AppException.invalidWebhookPayload()
    }

    if (!payload.payment.externalReference) {
      throw AppException.missingExternalReference()
    }

    // Idempotency: build unique event key
    const eventId = `asaas:${payload.event}:${payload.payment.id}`

    const existing = await WebhookEvent.query().where('eventId', eventId).first()
    if (existing) {
      return response.ok(new WebhookEventDto(existing))
    }

    // Try StudentPayment first
    const payment = await StudentPayment.find(payload.payment.externalReference)
    if (payment) {
      return this.enqueueStudentPayment(payment, payload, webhookToken, eventId, response)
    }

    // Try Invoice
    const invoice = await Invoice.find(payload.payment.externalReference)
    if (invoice) {
      return this.enqueueInvoicePayment(invoice, payload, webhookToken, eventId, response)
    }

    // Try WalletTopUp
    const topUp = await WalletTopUp.find(payload.payment.externalReference)
    if (topUp) {
      return this.enqueueWalletTopUp(topUp, payload, webhookToken, eventId, response)
    }

    throw AppException.notFound('Pagamento não encontrado')
  }

  private async enqueueAccountStatus(
    payload: AsaasWebhookPayload,
    webhookToken: string,
    response: HttpContext['response']
  ) {
    // Validate against platform-level webhook token
    const platformToken = process.env.ASAAS_WEBHOOK_TOKEN
    if (!this.isWebhookTokenValid(platformToken ?? null, webhookToken)) {
      throw AppException.invalidWebhookToken()
    }

    const accountId = payload.account?.id
    if (!accountId) {
      throw AppException.invalidWebhookPayload()
    }

    // Verify the school exists
    const school = await School.query().where('asaasAccountId', accountId).first()
    if (!school) {
      throw AppException.notFound('Escola não encontrada para esta conta Asaas')
    }

    // Idempotency
    const eventId = `asaas:${payload.event}:${accountId}`
    const existing = await WebhookEvent.query().where('eventId', eventId).first()
    if (existing) {
      return response.ok(new WebhookEventDto(existing))
    }

    const webhookEvent = await WebhookEvent.create({
      eventId,
      provider: 'ASAAS',
      eventType: payload.event,
      payload: payload as unknown as Record<string, unknown>,
      status: 'PENDING',
      attempts: 0,
    })

    await ProcessAsaasAccountStatusWebhookJob.dispatch({ webhookEventId: webhookEvent.id })

    return response.ok(new WebhookEventDto(webhookEvent))
  }

  private async enqueueStudentPayment(
    payment: StudentPayment,
    payload: AsaasWebhookPayload,
    webhookToken: string,
    eventId: string,
    response: HttpContext['response']
  ) {
    const contract = await Contract.query()
      .where('id', payment.contractId)
      .preload('school', (schoolQuery) => schoolQuery.preload('schoolChain'))
      .first()

    const expectedToken =
      contract?.school?.asaasWebhookToken ??
      contract?.school?.schoolChain?.asaasWebhookToken ??
      null

    if (!this.isWebhookTokenValid(expectedToken, webhookToken)) {
      throw AppException.invalidWebhookToken()
    }

    const webhookEvent = await WebhookEvent.create({
      eventId,
      provider: 'ASAAS',
      eventType: payload.event,
      payload: payload as unknown as Record<string, unknown>,
      status: 'PENDING',
      attempts: 0,
    })

    await ProcessAsaasPaymentWebhookJob.dispatch({ webhookEventId: webhookEvent.id })

    return response.ok(new WebhookEventDto(webhookEvent))
  }

  private async enqueueInvoicePayment(
    invoice: Invoice,
    payload: AsaasWebhookPayload,
    webhookToken: string,
    eventId: string,
    response: HttpContext['response']
  ) {
    // Resolve escola via Invoice → primeiro StudentPayment → Contract → School
    await invoice.load('payments', (q) => q.limit(1))
    const firstPayment = invoice.payments?.[0]

    if (!firstPayment) {
      throw AppException.notFound('Invoice sem pagamentos vinculados')
    }

    const contract = await Contract.query()
      .where('id', firstPayment.contractId)
      .preload('school', (schoolQuery) => schoolQuery.preload('schoolChain'))
      .first()

    const expectedToken =
      contract?.school?.asaasWebhookToken ??
      contract?.school?.schoolChain?.asaasWebhookToken ??
      null

    if (!this.isWebhookTokenValid(expectedToken, webhookToken)) {
      throw AppException.invalidWebhookToken()
    }

    const webhookEvent = await WebhookEvent.create({
      eventId,
      provider: 'ASAAS',
      eventType: payload.event,
      payload: payload as unknown as Record<string, unknown>,
      status: 'PENDING',
      attempts: 0,
    })

    await ProcessAsaasInvoiceWebhookJob.dispatch({ webhookEventId: webhookEvent.id })

    return response.ok(new WebhookEventDto(webhookEvent))
  }

  private async enqueueWalletTopUp(
    topUp: WalletTopUp,
    payload: AsaasWebhookPayload,
    webhookToken: string,
    eventId: string,
    response: HttpContext['response']
  ) {
    // Validate webhook token via student's school
    const studentHasLevel = await StudentHasLevel.query()
      .where('studentId', topUp.studentId)
      .whereNull('deletedAt')
      .preload('level', (q) => q.preload('school', (sq) => sq.preload('schoolChain')))
      .orderBy('createdAt', 'desc')
      .first()

    const school = studentHasLevel?.level?.school
    const expectedToken =
      school?.asaasWebhookToken ?? school?.schoolChain?.asaasWebhookToken ?? null

    if (!this.isWebhookTokenValid(expectedToken, webhookToken)) {
      throw AppException.invalidWebhookToken()
    }

    const webhookEvent = await WebhookEvent.create({
      eventId,
      provider: 'ASAAS',
      eventType: payload.event,
      payload: payload as unknown as Record<string, unknown>,
      status: 'PENDING',
      attempts: 0,
    })

    await ProcessAsaasWalletTopUpWebhookJob.dispatch({ webhookEventId: webhookEvent.id })

    return response.ok(new WebhookEventDto(webhookEvent))
  }

  private async enqueueNfseEvent(
    payload: AsaasWebhookPayload,
    webhookToken: string,
    response: HttpContext['response']
  ) {
    if (!payload.invoice?.id) {
      throw AppException.invalidWebhookPayload()
    }

    const nfseId = payload.invoice.id
    const paymentId = payload.invoice.payment

    // Try to find the local invoice by nfseId or paymentGatewayId
    let invoice: Invoice | null = null
    invoice = await Invoice.query().where('nfseId', nfseId).first()
    if (!invoice && paymentId) {
      invoice = await Invoice.query().where('paymentGatewayId', paymentId).first()
    }

    if (!invoice) {
      throw AppException.notFound('Invoice não encontrada para esta NFS-e')
    }

    // Validate webhook token via invoice's school
    await invoice.load('payments', (q) => q.limit(1))
    const firstPayment = invoice.payments?.[0]

    if (!firstPayment) {
      throw AppException.notFound('Invoice sem pagamentos vinculados')
    }

    const contract = await Contract.query()
      .where('id', firstPayment.contractId)
      .preload('school', (schoolQuery) => schoolQuery.preload('schoolChain'))
      .first()

    const expectedToken =
      contract?.school?.asaasWebhookToken ??
      contract?.school?.schoolChain?.asaasWebhookToken ??
      null

    if (!this.isWebhookTokenValid(expectedToken, webhookToken)) {
      throw AppException.invalidWebhookToken()
    }

    // Idempotency
    const eventId = `asaas:${payload.event}:${nfseId}`
    const existing = await WebhookEvent.query().where('eventId', eventId).first()
    if (existing) {
      return response.ok(new WebhookEventDto(existing))
    }

    const webhookEvent = await WebhookEvent.create({
      eventId,
      provider: 'ASAAS',
      eventType: payload.event,
      payload: payload as unknown as Record<string, unknown>,
      status: 'PENDING',
      attempts: 0,
    })

    await ProcessAsaasNfseWebhookJob.dispatch({ webhookEventId: webhookEvent.id })

    return response.ok(new WebhookEventDto(webhookEvent))
  }

  private getWebhookToken(request: Request): string | null {
    const token = request.header('x-asaas-webhook-token')
    return token?.trim() || null
  }

  private isWebhookTokenValid(expectedToken: string | null, receivedToken: string): boolean {
    if (!expectedToken) {
      return false
    }

    const expected = Buffer.from(expectedToken)
    const received = Buffer.from(receivedToken)

    if (expected.length !== received.length) {
      return false
    }

    return timingSafeEqual(expected, received)
  }
}
