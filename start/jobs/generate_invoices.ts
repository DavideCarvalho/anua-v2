import logger from '@adonisjs/core/services/logger'
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

      // 2) Agrupar payments por student:contract
      const paymentGroups = new Map<string, StudentPayment[]>()
      for (const payment of allPayments) {
        const key = `${payment.studentId}:${payment.contractId}`
        if (!paymentGroups.has(key)) {
          paymentGroups.set(key, [])
        }
        paymentGroups.get(key)!.push(payment)
      }

      // 3) Buscar invoices já existentes para o mês (para os mesmos contratos)
      const contractIds = [...new Set(allPayments.map((p) => p.contractId))]
      const existingInvoices = await Invoice.query()
        .whereIn('contractId', contractIds)
        .where('month', month)
        .where('year', year)
        .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])

      const invoiceMap = new Map<string, Invoice>()
      for (const inv of existingInvoices) {
        invoiceMap.set(`${inv.studentId}:${inv.contractId}`, inv)
      }

      logger.info(
        `[INVOICES] Found ${allPayments.length} payments in ${paymentGroups.size} groups, ${existingInvoices.length} existing invoices`
      )

      let created = 0
      let reconciled = 0
      let paymentsLinked = 0
      let errors = 0

      for (const [key, groupPayments] of paymentGroups) {
        const trx = await db.transaction()
        try {
          const [studentId, contractId] = key.split(':')
          const contract = groupPayments[0].contract
          const existingInvoice = invoiceMap.get(key)

          // Pagamentos que ainda não estão vinculados a nenhuma invoice
          const unlinkedPayments = groupPayments.filter((p) => !p.invoiceId)

          if (unlinkedPayments.length === 0) {
            await trx.rollback()
            continue
          }

          if (existingInvoice) {
            // RECONCILIAÇÃO: invoice já existe, vincular payments faltantes
            for (const payment of unlinkedPayments) {
              payment.useTransaction(trx)
              payment.invoiceId = existingInvoice.id
              await payment.save()
            }

            // Recalcular totalAmount com todos os payments
            const linkedPayments = groupPayments.filter(
              (p) => p.invoiceId === existingInvoice.id
            )
            const allLinked = [...linkedPayments, ...unlinkedPayments]
            const newTotal = allLinked.reduce((sum, p) => sum + Number(p.amount), 0)

            existingInvoice.useTransaction(trx)
            existingInvoice.totalAmount = newTotal
            await existingInvoice.save()

            await trx.commit()
            reconciled++
            paymentsLinked += unlinkedPayments.length

            logger.info(`[INVOICES] Reconciled invoice ${existingInvoice.id}`, {
              studentId,
              added: unlinkedPayments.length,
              newTotal,
            })
          } else {
            // CRIAÇÃO: invoice não existe, criar e vincular tudo
            const invoiceType = contract.paymentType === 'UPFRONT' ? 'UPFRONT' : 'MONTHLY'
            const totalAmount = unlinkedPayments.reduce((sum, p) => sum + Number(p.amount), 0)
            const earliestDueDate = unlinkedPayments.reduce(
              (earliest, p) => (p.dueDate < earliest ? p.dueDate : earliest),
              unlinkedPayments[0].dueDate
            )

            const invoice = await Invoice.create(
              {
                studentId,
                contractId,
                type: invoiceType,
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
          errors++
          logger.error(`[INVOICES] Error processing group ${key}:`, {
            error: error instanceof Error ? error.message : String(error),
          })
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
