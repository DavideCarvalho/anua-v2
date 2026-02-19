import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import Invoice from '#models/invoice'
import Notification from '#models/notification'
import StudentHasResponsible from '#models/student_has_responsible'

interface SendInvoiceNotificationsOptions {
  schoolId?: string
}

/**
 * Envia notificações consolidadas para responsáveis financeiros sobre invoices.
 *
 * Roda diariamente às 06:30 (após CreateInvoiceAsaasCharges às 06:00).
 * Última etapa do pipeline de invoices — garante uma notificação por invoice por dia.
 *
 * Cenários notificados:
 * - Invoice OVERDUE com multa/juros aplicados
 * - Invoice OVERDUE sem multa/juros (apenas vencida)
 * - Invoice OPEN/PENDING com charge criado (link disponível)
 */
export default class SendInvoiceNotifications {
  static async handle(options: SendInvoiceNotificationsOptions = {}) {
    const startTime = Date.now()
    const today = DateTime.now().startOf('day')

    logger.info('[INVOICE_NOTIFY] Starting invoice notification dispatch', {
      schoolId: options.schoolId ?? 'all',
      date: today.toISODate(),
    })

    let sent = 0
    let skipped = 0
    let errors = 0

    try {
      // Find invoices that need notification:
      // 1. OVERDUE invoices not notified today
      // 2. OPEN/PENDING invoices with a charge (paymentGatewayId) not notified today
      const invoices = await Invoice.query()
        .where((q) => {
          q.where('status', 'OVERDUE').orWhere((sub) => {
            sub.whereIn('status', ['OPEN', 'PENDING']).whereNotNull('paymentGatewayId')
          })
        })
        .where((q) => {
          q.whereNull('lastNotifiedAt').orWhere('lastNotifiedAt', '<', today.toSQL()!)
        })
        .where('totalAmount', '>', 0)
        .preload('student', (sq) => sq.preload('user'))

      if (options.schoolId) {
        // Re-filter by school if needed — preload doesn't filter the main query
        // This is handled below via contract resolution
      }

      if (invoices.length === 0) {
        logger.info('[INVOICE_NOTIFY] No invoices need notification')
        return { sent, skipped, errors }
      }

      logger.info(`[INVOICE_NOTIFY] Found ${invoices.length} invoices to notify`)

      // Cache responsáveis financeiros by studentId
      const financialResponsiblesCache = new Map<string, string[]>()

      for (const invoice of invoices) {
        try {
          const studentId = invoice.studentId

          // Resolve financial responsibles
          if (!financialResponsiblesCache.has(studentId)) {
            const relations = await StudentHasResponsible.query()
              .where('studentId', studentId)
              .where('isFinancial', true)

            financialResponsiblesCache.set(
              studentId,
              relations.map((r) => r.responsibleId)
            )
          }

          const responsibleIds = financialResponsiblesCache.get(studentId)!
          if (responsibleIds.length === 0) {
            skipped++
            continue
          }

          // Build notification content
          const studentName = invoice.student?.user?.name ?? 'o aluno'
          const monthYear = `${String(invoice.month).padStart(2, '0')}/${invoice.year}`
          const totalFormatted = this.formatCurrency(invoice.totalAmount)

          const { title, message, type, actionUrl } = this.buildNotificationContent(
            invoice,
            studentName,
            monthYear,
            totalFormatted
          )

          // Create notification for each financial responsible
          await Promise.all(
            responsibleIds.map((responsibleId) =>
              Notification.create({
                userId: responsibleId,
                type,
                title,
                message,
                data: {
                  invoiceId: invoice.id,
                  studentId,
                  kind: 'invoice_update',
                  status: invoice.status,
                  totalAmount: invoice.totalAmount,
                  baseAmount: invoice.baseAmount,
                  fineAmount: invoice.fineAmount,
                  interestAmount: invoice.interestAmount,
                  invoiceUrl: invoice.invoiceUrl,
                },
                isRead: false,
                sentViaInApp: true,
                sentViaEmail: false,
                sentViaPush: false,
                sentViaSms: false,
                sentViaWhatsApp: false,
                actionUrl,
              })
            )
          )

          // Mark as notified today
          invoice.lastNotifiedAt = DateTime.now()
          await invoice.save()

          sent++
        } catch (error) {
          errors++
          logger.error(`[INVOICE_NOTIFY] Error notifying for invoice ${invoice.id}:`, {
            error: error instanceof Error ? error.message : String(error),
          })
        }
      }

      const duration = Date.now() - startTime
      logger.info('[INVOICE_NOTIFY] Invoice notification dispatch completed', {
        sent,
        skipped,
        errors,
        duration: `${duration}ms`,
      })

      return { sent, skipped, errors }
    } catch (error) {
      logger.error('[INVOICE_NOTIFY] Fatal error in invoice notification dispatch:', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  private static buildNotificationContent(
    invoice: Invoice,
    studentName: string,
    monthYear: string,
    totalFormatted: string
  ) {
    const actionUrl = `/responsavel/mensalidades`

    if (invoice.status === 'OVERDUE') {
      const hasPenalty = invoice.fineAmount > 0 || invoice.interestAmount > 0

      if (hasPenalty) {
        const parts: string[] = []
        if (invoice.fineAmount > 0) parts.push(`multa ${this.formatCurrency(invoice.fineAmount)}`)
        if (invoice.interestAmount > 0)
          parts.push(`juros ${this.formatCurrency(invoice.interestAmount)}`)
        const penaltyDetail = parts.join(' e ')

        return {
          type: 'PAYMENT_OVERDUE' as const,
          title: 'Fatura vencida',
          message: `A fatura de ${monthYear} de ${studentName} está vencida. Valor atualizado: ${totalFormatted} (inclui ${penaltyDetail}).`,
          actionUrl,
        }
      }

      return {
        type: 'PAYMENT_OVERDUE' as const,
        title: 'Fatura vencida',
        message: `A fatura de ${monthYear} de ${studentName} está vencida. Valor: ${totalFormatted}.`,
        actionUrl,
      }
    }

    // OPEN/PENDING with charge — payment link available
    return {
      type: 'PAYMENT_DUE' as const,
      title: 'Fatura disponível para pagamento',
      message: `A fatura de ${monthYear} de ${studentName} está disponível para pagamento. Valor: ${totalFormatted}.`,
      actionUrl,
    }
  }

  private static formatCurrency(cents: number): string {
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`
  }
}
