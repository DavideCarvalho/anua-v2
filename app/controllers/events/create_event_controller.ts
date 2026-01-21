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
      additionalCostAmount: data.additionalCostAmount,
      additionalCostDescription: data.additionalCostDescription,
      startsAt: DateTime.fromJSDate(data.startsAt),
      endsAt: data.endsAt ? DateTime.fromJSDate(data.endsAt) : null,
      organizerId: auth.user!.id,
      status: 'DRAFT',
      visibility: data.visibility ?? 'SCHOOL_ONLY',
      requiresParentalConsent: data.requiresParentalConsent ?? false,
      hasAdditionalCosts: data.hasAdditionalCosts ?? false,
    })

    await event.load('organizer')
    await event.load('school')

    return response.created(event)
  }
}
