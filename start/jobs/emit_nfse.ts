import logger from '@adonisjs/core/services/logger'
import app from '@adonisjs/core/services/app'
import { DateTime } from 'luxon'
import Invoice from '#models/invoice'
import Contract from '#models/contract'
import AsaasService from '#services/asaas_service'

interface EmitNfseOptions {
  invoiceId: string
}

export default class EmitNfse {
  static async handle({ invoiceId }: EmitNfseOptions) {
    const asaasService = await app.container.make(AsaasService)
    const invoice = await Invoice.query()
      .where('id', invoiceId)
      .preload('student', (q) => q.preload('user'))
      .preload('payments', (q) => {
        q.whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
        q.preload('contract')
      })
      .first()

    if (!invoice) {
      logger.warn(`[EMIT_NFSE] Invoice ${invoiceId} not found - skipping`)
      return
    }

    // Idempotency: skip if NFS-e already created
    if (invoice.nfseId) {
      logger.info(
        `[EMIT_NFSE] Invoice ${invoiceId} already has nfseId ${invoice.nfseId} - skipping`
      )
      return
    }

    // Only emit for PAID invoices
    if (invoice.status !== 'PAID') {
      logger.info(
        `[EMIT_NFSE] Invoice ${invoiceId} status is ${invoice.status}, not PAID - skipping`
      )
      return
    }

    // Must have a payment gateway ID (Asaas payment)
    if (!invoice.paymentGatewayId) {
      logger.warn(`[EMIT_NFSE] Invoice ${invoiceId} has no paymentGatewayId - skipping`)
      return
    }

    // Resolve school via first payment's contract
    const firstPayment = invoice.payments?.[0]
    if (!firstPayment?.contractId) {
      logger.warn(
        `[EMIT_NFSE] Invoice ${invoiceId} has no active payments with contract - skipping`
      )
      return
    }

    const contract = await Contract.query()
      .where('id', firstPayment.contractId)
      .preload('school', (sq) => sq.preload('schoolChain'))
      .first()

    const school = contract?.school
    if (!school) {
      logger.warn(`[EMIT_NFSE] No school found for invoice ${invoiceId} - skipping`)
      return
    }

    // Resolve Asaas config (need API key)
    const asaasConfig = asaasService.resolveAsaasConfig(school)
    if (!asaasConfig) {
      logger.info(`[EMIT_NFSE] No Asaas config for school ${school.id} - skipping`)
      return
    }

    // Resolve NFS-e config
    const nfseConfig = asaasService.resolveNfseConfig(school)
    if (!nfseConfig) {
      logger.info(`[EMIT_NFSE] NFS-e not enabled for school ${school.id} - skipping`)
      return
    }

    // Build service description
    const studentName = invoice.student?.user?.name ?? 'Aluno'
    const monthYear =
      invoice.month && invoice.year
        ? `${String(invoice.month).padStart(2, '0')}/${invoice.year}`
        : DateTime.now().toFormat('MM/yyyy')
    const serviceDescription = `Mensalidade escolar - ${monthYear} - ${studentName}`

    // Effective date = payment date or now
    const effectiveDate = (invoice.paidAt ?? DateTime.now()).toISODate()!

    try {
      const nfse = await asaasService.createAsaasNfse(asaasConfig.apiKey, {
        payment: invoice.paymentGatewayId,
        serviceDescription,
        effectiveDate,
        municipalServiceCode: nfseConfig.municipalServiceCode,
        municipalServiceName: nfseConfig.municipalServiceName,
        taxes: {
          retainIss: false,
          iss: nfseConfig.taxes.iss,
          cofins: nfseConfig.taxes.cofins,
          pis: nfseConfig.taxes.pis,
          csll: nfseConfig.taxes.csll,
          inss: nfseConfig.taxes.inss,
          ir: nfseConfig.taxes.ir,
        },
        deductions: nfseConfig.deductions,
      })

      invoice.nfseId = nfse.id
      invoice.nfseStatus = 'SCHEDULED'
      await invoice.save()

      logger.info(`[EMIT_NFSE] NFS-e ${nfse.id} created for invoice ${invoiceId}`)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      logger.error(`[EMIT_NFSE] Failed to create NFS-e for invoice ${invoiceId}: ${errorMsg}`)
      throw error
    }
  }
}
