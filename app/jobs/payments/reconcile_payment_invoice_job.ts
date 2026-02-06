import { Job } from '@boringnode/queue'
import StudentPayment from '#models/student_payment'
import GenerateInvoices from '#start/jobs/generate_invoices'

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
  }
}
