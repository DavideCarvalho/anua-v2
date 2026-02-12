import type { HttpContext } from '@adonisjs/core/http'
import EventParentalConsent from '#models/event_parental_consent'
import { DateTime } from 'luxon'
import { respondConsentValidator } from '#validators/consent'
import db from '@adonisjs/lucid/services/db'
import Student from '#models/student'
import StudentPayment from '#models/student_payment'
import EventStudentPayment from '#models/event_student_payment'
import ReconcilePaymentInvoiceJob from '#jobs/payments/reconcile_payment_invoice_job'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import EventParentalConsentDto from '#models/dto/event_parental_consent.dto'
import AppException from '#exceptions/app_exception'

type RespondResult =
  | { type: 'ok'; consent: EventParentalConsent }
  | { type: 'not_found' }
  | { type: 'already_responded' }
  | { type: 'expired' }

export default class RespondConsentController {
  async handle({ auth, params, request, response }: HttpContext) {
    const user = auth.user!
    const { id } = params
    const { approved, notes } = await request.validateUsing(respondConsentValidator)
    const paymentIdsToReconcile = new Set<string>()

    const result: RespondResult = await db.transaction(async (trx) => {
      const consent = await EventParentalConsent.query({ client: trx })
        .where('id', id)
        .where('responsibleId', user.id)
        .preload('event')
        .first()

      if (!consent) {
        return { type: 'not_found' }
      }

      if (consent.status !== 'PENDING') {
        return { type: 'already_responded' }
      }

      if (consent.expiresAt && consent.expiresAt < DateTime.now()) {
        consent.status = 'EXPIRED'
        await consent.save()
        return { type: 'expired' }
      }

      consent.status = approved ? 'APPROVED' : 'DENIED'
      consent.respondedAt = DateTime.now()

      if (approved) {
        consent.approvalNotes = notes || null
      } else {
        consent.denialReason = notes || null
      }

      await consent.save()

      const event = consent.event

      if (!this.hasPaidAdditionalCosts(event)) {
        return { type: 'ok', consent }
      }

      if (approved) {
        await this.handleApprovedPaidEvent({ consent, trx, paymentIdsToReconcile })
      } else {
        await this.handleDeniedPaidEvent({ consent, trx, paymentIdsToReconcile })
      }

      return { type: 'ok', consent }
    })

    if (result.type === 'not_found') {
      throw AppException.notFound('Autorização não encontrada')
    }

    if (result.type === 'already_responded') {
      throw AppException.badRequest('Esta autorização já foi respondida')
    }

    if (result.type === 'expired') {
      throw AppException.badRequest('Esta autorização expirou')
    }

    if (paymentIdsToReconcile.size > 0) {
      const source = approved
        ? 'events.parental-consent.approved'
        : 'events.parental-consent.denied'

      try {
        await this.dispatchReconcileJobs(paymentIdsToReconcile, {
          id: user.id,
          name: user.name ?? 'Unknown',
          source,
        })
      } catch (error) {
        console.error('[RESPOND_CONSENT] Failed to dispatch reconcile payment job:', error)
      }
    }

    const consent = result.consent

    return response.ok(new EventParentalConsentDto(consent))
  }

  private hasPaidAdditionalCosts(event: EventParentalConsent['event']) {
    return Boolean(
      event.hasAdditionalCosts && event.additionalCostAmount && event.additionalCostAmount > 0
    )
  }

  private async dispatchReconcileJobs(
    paymentIds: Set<string>,
    payload: { id: string; name: string; source: string }
  ) {
    for (const paymentId of paymentIds) {
      await ReconcilePaymentInvoiceJob.dispatch({
        paymentId,
        triggeredBy: { id: payload.id, name: payload.name },
        source: payload.source,
      })
    }
  }

  private async handleApprovedPaidEvent({
    consent,
    trx,
    paymentIdsToReconcile,
  }: {
    consent: EventParentalConsent
    trx: TransactionClientContract
    paymentIdsToReconcile: Set<string>
  }) {
    const existingLink = await EventStudentPayment.query({ client: trx })
      .where('eventId', consent.eventId)
      .where('studentId', consent.studentId)
      .first()

    if (existingLink) {
      return
    }

    const student = await Student.query({ client: trx }).where('id', consent.studentId).first()

    if (!student?.contractId) {
      return
    }

    const event = consent.event

    const payment = await StudentPayment.create(
      {
        studentId: student.id,
        amount: event.additionalCostAmount!,
        month: event.startDate.month,
        year: event.startDate.year,
        type: 'OTHER',
        status: 'NOT_PAID',
        totalAmount: event.additionalCostAmount!,
        dueDate: event.startDate,
        installments: event.additionalCostInstallments ?? 1,
        installmentNumber: 1,
        discountPercentage: 0,
        contractId: student.contractId,
        classHasAcademicPeriodId: null,
        studentHasLevelId: null,
        metadata: {
          source: 'events.parental-consent.approved',
          eventId: event.id,
          eventTitle: event.title,
          eventParentalConsentId: consent.id,
        },
      },
      { client: trx }
    )

    await EventStudentPayment.create(
      {
        eventId: event.id,
        studentId: student.id,
        responsibleId: consent.responsibleId,
        eventParentalConsentId: consent.id,
        studentPaymentId: payment.id,
        status: payment.status,
      },
      { client: trx }
    )

    paymentIdsToReconcile.add(payment.id)
  }

  private async handleDeniedPaidEvent({
    consent,
    trx,
    paymentIdsToReconcile,
  }: {
    consent: EventParentalConsent
    trx: TransactionClientContract
    paymentIdsToReconcile: Set<string>
  }) {
    const hasAnyApprovedConsent = await EventParentalConsent.query({ client: trx })
      .where('eventId', consent.eventId)
      .where('studentId', consent.studentId)
      .where('status', 'APPROVED')
      .first()

    if (hasAnyApprovedConsent) {
      return
    }

    const paymentLink = await EventStudentPayment.query({ client: trx })
      .where('eventId', consent.eventId)
      .where('studentId', consent.studentId)
      .first()

    if (!paymentLink) {
      return
    }

    const payment = await StudentPayment.query({ client: trx })
      .where('id', paymentLink.studentPaymentId)
      .first()

    if (!payment) {
      return
    }

    if (payment.status === 'CANCELLED' || payment.status === 'PAID') {
      paymentLink.status = payment.status
      paymentLink.responsibleId = consent.responsibleId
      paymentLink.eventParentalConsentId = consent.id
      await paymentLink.save()
      return
    }

    payment.status = 'CANCELLED'
    payment.metadata = {
      ...(payment.metadata || {}),
      cancelledAt: new Date().toISOString(),
      cancelReason: 'Consentimento negado para evento',
      source: 'events.parental-consent.denied',
    }
    await payment.save()

    paymentLink.status = payment.status
    paymentLink.responsibleId = consent.responsibleId
    paymentLink.eventParentalConsentId = consent.id
    await paymentLink.save()

    paymentIdsToReconcile.add(payment.id)
  }
}
