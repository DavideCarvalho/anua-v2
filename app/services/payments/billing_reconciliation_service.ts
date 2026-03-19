import locks from '@adonisjs/lock/services/main'
import { DateTime } from 'luxon'
import Invoice from '#models/invoice'
import StudentHasLevel from '#models/student_has_level'
import StudentPayment from '#models/student_payment'
import Contract from '#models/contract'
import ContractInterestConfig from '#models/contract_interest_config'
import MarkOverdueInvoicesJob from '#jobs/payments/mark_overdue_invoices_job'

const FINAL_INVOICE_STATUSES = ['PAID', 'CANCELLED', 'RENEGOTIATED'] as const
const INACTIVE_PAYMENT_STATUSES = ['CANCELLED', 'RENEGOTIATED'] as const

interface ReconcileOptions {
  keepUnpaidBeforePeriodClose?: boolean
}

interface InvoiceReconciliationResult {
  updated: boolean
  valueChanged: boolean
  staleChargeId: string | null
  contractId: string | null
}

export default class BillingReconciliationService {
  static async reconcileByPaymentId(paymentId: string, options?: ReconcileOptions): Promise<void> {
    const payment = await StudentPayment.find(paymentId)
    if (!payment) return

    if (payment.type === 'AGREEMENT') return

    const runReconciliation = async () => {
      await this.cleanupOrphanPayments(payment.studentId, options)

      await payment.refresh()

      if (payment.type === 'AGREEMENT') return

      const invoice = await this.resolveTargetInvoice(payment, options)
      if (!invoice) {
        return
      }

      if (
        !INACTIVE_PAYMENT_STATUSES.includes(
          payment.status as (typeof INACTIVE_PAYMENT_STATUSES)[number]
        )
      ) {
        if (payment.invoiceId !== invoice.id) {
          payment.invoiceId = invoice.id
          await payment.save()
        }
      }

      await this.reconcileByInvoiceId(invoice.id, options)
    }

    try {
      const lock = locks.createLock(
        `billing-reconcile:payment:${payment.studentId}:${payment.month}:${payment.year}`,
        '30s'
      )

      const [executed] = await lock.run(runReconciliation)

      if (!executed) {
        throw new Error(`Lock not acquired for payment ${paymentId}`)
      }
    } catch (error) {
      throw error
    }
  }

  static async reconcileByEnrollmentId(
    enrollmentId: string,
    options?: ReconcileOptions
  ): Promise<void> {
    const enrollment = await StudentHasLevel.find(enrollmentId)
    if (!enrollment) return

    const payments = await StudentPayment.query()
      .where((query) => {
        query.where('studentHasLevelId', enrollment.id).orWhere((subQuery) => {
          subQuery.where('studentId', enrollment.studentId).whereNull('studentHasLevelId')
        })
      })
      .whereNotIn('status', [...INACTIVE_PAYMENT_STATUSES])
      .whereNotIn('type', ['AGREEMENT'])
      .orderBy('year', 'asc')
      .orderBy('month', 'asc')

    for (const payment of payments) {
      await this.reconcileByPaymentId(payment.id, options)
    }
  }

  static async reconcileByInvoiceId(
    invoiceId: string,
    _options?: ReconcileOptions
  ): Promise<InvoiceReconciliationResult> {
    let result: InvoiceReconciliationResult = {
      updated: false,
      valueChanged: false,
      staleChargeId: null,
      contractId: null,
    }

    const runReconciliation = async () => {
      const invoice = await Invoice.query()
        .where('id', invoiceId)
        .whereNotIn('status', [...FINAL_INVOICE_STATUSES])
        .preload('payments', (query) => {
          query
            .whereNotIn('status', [...INACTIVE_PAYMENT_STATUSES])
            .whereNotIn('type', ['AGREEMENT'])
        })
        .first()

      if (!invoice) return

      const previousTotal = Number(invoice.totalAmount || 0)
      const previousBase = Number(invoice.baseAmount || 0)
      const previousDiscount = Number(invoice.discountAmount || 0)
      const previousFine = Number(invoice.fineAmount || 0)
      const previousInterest = Number(invoice.interestAmount || 0)
      const hadCharge = invoice.paymentGatewayId

      const activePayments = [...invoice.payments].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        if (a.month !== b.month) return a.month - b.month
        return a.dueDate.toMillis() - b.dueDate.toMillis()
      })

      const grossBaseAmount = activePayments.reduce(
        (sum, p) => sum + Number(p.totalAmount || p.amount),
        0
      )
      const netBaseAmount = activePayments.reduce((sum, p) => sum + Number(p.amount), 0)

