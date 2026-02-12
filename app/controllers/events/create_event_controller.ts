import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import { createEventValidator } from '#validators/event'
import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import SendEventInvitationsJob from '#jobs/events/send_event_invitations_job'
import EventDto from '#models/dto/event.dto'
import {
  EventAudienceValidationError,
  syncEventAudience,
} from '#services/events/event_audience_service'
import AppException from '#exceptions/app_exception'

function hasExplicitTime(value: string) {
  return /[T\s]\d{2}:\d{2}/.test(value)
}

function combineDateAndTime(isoDate: string, time: string) {
  const datePart = isoDate.split('T')[0]
  return DateTime.fromISO(`${datePart}T${time}`)
}

export default class CreateEventController {
  async handle({ request, response, auth }: HttpContext) {
    const data = await request.validateUsing(createEventValidator)
    const user = auth.user!
    const hasAdditionalCosts = data.hasAdditionalCosts ?? false
    const additionalCostAmount =
      hasAdditionalCosts && data.additionalCostAmount !== undefined
        ? Math.round(data.additionalCostAmount)
        : null
    const additionalCostInstallments = hasAdditionalCosts
      ? (data.additionalCostInstallments ?? 1)
      : null
    const additionalCostDescription =
      hasAdditionalCosts && data.additionalCostDescription ? data.additionalCostDescription : null
    const parsedStartsAt = DateTime.fromISO(data.startsAt)
    const parsedEndsAt = data.endsAt ? DateTime.fromISO(data.endsAt) : null
    const isAllDay = data.isAllDay ?? false

    const startTime = isAllDay
      ? null
      : data.startTime || (hasExplicitTime(data.startsAt) ? parsedStartsAt.toFormat('HH:mm') : null)
    const endTime = isAllDay
      ? null
      : data.endTime ||
        (data.endsAt && parsedEndsAt && hasExplicitTime(data.endsAt)
          ? parsedEndsAt.toFormat('HH:mm')
          : null)

    if (!parsedStartsAt.isValid) {
      throw AppException.badRequest('Data de início inválida')
    }

    if (data.endsAt && (!parsedEndsAt || !parsedEndsAt.isValid)) {
      throw AppException.badRequest('Data de término inválida')
    }

    const startDate =
      !isAllDay && data.startTime && !hasExplicitTime(data.startsAt)
        ? combineDateAndTime(data.startsAt, data.startTime)
        : parsedStartsAt
    const endDate =
      data.endsAt && !isAllDay && data.endTime && !hasExplicitTime(data.endsAt)
        ? combineDateAndTime(data.endsAt, data.endTime)
        : parsedEndsAt

    if (!startDate.isValid) {
      throw AppException.badRequest('Data de início inválida')
    }

    if (endDate && !endDate.isValid) {
      throw AppException.badRequest('Data de término inválida')
    }

    let event: Event

    try {
      event = await db.transaction(async (trx) => {
        const eventEntity = await Event.create(
          {
            id: randomUUID(),
            title: data.title,
            description: data.description,
            location: data.location,
            type: data.type,
            schoolId: data.schoolId,
            maxParticipants: data.maxParticipants,
            // Validator provides startsAt, model expects startDate
            startDate,
            // Validator provides endsAt, model expects endDate
            endDate,
            startTime,
            endTime,
            organizerId: user.id,
            createdBy: user.id,
            status: 'DRAFT',
            visibility: data.visibility ?? 'INTERNAL',
            requiresParentalConsent: data.requiresParentalConsent ?? false,
            hasAdditionalCosts,
            additionalCostAmount,
            additionalCostInstallments,
            additionalCostDescription,
            // Use default values for fields not in validator
            priority: 'NORMAL',
            isAllDay,
            isOnline: false,
            isExternal: data.isExternal ?? false,
            requiresRegistration: false,
            allowComments: true,
            sendNotifications: true,
            isRecurring: false,
            currentParticipants: 0,
          },
          { client: trx }
        )

        await syncEventAudience(trx, eventEntity.id, eventEntity.schoolId, {
          audienceWholeSchool: data.audienceWholeSchool,
          audienceAcademicPeriodIds: data.audienceAcademicPeriodIds,
          audienceLevelIds: data.audienceLevelIds,
          audienceClassIds: data.audienceClassIds,
        })

        return eventEntity
      })
    } catch (error) {
      if (error instanceof EventAudienceValidationError) {
        throw AppException.badRequest(error.message)
      }
      throw error
    }

    await event.load('organizer')
    await event.load('school')
    await event.load('eventAudiences')

    if (!event.requiresParentalConsent) {
      return response.created(new EventDto(event))
    }

    try {
      await SendEventInvitationsJob.dispatch({
        eventId: event.id,
        triggeredBy: { id: user.id, name: user.name ?? 'Unknown' },
        source: 'events.create',
      })
    } catch (error) {
      console.error('[EVENT_CREATE] Failed to dispatch invitation job:', error)
    }

    return response.created(new EventDto(event))
  }
}
