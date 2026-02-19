import logger from '@adonisjs/core/services/logger'
import app from '@adonisjs/core/services/app'
import locks from '@adonisjs/lock/services/main'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Invoice from '#models/invoice'
import Contract from '#models/contract'
import StudentHasLevel from '#models/student_has_level'
import type StudentPayment from '#models/student_payment'
import AsaasService, { type AsaasConfig } from '#services/asaas_service'
import type School from '#models/school'

interface CreateInvoiceAsaasChargesOptions {
  schoolId?: string
  month?: number
  year?: number
}

/**
 * Cria cobranças automáticas no Asaas para Invoices elegíveis.
 *
 * Roda diariamente às 06:00 (após ApplyInvoiceInterest às 05:30).
 * Apenas para escolas com Asaas configurado e ativo (paymentConfigStatus === 'ACTIVE').
 *
 * Processa invoices OPEN e OVERDUE sem charge existente.
 * Idempotente: usa lock por invoice e re-verifica paymentGatewayId antes de criar charge.
 */
export default class CreateInvoiceAsaasCharges {
  static async handle(options: CreateInvoiceAsaasChargesOptions = {}) {
    const asaasService = await app.container.make(AsaasService)
    const startTime = Date.now()
    const now = DateTime.now()
    const month = options.month ?? now.month
    const year = options.year ?? now.year

    logger.info('[ASAAS_CHARGES] Starting invoice charge creation', {
      schoolId: options.schoolId ?? 'all',
      month,
      year,
    })

    let created = 0
    let skipped = 0
    let errors = 0

    try {
      // 1) Buscar Invoices elegíveis: OPEN ou OVERDUE, sem cobrança, com valor > 0
      const invoiceQuery = Invoice.query()
        .whereIn('status', ['OPEN', 'OVERDUE'])
        .where('month', month)
        .where('year', year)
        .whereNull('paymentGatewayId')
        .where('totalAmount', '>', 0)
        .preload('payments', (q) => {
          q.whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
          q.preload('contract')
          q.preload('studentHasExtraClass', (eq) => eq.preload('extraClass'))
        })
        .preload('student', (q) => q.preload('user'))

      if (options.schoolId) {
        invoiceQuery.whereHas('payments', (q) => {
          q.whereHas('contract', (cq) => {
            cq.where('schoolId', options.schoolId!)
          })
        })
      }

      const invoices = await invoiceQuery

      if (invoices.length === 0) {
        logger.info('[ASAAS_CHARGES] No eligible invoices found')
        return { created, skipped, errors }
      }

      logger.info(`[ASAAS_CHARGES] Found ${invoices.length} eligible invoices`)

      // 2) Agrupar por escola para resolver config Asaas uma vez por escola
      const schoolConfigCache = new Map<string, AsaasConfig | null>()
      const schoolCache = new Map<string, School | null>()

      for (const invoice of invoices) {
        const lock = locks.createLock(`asaas-charge:${invoice.id}`, '30s')
        const [executed] = await lock.run(async () => {
          try {
            // Re-read fresh invoice inside lock to prevent duplicate charges
            const freshInvoice = await Invoice.find(invoice.id)
            if (!freshInvoice || freshInvoice.paymentGatewayId) {
              skipped++
              return
            }

            // Use preloaded data from original query for relationships
            const payments = invoice.payments
            const student = invoice.student

            if (payments.length === 0) {
              logger.warn(`[ASAAS_CHARGES] Invoice ${invoice.id} has no active payments - skipping`)
              skipped++
              return
            }

            // Resolver escola via contractId do primeiro payment
            const contractId = payments[0].contractId
            let school = schoolCache.get(contractId)

            if (school === undefined) {
              const contract = await Contract.query()
                .where('id', contractId)
                .preload('school', (sq) => sq.preload('schoolChain'))
                .first()

              school = contract?.school ?? null
              schoolCache.set(contractId, school)
            }

            if (!school) {
              logger.warn(`[ASAAS_CHARGES] No school found for invoice ${invoice.id} - skipping`)
              skipped++
              return
            }

            // Verificar se escola tem config Asaas ativa
            if (school.paymentConfigStatus !== 'ACTIVE') {
              skipped++
              return
            }

            const schoolId = school.id
            if (!schoolConfigCache.has(schoolId)) {
              schoolConfigCache.set(schoolId, asaasService.resolveAsaasConfig(school))
            }
            const config = schoolConfigCache.get(schoolId)!

            if (!config) {
              skipped++
              return
            }

            // 3) Verificar se o responsável tem CPF
            const user = student?.user
            if (!user?.documentNumber) {
              logger.warn(
                `[ASAAS_CHARGES] Student ${invoice.studentId} user has no documentNumber - skipping invoice ${invoice.id}`
              )
              skipped++
              return
            }

            // 4) Resolver paymentMethod a partir dos StudentHasLevel vinculados
            const billingType = await this.resolveBillingType(invoice)

            // 5) Criar/buscar customer no Asaas
            const customerId = await asaasService.getOrCreateAsaasCustomer(config.apiKey, user)

            // 6) Criar cobrança no Asaas
            const dueDate = freshInvoice.dueDate?.toISODate()
            if (!dueDate) {
              logger.warn(`[ASAAS_CHARGES] Invoice ${invoice.id} has no dueDate - skipping`)
              skipped++
              return
            }

            // Build rich description
            const paymentDescriptions = payments
              .map((p) => `- ${this.describePayment(p)}`)
              .join('\n')
            const schoolName = school.name
            const chargeDescription = `${schoolName} - Fatura ${String(freshInvoice.month).padStart(2, '0')}/${freshInvoice.year}\n${paymentDescriptions}`

            const charge = await asaasService.createAsaasPayment(config.apiKey, {
              customer: customerId,
              billingType,
              value: freshInvoice.totalAmount / 100, // cents → BRL
              dueDate,
              description: chargeDescription,
              externalReference: freshInvoice.id,
            })

            // 7) Salvar na Invoice dentro de uma transaction
            const trx = await db.transaction()
            try {
              freshInvoice.useTransaction(trx)
              freshInvoice.paymentGateway = 'ASAAS'
              freshInvoice.paymentGatewayId = charge.id
              freshInvoice.invoiceUrl = charge.bankSlipUrl ?? charge.invoiceUrl ?? null
              freshInvoice.paymentMethod = billingType
              if (freshInvoice.status === 'OPEN') {
                freshInvoice.status = 'PENDING'
              }
              await freshInvoice.save()
              await trx.commit()
            } catch (trxError) {
              await trx.rollback()
              throw trxError
            }

            created++
            logger.info(`[ASAAS_CHARGES] Created charge ${charge.id} for invoice ${invoice.id}`)
          } catch (error) {
            errors++
            const errorMsg = error instanceof Error ? error.message : String(error)
            const errorStack = error instanceof Error ? error.stack : undefined
            logger.error(`[ASAAS_CHARGES] Error processing invoice ${invoice.id}: ${errorMsg}`, {
              stack: errorStack,
            })
          }
        })

        if (!executed) {
          logger.warn(`[ASAAS_CHARGES] Could not acquire lock for invoice ${invoice.id} - skipping`)
          skipped++
        }
      }

      const duration = Date.now() - startTime
      logger.info('[ASAAS_CHARGES] Invoice charge creation completed', {
        created,
        skipped,
        errors,
        duration: `${duration}ms`,
      })

      return { created, skipped, errors }
    } catch (error) {
      logger.error('[ASAAS_CHARGES] Fatal error in invoice charge creation:', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Resolve o billingType a partir do paymentMethod mais frequente
   * nos StudentHasLevel vinculados aos payments da invoice.
   */
  private static async resolveBillingType(
    invoice: Invoice
  ): Promise<'BOLETO' | 'PIX' | 'CREDIT_CARD'> {
    const studentHasLevelIds = invoice.payments
      .map((p) => p.studentHasLevelId)
      .filter((id): id is string => id !== null)

    if (studentHasLevelIds.length === 0) {
      return 'BOLETO'
    }

    const enrollments = await StudentHasLevel.query().whereIn('id', studentHasLevelIds)

    const counts: Record<string, number> = {}
    for (const enrollment of enrollments) {
      const method = enrollment.paymentMethod
      if (method) {
        counts[method] = (counts[method] || 0) + 1
      }
    }

    let mostFrequent: string | null = null
    let maxCount = 0
    for (const [method, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count
        mostFrequent = method
      }
    }

    switch (mostFrequent) {
      case 'PIX':
        return 'PIX'
      case 'CREDIT_CARD':
        return 'CREDIT_CARD'
      case 'BOLETO':
      default:
        return 'BOLETO'
    }
  }

  private static describePayment(payment: StudentPayment): string {
    const contractName = payment.contract?.name
    const installmentInfo =
      payment.installments > 0 ? ` (${payment.installmentNumber}/${payment.installments})` : ''

    switch (payment.type) {
      case 'TUITION':
        return 'Mensalidade'
      case 'ENROLLMENT':
        return contractName
          ? `Matrícula - ${contractName}${installmentInfo}`
          : `Matrícula${installmentInfo}`
      case 'EXTRA_CLASS':
        return payment.studentHasExtraClass?.extraClass?.name
          ? `Aula Avulsa - ${payment.studentHasExtraClass.extraClass.name}`
          : 'Aula Avulsa'
      case 'COURSE':
        return contractName ? `Curso - ${contractName}` : 'Curso'
      case 'STORE':
        return 'Loja'
      case 'CANTEEN':
        return 'Cantina'
      case 'AGREEMENT':
        return 'Acordo'
      case 'STUDENT_LOAN':
        return 'Empréstimo'
      default:
        return 'Outro'
    }
  }
}
