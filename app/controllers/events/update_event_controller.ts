import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import Student from '#models/student'
import EventParticipant from '#models/event_participant'
import EventParentalConsent from '#models/event_parental_consent'
import EventStudentPayment from '#models/event_student_payment'
import { updateEventValidator } from '#validators/event'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import EventDto from '#models/dto/event.dto'
import SendEventInvitationsJob from '#jobs/events/send_event_invitations_job'
import ReconcilePaymentInvoiceJob from '#jobs/payments/reconcile_payment_invoice_job'
import {
  EventAudienceValidationError,
  type EventAudienceResolved,
  resolveEventAudienceConfig,
  syncEventAudience,
} from '#services/events/event_audience_service'
import AppException from '#exceptions/app_exception'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

function hasExplicitTime(value: string) {
  return /[T\s]\d{2}:\d{2}/.test(value)
}

function combineDateAndTime(isoDate: string, time: string) {
  const datePart = isoDate.split('T')[0]
  return DateTime.fromISO(`${datePart}T${time}`)
}

export default class UpdateEventController {
  async handle({ params, request, response, selectedSchoolIds, auth }: HttpContext) {
    const { id } = params
    const data = await request.validateUsing(updateEventValidator)
    const user = auth.user

    let result:
      | { type: 'not_found' }
      | { type: 'completed' }
      | { type: 'invalid_start_date' }
      | { type: 'invalid_end_date' }
      | {
          type: 'ok'
          event: Event
          shouldDispatchInvitations: boolean
          paymentIdsToReconcile: string[]
        }

    try {
      result = await db.transaction(async (trx) => {
        const query = Event.query({ client: trx }).where('id', id).preload('eventAudiences')

        if (selectedSchoolIds && selectedSchoolIds.length > 0) {
          query.whereIn('schoolId', selectedSchoolIds)
        }

        const event = await query.first()

        if (!event) {
          return { type: 'not_found' as const }
        }

        if (event.status === 'COMPLETED') {
          return { type: 'completed' as const }
        }

        const previousRequiresParentalConsent = event.requiresParentalConsent

        if (data.title !== undefined) event.title = data.title
        if (data.description !== undefined) event.description = data.description
        if (data.location !== undefined) event.location = data.location
        if (data.type !== undefined) event.type = data.type
        if (data.maxParticipants !== undefined) event.maxParticipants = data.maxParticipants
        if (data.visibility !== undefined) event.visibility = data.visibility
        if (data.isAllDay !== undefined) event.isAllDay = data.isAllDay
        if (data.isExternal !== undefined) event.isExternal = data.isExternal
        if (data.startTime !== undefined) event.startTime = data.startTime
        if (data.endTime !== undefined) event.endTime = data.endTime
        if (data.requiresParentalConsent !== undefined) {
          event.requiresParentalConsent = data.requiresParentalConsent
        }
        if (data.hasAdditionalCosts !== undefined)
          event.hasAdditionalCosts = data.hasAdditionalCosts
        if (data.additionalCostAmount !== undefined) {
          event.additionalCostAmount =
            data.additionalCostAmount !== null ? Math.round(data.additionalCostAmount) : null
        }
        if (data.additionalCostInstallments !== undefined) {
          event.additionalCostInstallments = data.additionalCostInstallments
        }
        if (data.additionalCostDescription !== undefined) {
          event.additionalCostDescription = data.additionalCostDescription
        }
        if (data.startsAt !== undefined) {
          const parsedStartsAt = DateTime.fromISO(data.startsAt)
          if (!parsedStartsAt.isValid) {
            return { type: 'invalid_start_date' as const }
          }

          const nextStartDate =
            !event.isAllDay && event.startTime && !hasExplicitTime(data.startsAt)
              ? combineDateAndTime(data.startsAt, event.startTime)
              : parsedStartsAt

          if (!nextStartDate.isValid) {
            return { type: 'invalid_start_date' as const }
          }

          event.startDate = nextStartDate
        }
        if (data.endsAt !== undefined) {
          if (!data.endsAt) {
            event.endDate = null
          } else {
            const parsedEndsAt = DateTime.fromISO(data.endsAt)
            if (!parsedEndsAt.isValid) {
              return { type: 'invalid_end_date' as const }
            }

            const nextEndDate =
              !event.isAllDay && event.endTime && !hasExplicitTime(data.endsAt)
                ? combineDateAndTime(data.endsAt, event.endTime)
                : parsedEndsAt

            if (!nextEndDate.isValid) {
              return { type: 'invalid_end_date' as const }
            }

            event.endDate = nextEndDate
          }
        }

        if (event.isAllDay) {
          event.startTime = null
          event.endTime = null
        }

        if (!event.hasAdditionalCosts) {
          event.additionalCostAmount = null
          event.additionalCostInstallments = null
          event.additionalCostDescription = null
        }

        const hasAudienceUpdate =
          data.audienceWholeSchool !== undefined ||
          data.audienceAcademicPeriodIds !== undefined ||
          data.audienceLevelIds !== undefined ||
          data.audienceClassIds !== undefined

        let shouldDispatchInvitations = false
        const paymentIdsToReconcile = new Set<string>()

        if (hasAudienceUpdate) {
          const currentAudience = resolveEventAudienceConfig(event.eventAudiences)

          const nextAudience: EventAudienceResolved = {
            audienceWholeSchool: data.audienceWholeSchool ?? currentAudience.audienceWholeSchool,
            audienceAcademicPeriodIds:
              data.audienceAcademicPeriodIds ?? currentAudience.audienceAcademicPeriodIds,
            audienceLevelIds: data.audienceLevelIds ?? currentAudience.audienceLevelIds,
            audienceClassIds: data.audienceClassIds ?? currentAudience.audienceClassIds,
          }

          const previousStudentIds = await this.getAudienceStudentIds(
            trx,
            event.schoolId,
            currentAudience
          )

          await syncEventAudience(trx, event.id, event.schoolId, {
            audienceWholeSchool: nextAudience.audienceWholeSchool,
            audienceAcademicPeriodIds: nextAudience.audienceAcademicPeriodIds,
            audienceLevelIds: nextAudience.audienceLevelIds,
            audienceClassIds: nextAudience.audienceClassIds,
          })

          const nextStudentIds = await this.getAudienceStudentIds(trx, event.schoolId, nextAudience)

          const nextStudentIdSet = new Set(nextStudentIds)
          const previousStudentIdSet = new Set(previousStudentIds)

          const removedStudentIds = previousStudentIds.filter(
            (studentId) => !nextStudentIdSet.has(studentId)
          )
          const addedStudentIds = nextStudentIds.filter(
            (studentId) => !previousStudentIdSet.has(studentId)
          )

          if (removedStudentIds.length > 0) {
            const removedPaymentLinks = await EventStudentPayment.query({ client: trx })
              .where('eventId', event.id)
              .whereIn('studentId', removedStudentIds)
              .preload('studentPayment')

            for (const link of removedPaymentLinks) {
              const payment = link.studentPayment

              if (payment) {
                if (payment.status === 'PAID') {
                  payment.metadata = {
                    ...(payment.metadata || {}),
                    source: 'events.update.audience.removed',
                    eventRemovedAt: new Date().toISOString(),
                    eventRemovedNeedsRefund: true,
                  }
                  await payment.useTransaction(trx).save()
                  paymentIdsToReconcile.add(payment.id)
                } else if (payment.status !== 'CANCELLED') {
                  payment.status = 'CANCELLED'
                  payment.metadata = {
                    ...(payment.metadata || {}),
                    source: 'events.update.audience.removed',
                    cancelledAt: new Date().toISOString(),
                    cancelReason: 'Aluno removido do público do evento',
                  }
                  await payment.useTransaction(trx).save()
                  paymentIdsToReconcile.add(payment.id)
                }
              }

              await link.delete()
            }

            await EventParticipant.query({ client: trx })
              .where('eventId', event.id)
              .whereIn('userId', removedStudentIds)
              .delete()

            await EventParentalConsent.query({ client: trx })
              .where('eventId', event.id)
              .whereIn('studentId', removedStudentIds)
              .delete()
          }

          shouldDispatchInvitations = event.requiresParentalConsent && addedStudentIds.length > 0
        }

        const hasPaidEventUpdate =
          data.hasAdditionalCosts !== undefined ||
          data.additionalCostAmount !== undefined ||
          data.additionalCostInstallments !== undefined ||
          data.startsAt !== undefined

        if (hasPaidEventUpdate) {
          const eventPaymentLinks = await EventStudentPayment.query({ client: trx })
            .where('eventId', event.id)
            .preload('studentPayment')

          for (const link of eventPaymentLinks) {
            const payment = link.studentPayment
            if (!payment) continue

            const hasValidAdditionalCost =
              event.hasAdditionalCosts &&
              event.additionalCostAmount !== null &&
              event.additionalCostAmount > 0

            if (!hasValidAdditionalCost) {
              if (payment.status === 'PAID') {
                payment.metadata = {
                  ...(payment.metadata || {}),
                  source: 'events.update.pricing',
                  eventPricingRemovedAt: new Date().toISOString(),
                  eventPricingRemovedNeedsRefund: true,
                }
                await payment.useTransaction(trx).save()
                paymentIdsToReconcile.add(payment.id)
                continue
              }

              if (payment.status !== 'CANCELLED') {
                payment.status = 'CANCELLED'
                payment.metadata = {
                  ...(payment.metadata || {}),
                  source: 'events.update.pricing',
                  cancelledAt: new Date().toISOString(),
                  cancelReason: 'Evento deixou de ter cobrança adicional',
                }
                await payment.useTransaction(trx).save()
                paymentIdsToReconcile.add(payment.id)
              }

              continue
            }

            if (payment.status === 'PAID' || payment.status === 'CANCELLED') {
              continue
            }

            const additionalCostAmount = event.additionalCostAmount as number
            payment.amount = additionalCostAmount
            payment.totalAmount = additionalCostAmount
            payment.installments = event.additionalCostInstallments ?? 1
            payment.dueDate = event.startDate
            payment.month = event.startDate.month
            payment.year = event.startDate.year
            payment.metadata = {
              ...(payment.metadata || {}),
              source: 'events.update.pricing',
              eventPriceUpdatedAt: new Date().toISOString(),
              eventId: event.id,
            }
            await payment.useTransaction(trx).save()
            paymentIdsToReconcile.add(payment.id)
          }
        }

        if (
          !previousRequiresParentalConsent &&
          event.requiresParentalConsent &&
          (hasAudienceUpdate || event.eventAudiences.length > 0)
        ) {
          shouldDispatchInvitations = true
        }

        await event.save()
        return {
          type: 'ok' as const,
          event,
          shouldDispatchInvitations,
          paymentIdsToReconcile: Array.from(paymentIdsToReconcile),
        }
      })
    } catch (error) {
      if (error instanceof EventAudienceValidationError) {
        throw AppException.badRequest(error.message)
      }
      throw error
    }

    if (result.type === 'not_found') {
      throw AppException.notFound('Evento não encontrado')
    }

    if (result.type === 'completed') {
      throw AppException.badRequest('Não é possível atualizar um evento concluído')
    }

    if (result.type === 'invalid_start_date') {
      throw AppException.badRequest('Data de início inválida')
    }

    if (result.type === 'invalid_end_date') {
      throw AppException.badRequest('Data de término inválida')
    }

    const event = result.event

    if (result.shouldDispatchInvitations) {
      try {
        await SendEventInvitationsJob.dispatch({
          eventId: event.id,
          source: 'events.update',
        })
      } catch (error) {
        console.error('[UPDATE_EVENT] Failed to dispatch invitation job:', error)
      }
    }

    if (result.paymentIdsToReconcile.length > 0) {
      try {
        for (const paymentId of result.paymentIdsToReconcile) {
          await ReconcilePaymentInvoiceJob.dispatch({
            paymentId,
            triggeredBy: user ? { id: user.id, name: user.name ?? 'Unknown' } : null,
            source: 'events.update',
          })
        }
      } catch (error) {
        console.error('[UPDATE_EVENT] Failed to dispatch reconcile payment job:', error)
      }
    }

    await event.load('organizer')
    await event.load('school')
    await event.load('eventAudiences')

    return response.ok(new EventDto(event))
  }

