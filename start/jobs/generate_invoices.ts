import logger from '@adonisjs/core/services/logger'
import locks from '@adonisjs/lock/services/main'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import StudentPayment from '#models/student_payment'
import Invoice from '#models/invoice'

interface GenerateInvoicesOptions {
  schoolIds?: string[]
  month?: number
  year?: number
}

/**
 * Gera e reconcilia Invoices (faturas mensais).
 *
 * Para cada aluno/contrato no mês:
 *  - Se já existe Invoice: garante que todos os StudentPayments (mensalidade,
 *    cantina, loja, etc.) estejam vinculados e recalcula o totalAmount.
 *  - Se não existe: cria a Invoice e vincula todos os pagamentos.
 *
 * Roda diariamente às 03:00 via scheduler, ou manualmente via command.
 */
export default class GenerateInvoices {
  /**
   * Reconcilia a invoice de um pagamento individual.
   * Vincula o pagamento a uma invoice existente ou cria uma nova.
   * Chamado após criar/editar um pagamento para não depender do scheduler.
   */
  static async reconcilePayment(payment: StudentPayment) {
    // Cancelled/renegotiated: only recalculate existing invoice total
    if (['CANCELLED', 'RENEGOTIATED'].includes(payment.status)) {
      if (payment.invoiceId) {
        const invoice = await Invoice.query()
          .where('id', payment.invoiceId)
          .whereNotIn('status', ['PAID', 'CANCELLED'])
          .first()

        if (invoice) {
          const linkedPayments = await StudentPayment.query()
            .where('invoiceId', invoice.id)
            .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
          invoice.totalAmount = linkedPayments.reduce((sum, p) => sum + Number(p.amount), 0)
          await invoice.save()
        }
      }
      return
    }

    if (payment.type === 'AGREEMENT') {
      return
    }

    // Already linked — just recalculate the invoice total
    if (payment.invoiceId) {
      const invoice = await Invoice.query()
        .where('id', payment.invoiceId)
        .whereNotIn('status', ['PAID', 'CANCELLED'])
        .first()

      if (invoice) {
        const linkedPayments = await StudentPayment.query()
          .where('invoiceId', invoice.id)
          .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
        invoice.totalAmount = linkedPayments.reduce((sum, p) => sum + Number(p.amount), 0)
        await invoice.save()
      }
      return
    }

    // Critical section: find-or-create invoice (locked per student to prevent duplicates)
    const lock = locks.createLock(`invoice-reconcile:${payment.studentId}`, '15s')
    const [executed] = await lock.run(async () => {
      // Re-read payment to get fresh data (another job may have linked it while we waited)
      await payment.refresh()
      if (payment.invoiceId) return

      // Find invoice by student + month/year (not by contract)
      let invoice = await Invoice.query()
        .where('studentId', payment.studentId)
        .where('month', payment.month)
        .where('year', payment.year)
        .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
        .first()

      if (invoice) {
        payment.invoiceId = invoice.id
        await payment.save()

        const linkedPayments = await StudentPayment.query()
          .where('invoiceId', invoice.id)
          .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
        invoice.totalAmount = linkedPayments.reduce((sum, p) => sum + Number(p.amount), 0)
        await invoice.save()
      } else {
        // Create invoice without contractId (aggregates all payment types)
        invoice = await Invoice.create({
          studentId: payment.studentId,
          contractId: null,
          type: 'MONTHLY',
          month: payment.month,
          year: payment.year,
          dueDate: payment.dueDate,
          status: 'OPEN',
          totalAmount: Number(payment.amount),
        })
        payment.invoiceId = invoice.id
        await payment.save()

        logger.info(`[INVOICES] Created invoice ${invoice.id} via reconcilePayment`, {
          studentId: payment.studentId,
          month: payment.month,
          year: payment.year,
        })
      }
    })

    if (!executed) {
      throw new Error(`Lock não adquirido para student ${payment.studentId}`)
    }
  }

