import { Job } from '@boringnode/queue'
import locks from '@adonisjs/lock/services/main'
import StudentPayment from '#models/student_payment'
import GenerateInvoices from '#start/jobs/generate_invoices'
import { setAuditContext, clearAuditContext } from '#services/audit_context_service'

// Map technical source names to friendly labels
const SOURCE_LABELS: Record<string, string> = {
  'student-payments.update': 'Editar Pagamento',
  'student-payments.cancel': 'Cancelar Pagamento',
  'student-payments.create': 'Criar Pagamento',
  'extra-classes.enroll': 'Matricular em Aula Avulsa',
  'update-enrollment-payments-job': 'Editar Matrícula',
  'events.parental-consent.approved': 'Autorizar Participação em Evento',
  'events.parental-consent.denied': 'Não Autorizar Participação em Evento',
  'events.cancel': 'Cancelar Evento',
  'events.update': 'Atualizar Evento',
  'students.enrollments.cancel': 'Cancelar Matrícula',
  'agreements.create': 'Criar Acordo de Pagamento',
}

interface ReconcilePaymentInvoicePayload {
  paymentId: string
  triggeredBy?: { id: string; name: string } | null
  source?: string
}

export default class ReconcilePaymentInvoiceJob extends Job<ReconcilePaymentInvoicePayload> {
  static readonly jobName = 'ReconcilePaymentInvoiceJob'

  static options = {
    queue: 'payments',
    maxRetries: 5,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }

  async execute(): Promise<void> {
    const { paymentId, triggeredBy, source } = this.payload

    // Set audit context so auditable models know who triggered the change
    if (triggeredBy) {
      const friendlySource = source ? (SOURCE_LABELS[source] ?? source) : 'Reconciliar Fatura'
      setAuditContext({
        userId: triggeredBy.id,
        userName: triggeredBy.name,
        source: friendlySource,
      })
    }

    try {
      const lock = locks.createLock(`reconcile-payment:${paymentId}`, '30s')
      const [executed] = await lock.run(async () => {
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
      })

      if (!executed) {
        console.warn(`[RECONCILE] Lock not acquired for payment ${paymentId} - retrying`)
        throw new Error(`Lock not acquired for payment ${paymentId}`)
      }
    } finally {
      clearAuditContext()
    }
  }
}