      const earliestDueDate = activePayments[0]?.dueDate ?? invoice.dueDate
      const contractId = activePayments[0]?.contractId ?? invoice.contractId ?? null

      const contract = await this.resolveContractWithDiscounts(contractId)
      const discountAmount = this.calculateEarlyDiscountAmount(
        netBaseAmount,
        contract,
        earliestDueDate
      )

      const chargeableAmount = Math.max(0, netBaseAmount - discountAmount)

      const { fineAmount, interestAmount } = await this.calculateOverdueCharges({
        invoiceStatus: invoice.status,
        contractId,
        dueDate: earliestDueDate,
        chargeableAmount,
      })

      const totalAmount = Math.max(0, netBaseAmount - discountAmount + fineAmount + interestAmount)

      const changed =
        previousBase !== grossBaseAmount ||
        previousDiscount !== discountAmount ||
        previousFine !== fineAmount ||
        previousInterest !== interestAmount ||
        previousTotal !== totalAmount ||
        invoice.contractId !== contractId ||
        invoice.dueDate.toISODate() !== earliestDueDate.toISODate()

      if (!changed) {
        result = {
          updated: false,
          valueChanged: false,
          staleChargeId: null,
          contractId,
        }
        return
      }

      const valueChanged = previousTotal !== totalAmount

      invoice.baseAmount = grossBaseAmount
      invoice.discountAmount = discountAmount
      invoice.fineAmount = fineAmount
      invoice.interestAmount = interestAmount
      invoice.totalAmount = totalAmount
      invoice.contractId = contractId
      invoice.dueDate = earliestDueDate

      if (hadCharge && valueChanged) {
        invoice.paymentGatewayId = null
        invoice.invoiceUrl = null
        invoice.paymentGateway = null
        invoice.paymentMethod = null
      }

      await invoice.save()

