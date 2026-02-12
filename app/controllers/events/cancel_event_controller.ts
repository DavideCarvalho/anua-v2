import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import db from '@adonisjs/lucid/services/db'
import EventStudentPayment from '#models/event_student_payment'
import EventParentalConsent from '#models/event_parental_consent'
import ReconcilePaymentInvoiceJob from '#jobs/payments/reconcile_payment_invoice_job'
import { DateTime } from 'luxon'
import type StudentPayment from '#models/student_payment'
import EventDto from '#models/dto/event.dto'
import AppException from '#exceptions/app_exception'

type CancelResult =
  | { type: 'not_found' }
  | { type: 'completed' }
  | { type: 'already_cancelled' }
  | { type: 'ok'; event: Event }

export default class CancelEventController {
  async handle({ params, response, auth }: HttpContext) {
    const { id } = params
    const user = auth.user

    const paymentIdsToReconcile = new Set<string>()

    const result: CancelResult = await db.transaction(async (trx) => {
      const event = await Event.query({ client: trx }).where('id', id).first()

      if (!event) {
        return { type: 'not_found' }
      }

      if (event.status === 'COMPLETED') {
        return { type: 'completed' }
      }

      if (event.status === 'CANCELLED') {
        return { type: 'already_cancelled' }
      }

      event.status = 'CANCELLED'
      await event.save()

      await EventParentalConsent.query({ client: trx })
        .where('eventId', event.id)
        .where('status', 'PENDING')
        .update({
          status: 'EXPIRED',
          respondedAt: DateTime.now().toSQL(),
          denialReason: 'Evento cancelado pela escola',
        })

      const eventPaymentLinks = await EventStudentPayment.query({ client: trx })
        .where('eventId', event.id)
        .preload('studentPayment')

      for (const link of eventPaymentLinks) {
        const payment = link.studentPayment

        if (!payment || payment.status === 'CANCELLED') {
          continue
        }

        if (payment.status === 'PAID') {
          await this.markPaidPaymentForRefund(payment, link)
          continue
        }

        await this.cancelPendingPayment(payment, link)

        paymentIdsToReconcile.add(payment.id)
      }

      return { type: 'ok', event }
    })

    if (result.type === 'not_found') {
      throw AppException.notFound('Evento não encontrado')
    }

    if (result.type === 'completed') {
      throw AppException.badRequest('Não é possível cancelar um evento concluído')
    }

    if (result.type === 'already_cancelled') {
      throw AppException.badRequest('O evento já está cancelado')
    }

    const event = result.event

    if (paymentIdsToReconcile.size > 0) {
      try {
        for (const paymentId of paymentIdsToReconcile) {
          await ReconcilePaymentInvoiceJob.dispatch({
            paymentId,
            triggeredBy: user ? { id: user.id, name: user.name ?? 'Unknown' } : null,
            source: 'events.cancel',
          })
        }
      } catch (error) {
        console.error('[CANCEL_EVENT] Failed to dispatch reconcile payment job:', error)
      }
    }

    await event.load('organizer')
    await event.load('school')
    await event.load('eventAudiences')

    return response.ok(new EventDto(event))
  }

  private async markPaidPaymentForRefund(
    payment: StudentPayment,
    paymentLink: EventStudentPayment
  ) {
    payment.metadata = {
      ...(payment.metadata || {}),
      eventCancelledAt: new Date().toISOString(),
      eventCancelledNeedsRefund: true,
      source: 'events.cancel',
    }
    await payment.save()

    paymentLink.status = payment.status
    await paymentLink.save()
  }

  private async cancelPendingPayment(payment: StudentPayment, paymentLink: EventStudentPayment) {
    payment.status = 'CANCELLED'
    payment.metadata = {
      ...(payment.metadata || {}),
      cancelledAt: new Date().toISOString(),
      cancelReason: 'Evento cancelado pela escola',
      source: 'events.cancel',
    }
    await payment.save()

    paymentLink.status = payment.status
    await paymentLink.save()
  }
}
