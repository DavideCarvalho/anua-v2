import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import { createEventValidator } from '#validators/event'
import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'

export default class CreateEventController {
  async handle({ request, response, auth }: HttpContext) {
    const data = await request.validateUsing(createEventValidator)

    const event = await Event.create({
      id: randomUUID(),
      title: data.title,
      description: data.description,
      location: data.location,
      type: data.type,
      schoolId: data.schoolId,
      maxParticipants: data.maxParticipants,
      // Validator provides startsAt, model expects startDate
      startDate: DateTime.fromJSDate(data.startsAt),
      // Validator provides endsAt, model expects endDate
      endDate: data.endsAt ? DateTime.fromJSDate(data.endsAt) : null,
      organizerId: auth.user!.id,
      createdBy: auth.user!.id,
      status: 'DRAFT',
      visibility: data.visibility ?? 'SCHOOL_ONLY',
      requiresParentalConsent: data.requiresParentalConsent ?? false,
      // Use default values for fields not in validator
      priority: 'NORMAL',
      isAllDay: false,
      isOnline: false,
      isExternal: false,
      requiresRegistration: false,
      allowComments: true,
      sendNotifications: true,
      isRecurring: false,
      currentParticipants: 0,
    })

    await event.load('organizer')
    await event.load('school')

    return response.created(event)
  }
}
