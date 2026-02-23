import logger from '@adonisjs/core/services/logger'
import app from '@adonisjs/core/services/app'
import { DateTime } from 'luxon'
import Invoice from '#models/invoice'
import Contract from '#models/contract'
import AsaasService from '#services/asaas_service'
import type School from '#models/school'
import BillingReconciliationService from '#services/payments/billing_reconciliation_service'

interface ApplyInvoiceInterestOptions {
  schoolId?: string
}

/**
 * Recalcula invoices OVERDUE usando o reconciliador canônico de cobrança.
 *
 * Mantém a responsabilidade de cancelar cobranças antigas no Asaas quando o
 * valor da invoice muda após o recálculo.
 */
export default class ApplyInvoiceInterest {
  static async handle(options: ApplyInvoiceInterestOptions = {}) {
    const asaasService = await app.container.make(AsaasService)
    const startTime = Date.now()
    const today = DateTime.now().startOf('day')

    logger.info('[INTEREST] Starting invoice interest calculation', {
      schoolId: options.schoolId ?? 'all',
      date: today.toISODate(),
    })

    let updated = 0
    let skipped = 0
    let chargesCancelled = 0
    let errors = 0

    try {
      const invoiceQuery = Invoice.query().where('status', 'OVERDUE').where('totalAmount', '>', 0)

      if (options.schoolId) {
        invoiceQuery.whereHas('payments', (q) => {
          q.whereHas('contract', (cq) => {
            cq.where('schoolId', options.schoolId!)
          })
        })
      }

      const invoices = await invoiceQuery

      if (invoices.length === 0) {
        logger.info('[INTEREST] No overdue invoices with contracts found')
        return { updated, skipped, chargesCancelled, errors }
      }

      logger.info(`[INTEREST] Found ${invoices.length} overdue invoices to process`)

      const schoolCache = new Map<string, School | null>()

      for (const invoice of invoices) {
        try {
          const result = await BillingReconciliationService.reconcileByInvoiceId(invoice.id)

          if (!result.updated) {
            skipped++
            continue
          }

          updated++

          if (!result.staleChargeId || !result.contractId) {
            continue
          }

          try {
            if (!schoolCache.has(result.contractId)) {
              const contract = await Contract.query()
                .where('id', result.contractId)
                .preload('school', (sq) => sq.preload('schoolChain'))
                .first()
              schoolCache.set(result.contractId, contract?.school ?? null)
            }

            const school = schoolCache.get(result.contractId)
            if (!school) {
              continue
            }

            const asaasConfig = asaasService.resolveAsaasConfig(school)
            if (!asaasConfig) {
              continue
            }

            await asaasService.deleteAsaasPayment(asaasConfig.apiKey, result.staleChargeId)
            chargesCancelled++
            logger.info(
              `[INTEREST] Cancelled stale Asaas charge ${result.staleChargeId} for invoice ${invoice.id}`
            )
          } catch (cancelError) {
            logger.warn(
              `[INTEREST] Failed to cancel Asaas charge ${result.staleChargeId} for invoice ${invoice.id}:`,
              {
                error: cancelError instanceof Error ? cancelError.message : String(cancelError),
              }
            )
          }
        } catch (error) {
          errors++
          logger.error(`[INTEREST] Error processing invoice ${invoice.id}:`, {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          })
        }
      }

      const duration = Date.now() - startTime
      logger.info('[INTEREST] Invoice interest calculation completed', {
        updated,
        skipped,
        chargesCancelled,
        errors,
        duration: `${duration}ms`,
      })

      return { updated, skipped, chargesCancelled, errors }
    } catch (error) {
      logger.error('[INTEREST] Fatal error in invoice interest calculation:', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }
}
