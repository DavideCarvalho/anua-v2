import logger from '@adonisjs/core/services/logger'
import app from '@adonisjs/core/services/app'
import locks from '@adonisjs/lock/services/main'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Invoice from '#models/invoice'
import Contract from '#models/contract'
import ContractInterestConfig from '#models/contract_interest_config'
import AsaasService from '#services/asaas_service'
import type School from '#models/school'

interface ApplyInvoiceInterestOptions {
  schoolId?: string
}

/**
 * Aplica multa e juros em Invoices OVERDUE com base no ContractInterestConfig.
 *
 * Roda diariamente às 05:30 (após MarkOverdueInvoices às 05:00).
 *
 * - delayInterestPercentage = multa fixa % (aplicada uma vez sobre o baseAmount)
 * - delayInterestPerDayDelayed = juros diários em centavos
 *
 * Idempotente: usa lock por invoice e verifica valores antes de atualizar.
 * Se o valor mudar e a invoice tem charge no Asaas, cancela o charge antigo.
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
      const invoiceQuery = Invoice.query()
        .where('status', 'OVERDUE')
        .where('totalAmount', '>', 0)
        .whereNotNull('contractId')

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

      // Cache configs and schools by contractId
      const interestConfigCache = new Map<string, ContractInterestConfig | null>()
      const schoolCache = new Map<string, School | null>()

      for (const invoice of invoices) {
        const lock = locks.createLock(`invoice-interest:${invoice.id}`, '30s')
        const [executed] = await lock.run(async () => {
          try {
            // Re-read fresh invoice inside lock
            const freshInvoice = await Invoice.query()
              .where('id', invoice.id)
              .where('status', 'OVERDUE')
              .preload('payments', (q) => q.whereNotIn('status', ['CANCELLED', 'RENEGOTIATED']))
              .first()

            if (!freshInvoice || !freshInvoice.contractId) {
              skipped++
              return
            }

            if (freshInvoice.payments.length === 0) {
              skipped++
              return
            }

            // Resolve interest config
            if (!interestConfigCache.has(freshInvoice.contractId)) {
              const config = await ContractInterestConfig.query()
                .where('contractId', freshInvoice.contractId)
                .first()
              interestConfigCache.set(freshInvoice.contractId, config)
            }

            const interestConfig = interestConfigCache.get(freshInvoice.contractId)
            if (!interestConfig) {
              skipped++
              return
            }

            // Calculate days overdue
            const dueDate = freshInvoice.dueDate.startOf('day')
            const diasAtraso = Math.floor(today.diff(dueDate, 'days').days)

            if (diasAtraso <= 0) {
              skipped++
              return
            }

            // baseAmount = sum of active payment amounts (snapshot, set once)
            const baseAmount =
              freshInvoice.baseAmount > 0
                ? freshInvoice.baseAmount
                : freshInvoice.payments.reduce((sum, p) => sum + Number(p.amount), 0)

            // Fine: applied once as percentage of baseAmount
            const fineAmount = Math.round(
              (baseAmount * interestConfig.delayInterestPercentage) / 100
            )

            // Daily interest: centavos per day * days overdue
            const interestAmount = interestConfig.delayInterestPerDayDelayed * diasAtraso

            const newTotal = baseAmount + fineAmount + interestAmount

            // Idempotency: skip if nothing changed
            if (
              freshInvoice.totalAmount === newTotal &&
              freshInvoice.baseAmount === baseAmount &&
              freshInvoice.fineAmount === fineAmount &&
              freshInvoice.interestAmount === interestAmount
            ) {
              skipped++
              return
            }

            const previousTotal = freshInvoice.totalAmount
            const hadCharge = freshInvoice.paymentGatewayId
            const valueChanged = previousTotal !== newTotal

            // Transaction: update invoice + clear charge fields atomically
            const trx = await db.transaction()
            try {
              freshInvoice.useTransaction(trx)
              freshInvoice.baseAmount = baseAmount
              freshInvoice.fineAmount = fineAmount
              freshInvoice.interestAmount = interestAmount
              freshInvoice.totalAmount = newTotal

              // If charge exists and value changed, clear charge fields
              if (hadCharge && valueChanged) {
                freshInvoice.paymentGatewayId = null
                freshInvoice.invoiceUrl = null
                freshInvoice.paymentGateway = null
                freshInvoice.paymentMethod = null
              }

              await freshInvoice.save()
              await trx.commit()
            } catch (trxError) {
              await trx.rollback()
              throw trxError
            }

            updated++
            logger.info(
              `[INTEREST] Updated invoice ${freshInvoice.id}: ${previousTotal} → ${newTotal} (base=${baseAmount}, fine=${fineAmount}, interest=${interestAmount}, days=${diasAtraso})`
            )

            // Cancel stale Asaas charge AFTER commit (best-effort, external API)
            if (hadCharge && valueChanged) {
              try {
                const contractId = freshInvoice.payments[0].contractId
                if (!schoolCache.has(contractId)) {
                  const contract = await Contract.query()
                    .where('id', contractId)
                    .preload('school', (sq) => sq.preload('schoolChain'))
                    .first()
                  schoolCache.set(contractId, contract?.school ?? null)
                }

                const school = schoolCache.get(contractId)
                if (school) {
                  const asaasConfig = asaasService.resolveAsaasConfig(school)
                  if (asaasConfig) {
                    await asaasService.deleteAsaasPayment(asaasConfig.apiKey, hadCharge)
                    chargesCancelled++
                    logger.info(
                      `[INTEREST] Cancelled stale Asaas charge ${hadCharge} for invoice ${freshInvoice.id}`
                    )
                  }
                }
              } catch (cancelError) {
                // Log but don't fail — charge fields already cleared in DB
                logger.warn(
                  `[INTEREST] Failed to cancel Asaas charge ${hadCharge} for invoice ${freshInvoice.id}:`,
                  {
                    error: cancelError instanceof Error ? cancelError.message : String(cancelError),
                  }
                )
              }
            }
          } catch (error) {
            errors++
            logger.error(`[INTEREST] Error processing invoice ${invoice.id}:`, {
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            })
          }
        })

        if (!executed) {
          logger.warn(`[INTEREST] Could not acquire lock for invoice ${invoice.id} - skipping`)
          skipped++
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