  static async handle(options: GenerateInvoicesOptions = {}) {
    const startTime = Date.now()
    const now = DateTime.now()
    const month = options.month ?? now.month
    const year = options.year ?? now.year

    logger.info('[INVOICES] Starting invoice generation/reconciliation', {
      schoolIds: options.schoolIds ?? 'all',
      month,
      year,
    })

    try {
      // 1) Buscar todos os StudentPayments elegíveis do mês
      const paymentQuery = StudentPayment.query()
        .where('month', month)
        .where('year', year)
        .whereNotIn('type', ['AGREEMENT'])
        .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
        .preload('contract')

      if (options.schoolIds && options.schoolIds.length > 0) {
        paymentQuery.whereHas('contract', (q) => {
          q.whereIn('schoolId', options.schoolIds!)
        })
      }

      const allPayments = await paymentQuery

      if (allPayments.length === 0) {
        logger.info('[INVOICES] No eligible payments found')
        return { created: 0, reconciled: 0, paymentsLinked: 0, errors: 0 }
      }

      // 2) Agrupar payments por student (não por contrato)
      const paymentGroups = new Map<string, StudentPayment[]>()
      for (const payment of allPayments) {
        const key = payment.studentId
        if (!paymentGroups.has(key)) {
          paymentGroups.set(key, [])
        }
        paymentGroups.get(key)!.push(payment)
      }

      // 3) Buscar invoices já existentes para o mês (por aluno)
      const studentIds = [...new Set(allPayments.map((p) => p.studentId))]
      const existingInvoices = await Invoice.query()
        .whereIn('studentId', studentIds)
        .where('month', month)
        .where('year', year)
        .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])

      const invoiceMap = new Map<string, Invoice>()
      for (const inv of existingInvoices) {
        invoiceMap.set(inv.studentId, inv)
      }

      logger.info(
        `[INVOICES] Found ${allPayments.length} payments in ${paymentGroups.size} groups, ${existingInvoices.length} existing invoices`
      )

      let created = 0
      let reconciled = 0
      let paymentsLinked = 0
      let errors = 0

      for (const [studentId, groupPayments] of paymentGroups) {
        const lock = locks.createLock(`invoice-reconcile:${studentId}`, '30s')
        const [executed] = await lock.run(async () => {
          const trx = await db.transaction()
          try {
            // Re-query for fresh data (invoiceMap may be stale after waiting for lock)
            const freshExisting = await Invoice.query()
              .where('studentId', studentId)
              .where('month', month)
              .where('year', year)
              .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
              .first()

            // Pagamentos que ainda não estão vinculados a nenhuma invoice
            const unlinkedPayments = groupPayments.filter((p) => !p.invoiceId)

            if (unlinkedPayments.length === 0) {
              await trx.rollback()
              return
            }

            if (freshExisting) {
              // RECONCILIAÇÃO: invoice já existe, vincular payments faltantes
              for (const payment of unlinkedPayments) {
                payment.useTransaction(trx)
                payment.invoiceId = freshExisting.id
                await payment.save()
              }

              // Recalcular totalAmount com todos os payments
              const linkedPayments = groupPayments.filter((p) => p.invoiceId === freshExisting.id)
              const allLinked = [...linkedPayments, ...unlinkedPayments]
              const newTotal = allLinked.reduce((sum, p) => sum + Number(p.amount), 0)

              freshExisting.useTransaction(trx)
              freshExisting.totalAmount = newTotal
              await freshExisting.save()

              await trx.commit()
              reconciled++
              paymentsLinked += unlinkedPayments.length

              logger.info(`[INVOICES] Reconciled invoice ${freshExisting.id}`, {
                studentId,
                added: unlinkedPayments.length,
                newTotal,
              })
            } else {
              // CRIAÇÃO: invoice não existe, criar e vincular tudo (sem contractId)
              const totalAmount = unlinkedPayments.reduce((sum, p) => sum + Number(p.amount), 0)
              const earliestDueDate = unlinkedPayments.reduce(
                (earliest, p) => (p.dueDate < earliest ? p.dueDate : earliest),
                unlinkedPayments[0].dueDate
              )

              const invoice = await Invoice.create(
                {
                  studentId,
                  contractId: null,
                  type: 'MONTHLY',
                  month,
                  year,
                  dueDate: earliestDueDate,
                  status: 'OPEN',
                  totalAmount,
                },
                { client: trx }
              )

              for (const payment of unlinkedPayments) {
                payment.useTransaction(trx)
                payment.invoiceId = invoice.id
                await payment.save()
              }

              await trx.commit()
              created++
              paymentsLinked += unlinkedPayments.length

              logger.info(`[INVOICES] Created invoice ${invoice.id}`, {
                studentId,
                totalAmount,
                payments: unlinkedPayments.length,
              })
            }
          } catch (error) {
            await trx.rollback()
            throw error
          }
        })

        if (!executed) {
          errors++
          logger.warn(`[INVOICES] Lock não adquirido para ${key}`)
        }
      }

      const duration = Date.now() - startTime
      logger.info('[INVOICES] Invoice generation/reconciliation completed', {
        created,
        reconciled,
        paymentsLinked,
        errors,
        duration: `${duration}ms`,
      })

      return { created, reconciled, paymentsLinked, errors }
    } catch (error) {
      logger.error('[INVOICES] Fatal error in invoice generation:', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }
}