      result = {
        updated: true,
        valueChanged,
        staleChargeId: hadCharge && valueChanged ? hadCharge : null,
        contractId,
      }
    }

    try {
      const lock = locks.createLock(`billing-reconcile:invoice:${invoiceId}`, '30s')
      const [executed] = await lock.run(runReconciliation)

      if (!executed) {
        throw new Error(`Lock not acquired for invoice ${invoiceId}`)
      }
    } catch (error) {
      throw error
    }

    await MarkOverdueInvoicesJob.dispatch({})

    return result
  }

  private static async resolveTargetInvoice(
    payment: StudentPayment,
    _options?: ReconcileOptions
  ): Promise<Invoice | null> {
    if (
      INACTIVE_PAYMENT_STATUSES.includes(
        payment.status as (typeof INACTIVE_PAYMENT_STATUSES)[number]
      )
    ) {
      return null
    }

    if (payment.invoiceId) {
      const existingInvoice = await Invoice.find(payment.invoiceId)
      if (existingInvoice) {
        return existingInvoice
      }
    }

    if (payment.studentHasLevelId) {
      const enrollment = await StudentHasLevel.query()
        .where('id', payment.studentHasLevelId)
        .preload('academicPeriod', (q) => q.whereNull('deletedAt').where('isActive', true))
        .first()

      if (!enrollment?.academicPeriod) {
        return null
      }
    }

    const existingByUniqueKey = await Invoice.query()
      .where('studentId', payment.studentId)
      .where('contractId', payment.contractId ?? null)
      .where('month', payment.month)
      .where('year', payment.year)
      .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
      .first()

    if (existingByUniqueKey) {
      return existingByUniqueKey
    }

    const existingByEnrollment = payment.studentHasLevelId
      ? await Invoice.query()
          .where('studentId', payment.studentId)
          .where('studentHasLevelId', payment.studentHasLevelId)
          .where('month', payment.month)
          .where('year', payment.year)
          .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
          .first()
      : null

    if (existingByEnrollment) {
      return existingByEnrollment
    }

    if (!payment.studentHasLevelId) {
      const existingByStudentPeriod = await Invoice.query()
        .where('studentId', payment.studentId)
        .where('month', payment.month)
        .where('year', payment.year)
        .whereNull('studentHasLevelId')
        .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
        .first()

      if (existingByStudentPeriod) {
        return existingByStudentPeriod
      }
    }

    try {
      return await Invoice.create({
        studentId: payment.studentId,
        studentHasLevelId: payment.studentHasLevelId,
        contractId: payment.contractId ?? null,
        type: 'MONTHLY',
        month: payment.month,
        year: payment.year,
        dueDate: payment.dueDate,
        status: 'OPEN',
        baseAmount: 0,
        discountAmount: 0,
        fineAmount: 0,
        interestAmount: 0,
        totalAmount: 0,
      })
    } catch (error) {
      if (!this.isInvoiceUniqueConflict(error)) {
        throw error
      }

      return Invoice.query()
        .where('studentId', payment.studentId)
        .where('contractId', payment.contractId ?? null)
        .where('month', payment.month)
        .where('year', payment.year)
        .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
        .first()
    }
  }

  private static isInvoiceUniqueConflict(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false

    const e = error as { code?: string; constraint?: string }
    return e.code === '23505' && e.constraint === 'uq_invoice_per_student_contract_month'
  }

  private static async cleanupOrphanPayments(
    studentId: string,
    options?: ReconcileOptions
  ): Promise<void> {
    const keepUnpaid = options?.keepUnpaidBeforePeriodClose ?? false

    const orphanPayments = await StudentPayment.query()
      .where('studentId', studentId)
      .whereNotNull('studentHasLevelId')
      .whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
      .preload('studentHasLevel', (q) => {
        q.preload('academicPeriod')
      })

    const paymentIdsToDelete: string[] = []

    for (const payment of orphanPayments) {
      const period = payment.studentHasLevel?.academicPeriod

      if (period && !period.deletedAt && period.isActive) {
        continue
      }

      if (payment.status === 'PAID') {
        continue
      }

      if (keepUnpaid && period?.deletedAt) {
        if (payment.dueDate < period.deletedAt) {
          continue
        }
      }

      paymentIdsToDelete.push(payment.id)
    }

    if (paymentIdsToDelete.length > 0) {
      await StudentPayment.query().whereIn('id', paymentIdsToDelete).update({ invoiceId: null })

      await StudentPayment.query().whereIn('id', paymentIdsToDelete).delete()
    }

    await Invoice.query()
      .where('studentId', studentId)
      .whereNotIn('status', ['PAID', 'CANCELLED', 'RENEGOTIATED'])
      .whereDoesntHave('payments', (q) => {
        q.whereNotIn('status', ['CANCELLED', 'RENEGOTIATED'])
      })
      .delete()
  }

  private static async resolveContractWithDiscounts(
    contractId: string | null
  ): Promise<Contract | null> {
    if (!contractId) return null

    return Contract.query().where('id', contractId).preload('earlyDiscounts').first()
  }

  private static calculateEarlyDiscountAmount(
    baseAmount: number,
    contract: Contract | null,
    dueDate: DateTime,
    today: DateTime = DateTime.now().startOf('day')
  ): number {
    if (!contract?.earlyDiscounts?.length || baseAmount <= 0) return 0

    const daysUntilDue = Math.floor(dueDate.startOf('day').diff(today, 'days').days)
    if (daysUntilDue <= 0) return 0

    const bestPercentage = contract.earlyDiscounts
      .filter(
        (discount) =>
          Number(discount.percentage) > 0 &&
          daysUntilDue >= Number(discount.daysBeforeDeadline ?? 0)
      )
      .reduce((max, discount) => Math.max(max, Number(discount.percentage)), 0)

    const rawDiscount = Math.round((baseAmount * bestPercentage) / 100)
    return Math.max(0, Math.min(baseAmount, rawDiscount))
  }

  private static async calculateOverdueCharges({
    invoiceStatus,
    contractId,
    dueDate,
    chargeableAmount,
  }: {
    invoiceStatus: string
    contractId: string | null
    dueDate: DateTime
    chargeableAmount: number
  }): Promise<{ fineAmount: number; interestAmount: number }> {
    if (invoiceStatus !== 'OVERDUE' || chargeableAmount <= 0 || !contractId) {
      return { fineAmount: 0, interestAmount: 0 }
    }

    const config = await ContractInterestConfig.query().where('contractId', contractId).first()
    if (!config) {
      return { fineAmount: 0, interestAmount: 0 }
    }

    const today = DateTime.now().startOf('day')
    const overdueDays = Math.floor(today.diff(dueDate.startOf('day'), 'days').days)

    if (overdueDays <= 0) {
      return { fineAmount: 0, interestAmount: 0 }
    }

    const fineAmount = Math.round(
      (chargeableAmount * Number(config.delayInterestPercentage || 0)) / 100
    )
    const interestAmount = Math.round(
      (chargeableAmount * Number(config.delayInterestPerDayDelayed || 0) * overdueDays) / 100
    )

    return {
      fineAmount: Math.max(0, fineAmount),
      interestAmount: Math.max(0, interestAmount),
    }
  }
}
