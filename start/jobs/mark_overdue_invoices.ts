import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Invoice from '#models/invoice'

/**
 * Job agendado para marcar Invoices vencidas como OVERDUE.
 * Propaga o status OVERDUE para os StudentPayments vinculados.
 *
 * Roda diariamente.
 */
export default class MarkOverdueInvoices {
  static async handle() {
    const startTime = Date.now()
    const today = DateTime.now().startOf('day')

    logger.info('[OVERDUE] Starting overdue invoice check', {
      date: today.toISODate(),
    })

    try {
      const overdueInvoices = await Invoice.query()
        .whereIn('status', ['OPEN', 'PENDING'])
        .where('dueDate', '<', today.toSQLDate()!)

      if (overdueInvoices.length === 0) {
        logger.info('[OVERDUE] No overdue invoices found')
        return { updated: 0, errors: 0 }
      }

      logger.info(`[OVERDUE] Found ${overdueInvoices.length} overdue invoices`)

      let updated = 0
      let errors = 0

      for (const invoice of overdueInvoices) {
        const trx = await db.transaction()
        try {
          invoice.useTransaction(trx)
          invoice.status = 'OVERDUE'
          await invoice.save()

          // Propagate OVERDUE to linked payments
          await trx
            .from('StudentPayment')
            .where('invoiceId', invoice.id)
            .whereIn('status', ['NOT_PAID', 'PENDING'])
            .update({
              status: 'OVERDUE',
              updatedAt: DateTime.now().toSQL(),
            })

          await trx.commit()
          updated++
        } catch (error) {
          await trx.rollback()
          errors++
          logger.error(`[OVERDUE] Error updating invoice ${invoice.id}:`, {
            error: error instanceof Error ? error.message : String(error),
          })
        }
      }

      const duration = Date.now() - startTime
      logger.info('[OVERDUE] Overdue check completed', {
        updated,
        errors,
        duration: `${duration}ms`,
      })

      return { updated, errors }
    } catch (error) {
      logger.error('[OVERDUE] Error in overdue check:', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }
}
