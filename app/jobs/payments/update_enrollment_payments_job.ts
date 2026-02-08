import { Job } from '@boringnode/queue'
import { DateTime } from 'luxon'
import StudentHasLevel from '#models/student_has_level'
import StudentPayment from '#models/student_payment'
import Contract from '#models/contract'
import Scholarship from '#models/scholarship'
import ContractPaymentDay from '#models/contract_payment_day'
import Invoice from '#models/invoice'
import { getQueueManager } from '#services/queue_service'
import { setAuditContext, clearAuditContext } from '#services/audit_context_service'
import ReconcilePaymentInvoiceJob from '#jobs/payments/reconcile_payment_invoice_job'
import GenerateStudentPaymentsJob from '#jobs/payments/generate_student_payments_job'

const UNPAID_STATUSES = ['NOT_PAID', 'PENDING', 'OVERDUE'] as const

interface UpdateEnrollmentPaymentsPayload {
  enrollmentId: string
  triggeredBy?: { id: string; name: string } | null
}

export default class UpdateEnrollmentPaymentsJob extends Job<UpdateEnrollmentPaymentsPayload> {
  static readonly jobName = 'UpdateEnrollmentPaymentsJob'

  static options = {
    queue: 'payments',
    retry: {
      maxRetries: 3,
    },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 1000 },
  }

  async execute(): Promise<void> {
    // Force flush to stdout
    process.stdout.write('\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n')
    process.stdout.write('!!! UPDATE_ENROLLMENT_PAYMENTS JOB !!!\n')
    process.stdout.write('!!! EXECUTE CALLED !!!\n')
    process.stdout.write(`!!! Payload: ${JSON.stringify(this.payload)}\n`)
    process.stdout.write('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n')

    const { enrollmentId, triggeredBy } = this.payload

    // Set audit context so auditable models know who triggered the change
    if (triggeredBy) {
      setAuditContext({
        userId: triggeredBy.id,
        userName: triggeredBy.name,
        source: 'Editar Matrícula',
      })
    }

    try {
      const enrollment = await StudentHasLevel.find(enrollmentId)
      if (!enrollment) {
        console.warn(`[UPDATE_ENROLLMENT_PAYMENTS] Enrollment ${enrollmentId} not found - skipping`)
        return
      }

      console.log(`[UPDATE_ENROLLMENT_PAYMENTS] Found enrollment, processing...`)

      await this.generatePaymentsIfMissing(enrollment)
      await this.updateFuturePayments(enrollment)
      await this.reconcileInvoices(enrollment, triggeredBy)

      console.log('========================================')
      console.log(`[UPDATE_ENROLLMENT_PAYMENTS] JOB COMPLETED for ${enrollmentId}`)
      console.log('========================================')
    } finally {
      // Always clear context when done
      clearAuditContext()
    }
  }

  private async generatePaymentsIfMissing(enrollment: StudentHasLevel) {
    if (!enrollment.contractId) return

    const existingPayments = await StudentPayment.query()
      .where('studentHasLevelId', enrollment.id)
      .whereIn('type', ['TUITION', 'COURSE', 'ENROLLMENT'])

    if (existingPayments.length > 0) return

    const orphanPayments = await StudentPayment.query()
      .where('studentId', enrollment.studentId)
      .whereNull('studentHasLevelId')
      .whereIn('type', ['TUITION', 'COURSE', 'ENROLLMENT'])

    if (orphanPayments.length > 0) {
      console.log(
        `[UPDATE_ENROLLMENT_PAYMENTS] Linking ${orphanPayments.length} orphan payments to enrollment ${enrollment.id}`
      )
      await StudentPayment.query()
        .whereIn(
          'id',
          orphanPayments.map((p) => p.id)
        )
        .update({ studentHasLevelId: enrollment.id })
      return
    }

    console.log(
      `[UPDATE_ENROLLMENT_PAYMENTS] No payments found for enrollment ${enrollment.id}, dispatching generation job`
    )
    try {
      await getQueueManager()
      await GenerateStudentPaymentsJob.dispatch({ studentHasLevelId: enrollment.id })
    } catch (error) {
      console.error(
        '[UPDATE_ENROLLMENT_PAYMENTS] Failed to dispatch payment generation job:',
        error
      )
    }
  }

  private async updateFuturePayments(enrollment: StudentHasLevel) {
    if (!enrollment.contractId) return

    const contract = await Contract.find(enrollment.contractId)
    if (!contract) return

    const scholarship = enrollment.scholarshipId
      ? await Scholarship.find(enrollment.scholarshipId)
      : null

    const paymentDay = await this.getPaymentDay(enrollment, contract)
    const discountPercentage = scholarship?.discountPercentage ?? 0

    const futurePayments = await StudentPayment.query()
      .where('studentHasLevelId', enrollment.id)
      .whereIn('status', [...UNPAID_STATUSES])
      .where('type', '!=', 'ENROLLMENT')
      .orderBy('dueDate', 'asc')

    if (futurePayments.length === 0) return

    if (contract.paymentType === 'UPFRONT') {
      await this.updateUpfrontPayments(
        enrollment,
        contract,
        futurePayments,
        paymentDay,
        discountPercentage
      )
    } else {
      await this.updateMonthlyPayments(contract, futurePayments, paymentDay, discountPercentage)
    }
  }

  private async updateUpfrontPayments(
    enrollment: StudentHasLevel,
    contract: Contract,
    futurePayments: StudentPayment[],
    paymentDay: number,
    discountPercentage: number
  ) {
    const installments = enrollment.installments ?? contract.installments ?? 1
    const totalAmount = contract.ammount
    const installmentAmount = Math.floor(totalAmount / installments)
    const discountedAmount = Math.round(installmentAmount * (1 - discountPercentage / 100))

    const allPayments = await StudentPayment.query()
      .where('studentHasLevelId', enrollment.id)
      .where('type', '!=', 'ENROLLMENT')
      .orderBy('installmentNumber', 'asc')

    const paidPayments = allPayments.filter(
      (p) => !UNPAID_STATUSES.includes(p.status as (typeof UNPAID_STATUSES)[number])
    )
    const paidCount = paidPayments.length
    const remainingNeeded = Math.max(0, installments - paidCount)

    const toUpdate = futurePayments.slice(0, remainingNeeded)
    for (const [i, payment] of toUpdate.entries()) {
      const installmentNumber = paidCount + i + 1
      const dueDate = payment.dueDate.set({
        day: Math.min(paymentDay, payment.dueDate.daysInMonth ?? 28),
      })

      payment.amount = discountedAmount
      payment.totalAmount = installmentAmount
      payment.discountPercentage = discountPercentage
      payment.installments = installments
      payment.installmentNumber = installmentNumber
      payment.contractId = contract.id
      payment.dueDate = dueDate
      await payment.save()
    }

    if (toUpdate.length < remainingNeeded) {
      const lastPayment =
        toUpdate.length > 0 ? toUpdate[toUpdate.length - 1] : paidPayments[paidPayments.length - 1]
      const lastDueDate = lastPayment?.dueDate ?? DateTime.now()

      for (let i = toUpdate.length; i < remainingNeeded; i++) {
        const installmentNumber = paidCount + i + 1
        const dueDate = lastDueDate.plus({ months: i - toUpdate.length + 1 }).set({
          day: Math.min(paymentDay, 28),
        })

        await StudentPayment.create({
          studentId: enrollment.studentId,
          studentHasLevelId: enrollment.id,
          contractId: contract.id,
          type: 'COURSE',
          amount: discountedAmount,
          totalAmount: installmentAmount,
          month: dueDate.month,
          year: dueDate.year,
          dueDate,
          installments,
          installmentNumber,
          status: 'PENDING',
          discountPercentage,
        })
      }
    }

    const toCancel = futurePayments.slice(remainingNeeded)
    if (toCancel.length > 0) {
      await StudentPayment.query()
        .whereIn(
          'id',
          toCancel.map((p) => p.id)
        )
        .update({
          status: 'CANCELLED',
          metadata: { cancelReason: 'Número de parcelas reduzido na edição da matrícula' },
        })
    }
  }

  private async updateMonthlyPayments(
    contract: Contract,
    futurePayments: StudentPayment[],
    paymentDay: number,
    discountPercentage: number
  ) {
    const monthlyAmount = contract.ammount
    const discountedAmount = Math.round(monthlyAmount * (1 - discountPercentage / 100))

    for (const payment of futurePayments) {
      const dueDate = payment.dueDate.set({
        day: Math.min(paymentDay, payment.dueDate.daysInMonth ?? 28),
      })

      payment.amount = discountedAmount
      payment.totalAmount = monthlyAmount
      payment.discountPercentage = discountPercentage
      payment.contractId = contract.id
      payment.dueDate = dueDate
      await payment.save()
    }
  }

  private async getPaymentDay(enrollment: StudentHasLevel, contract: Contract): Promise<number> {
    if (enrollment.paymentDay) {
      return enrollment.paymentDay
    }

    const paymentDay = await ContractPaymentDay.query()
      .where('contractId', contract.id)
      .orderBy('day', 'asc')
      .first()

    return paymentDay?.day ?? 5
  }

  private async reconcileInvoices(
    enrollment: StudentHasLevel,
    triggeredBy?: { id: string; name: string } | null
  ) {
    const paymentsWithInvoice = await StudentPayment.query()
      .where((q) => {
        q.where('studentHasLevelId', enrollment.id).orWhere((sub) => {
          sub.where('studentId', enrollment.studentId).whereNull('studentHasLevelId')
        })
      })
      .whereNotNull('invoiceId')
      .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])

    const invoiceIds = [...new Set(paymentsWithInvoice.map((p) => p.invoiceId!).filter(Boolean))]

    for (const invoiceId of invoiceIds) {
      const invoice = await Invoice.find(invoiceId)
      if (!invoice || ['PAID', 'CANCELLED', 'RENEGOTIATED'].includes(invoice.status)) continue

      const allLinkedPayments = await StudentPayment.query()
        .where('invoiceId', invoiceId)
        .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
        .orderBy('dueDate', 'asc')

      const newTotalAmount = allLinkedPayments.reduce((sum, p) => sum + Number(p.amount), 0)
      const newDueDate = allLinkedPayments.length > 0 ? allLinkedPayments[0].dueDate : null

      const totalChanged = invoice.totalAmount !== newTotalAmount
      const dueDateChanged = newDueDate && invoice.dueDate?.toISODate() !== newDueDate.toISODate()

      if (totalChanged || dueDateChanged) {
        invoice.totalAmount = newTotalAmount
        if (newDueDate) {
          invoice.dueDate = newDueDate
        }
        await invoice.save()
        console.log(
          `[UPDATE_ENROLLMENT_PAYMENTS] Updated invoice ${invoiceId}: totalAmount=${newTotalAmount}`
        )
      }
    }

    const unlinkedPayments = await StudentPayment.query()
      .where((q) => {
        q.where('studentHasLevelId', enrollment.id).orWhere((sub) => {
          sub.where('studentId', enrollment.studentId).whereNull('studentHasLevelId')
        })
      })
      .whereNull('invoiceId')
      .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
      .whereNotIn('type', ['AGREEMENT'])

    if (unlinkedPayments.length > 0) {
      // Link orphans in bulk
      const orphanIds = unlinkedPayments.filter((p) => !p.studentHasLevelId).map((p) => p.id)
      if (orphanIds.length > 0) {
        await StudentPayment.query()
          .whereIn('id', orphanIds)
          .update({ studentHasLevelId: enrollment.id })
      }

      try {
        await getQueueManager()
        for (const payment of unlinkedPayments) {
          await ReconcilePaymentInvoiceJob.dispatch({
            paymentId: payment.id,
            triggeredBy,
            source: 'update-enrollment-payments-job',
          })
        }
      } catch (error) {
        console.error('[UPDATE_ENROLLMENT_PAYMENTS] Failed to dispatch reconcile jobs:', error)
      }
    }
  }
}