  private async getAudienceStudentIds(
    trx: TransactionClientContract,
    schoolId: string,
    audience: EventAudienceResolved
  ) {
    const query = Student.query({ client: trx })
      .where('enrollmentStatus', 'REGISTERED')
      .whereNotNull('classId')
      .whereHas('class', (classQ) => {
        classQ.where('schoolId', schoolId)
      })

    if (audience.audienceWholeSchool) {
      const rows = await query.select('Student.id')
      return rows.map((student) => student.id)
    }

    const hasAnySegment =
      audience.audienceAcademicPeriodIds.length > 0 ||
      audience.audienceLevelIds.length > 0 ||
      audience.audienceClassIds.length > 0

    if (!hasAnySegment) {
      return []
    }

    query.where((builder) => {
      if (audience.audienceClassIds.length > 0) {
        builder.orWhereIn('Student.classId', audience.audienceClassIds)
      }

      if (audience.audienceLevelIds.length > 0) {
        builder.orWhereHas('class', (classQ) => {
          classQ.whereIn('Class.levelId', audience.audienceLevelIds)
        })
      }

      if (audience.audienceAcademicPeriodIds.length > 0) {
        builder.orWhereHas('class', (classQ) => {
          classQ.whereHas('academicPeriods', (periodQ) => {
            periodQ.whereIn('AcademicPeriod.id', audience.audienceAcademicPeriodIds)
          })
        })
      }
    })

    const rows = await query.select('Student.id')
    return rows.map((student) => student.id)
  }
}
