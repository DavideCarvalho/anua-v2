import { Job } from '@boringnode/queue'
import StudentPayment from '#models/student_payment'
import GenerateInvoices from '#start/jobs/generate_invoices'
import { setAuditContext, clearAuditContext } from '#services/audit_context_service'

interface ReconcilePaymentInvoicePayload {
  paymentId: string
  triggeredBy?: { id: string; name: string } | null
  source?: string
}

export default class ReconcilePaymentInvoiceJob extends Job<ReconcilePaymentInvoicePayload> {
  static readonly jobName = 'ReconcilePaymentInvoiceJob'

  static options = {
    queue: 'payments',
    maxRetries: 3,
  }

  async execute(): Promise<void> {
    const { paymentId, triggeredBy, source } = this.payload

    // Set audit context so auditable models know who triggered the change
    if (triggeredBy) {
      setAuditContext({
        userId: triggeredBy.id,
        userName: triggeredBy.name,
        source: source || 'Reconciliar Fatura',
      })
    }

    try {
      const payment = await StudentPayment.find(paymentId)
      if (!payment) {
        console.warn(`[RECONCILE] Payment ${paymentId} not found - skipping`)
        return
      }

      // Store triggeredBy in metadata if provided
      if (triggeredBy) {
        payment.metadata = {
          ...(payment.metadata || {}),
          lastTriggeredBy: triggeredBy,
          lastTriggeredAt: new Date().toISOString(),
          lastTriggeredSource: source,
        }
        await payment.save()
      }

      await GenerateInvoices.reconcilePayment(payment)
    } finally {
      clearAuditContext()
    }
  }
}
